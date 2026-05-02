"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getArquetipoById } from "@/lib/data/arquetipos";
import { pedirRespuestaAsistente, type MensajeChat } from "@/lib/ia/asistente";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { Json } from "@/lib/types/database";

const schema = z.object({
  mensaje: z.string().min(1, "Escribe algo").max(2000, "Mensaje muy largo"),
  conversacionId: z.string().uuid().nullable().optional(),
});

export type EnviarMensajeState =
  | { status: "idle" }
  | {
      status: "ok";
      conversacionId: string;
      mensajes: MensajeChat[];
    }
  | { status: "error"; error: string };

export async function enviarMensaje(
  _prev: EnviarMensajeState,
  formData: FormData,
): Promise<EnviarMensajeState> {
  const parsed = schema.safeParse({
    mensaje: formData.get("mensaje"),
    conversacionId: formData.get("conversacionId") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/asistente");
  }

  // Rate limit antes de llamar a Anthropic (control de costo)
  const rl = await checkRateLimit(supabase, user.id, "asistente");
  if (!rl.ok) {
    return {
      status: "error",
      error: `Estás escribiendo muy rápido. Espera ${rl.retryAfterSeconds}s y reintenta.`,
    };
  }

  // Carga arquetipo del último diagnóstico (para contextualizar)
  type DiagnosticoLite = { arquetipo_id: number };
  const { data: ultimoDiag } = await supabase
    .from("diagnosticos")
    .select("arquetipo_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosticoLite>();

  const arquetipo = ultimoDiag
    ? (getArquetipoById(ultimoDiag.arquetipo_id) ?? null)
    : null;

  // Carga o crea conversación
  type ConversacionRow = { id: string; mensajes: MensajeChat[]; tokens_consumidos: number };
  let conversacion: ConversacionRow | null = null;

  if (parsed.data.conversacionId) {
    const { data } = await supabase
      .from("conversaciones_ia")
      .select("id, mensajes, tokens_consumidos")
      .eq("id", parsed.data.conversacionId)
      .eq("user_id", user.id)
      .single<ConversacionRow>();
    conversacion = data ?? null;
  }

  if (!conversacion) {
    const { data, error } = await supabase
      .from("conversaciones_ia")
      .insert({ user_id: user.id })
      .select("id, mensajes, tokens_consumidos")
      .single<ConversacionRow>();

    if (error || !data) {
      return {
        status: "error",
        error: error?.message ?? "No se pudo crear conversación",
      };
    }
    conversacion = { ...data, mensajes: [] };
  }

  const historial = Array.isArray(conversacion.mensajes)
    ? (conversacion.mensajes as MensajeChat[])
    : [];

  // Llama al asistente
  const respuesta = await pedirRespuestaAsistente({
    arquetipo,
    historial,
    nuevoMensaje: parsed.data.mensaje,
  });

  if (!respuesta.ok) {
    return { status: "error", error: respuesta.error };
  }

  const ahora = new Date().toISOString();
  const mensajesActualizados: MensajeChat[] = [
    ...historial,
    { role: "user", content: parsed.data.mensaje, ts: ahora },
    { role: "assistant", content: respuesta.respuesta, ts: new Date().toISOString() },
  ];

  const tokensTotales =
    conversacion.tokens_consumidos +
    respuesta.tokensInput +
    respuesta.tokensOutput;

  await supabase
    .from("conversaciones_ia")
    .update({
      mensajes: mensajesActualizados as unknown as Json,
      tokens_consumidos: tokensTotales,
    })
    .eq("id", conversacion.id);

  revalidatePath("/asistente");
  return {
    status: "ok",
    conversacionId: conversacion.id,
    mensajes: mensajesActualizados,
  };
}

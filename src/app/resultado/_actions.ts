"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcularDiagnostico, decodeRespuestas } from "@/lib/data/scoring";

export type GuardarDiagnosticoState =
  | { status: "idle" }
  | { status: "ok"; id: string }
  | { status: "error"; error: string };

export async function guardarDiagnostico(
  _prev: GuardarDiagnosticoState,
  formData: FormData,
): Promise<GuardarDiagnosticoState> {
  const encoded = formData.get("r");
  if (typeof encoded !== "string") {
    return { status: "error", error: "Faltan respuestas" };
  }

  const respuestas = decodeRespuestas(encoded);
  if (!respuestas) {
    return { status: "error", error: "Respuestas inválidas" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/resultado?r=${encoded}`)}`);
  }

  const resultado = calcularDiagnostico(respuestas);

  const { data, error } = await supabase
    .from("diagnosticos")
    .insert({
      user_id: user.id,
      respuestas: { ...respuestas },
      score_liquidez: resultado.liquidez,
      score_diversificacion: resultado.diversificacion,
      score_apalancamiento: resultado.apalancamiento,
      score_total: resultado.scoreTotal,
      arquetipo_id: resultado.arquetipo.id,
    })
    .select("id")
    .single();

  if (error) {
    return { status: "error", error: error.message };
  }

  revalidatePath("/dashboard");
  return { status: "ok", id: data.id };
}

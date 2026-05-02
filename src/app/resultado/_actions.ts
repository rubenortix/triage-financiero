"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calcularDiagnostico, decodeRespuestas } from "@/lib/data/scoring";
import {
  generarResumenRediagnostico,
  type ResumenEvolucion,
} from "@/lib/ia/generar-resumen-rediagnostico";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { Json } from "@/lib/types/database";

export type GuardarDiagnosticoState =
  | { status: "idle" }
  | {
      status: "ok";
      id: string;
      esRediagnostico: boolean;
      /** Si fue re-diagnóstico, indica si el resumen IA se generó OK */
      resumenGenerado: boolean;
    }
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

  // 1. Busca el diagnóstico previo más reciente (si existe)
  type DiagnosticoPrevio = {
    id: string;
    arquetipo_id: number;
    score_total: number;
  };
  const { data: previo } = await supabase
    .from("diagnosticos")
    .select("id, arquetipo_id, score_total")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosticoPrevio>();

  // 2. Inserta el nuevo diagnóstico
  type NuevoDiagnostico = { id: string };
  const { data: nuevo, error } = await supabase
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
    .single<NuevoDiagnostico>();

  if (error || !nuevo) {
    return {
      status: "error",
      error: error?.message ?? "No se pudo guardar el diagnóstico",
    };
  }

  const esRediagnostico = previo !== null;
  let resumenGenerado = false;

  // 3. Si es re-diagnóstico, genera resumen IA y lo guarda en la nueva fila
  if (previo) {
    // Rate limit antes de llamar a Claude
    const rl = await checkRateLimit(supabase, user.id, "rediagnostico");
    if (!rl.ok) {
      // Diagnóstico ya quedó guardado. Solo saltamos el resumen IA.
      revalidatePath("/dashboard");
      return {
        status: "ok",
        id: nuevo.id,
        esRediagnostico: true,
        resumenGenerado: false,
      };
    }

    const resumen = await generarResumenRediagnostico({
      diagnosticoAnteriorId: previo.id,
      diagnosticoAnteriorArquetipoId: previo.arquetipo_id,
      diagnosticoAnteriorScoreTotal: previo.score_total,
      diagnosticoActualArquetipoId: resultado.arquetipo.id,
      diagnosticoActualScoreTotal: resultado.scoreTotal,
    });

    if (resumen.ok) {
      const resumenData: ResumenEvolucion = resumen.resumen;
      await supabase
        .from("diagnosticos")
        .update({ resumen_evolucion: resumenData as unknown as Json })
        .eq("id", nuevo.id);
      resumenGenerado = true;
    }
    // Si falla, sigue adelante — el diagnóstico está guardado, lo del resumen
    // es complementario y se puede regenerar después.
  }

  revalidatePath("/dashboard");
  return {
    status: "ok",
    id: nuevo.id,
    esRediagnostico,
    resumenGenerado,
  };
}

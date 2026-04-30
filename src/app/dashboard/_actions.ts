"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generarPlan90Dias as generarPlanCore } from "@/lib/ia/generar-plan-90-dias";

export type GenerarPlanState =
  | { status: "idle" }
  | { status: "ok"; planId: string }
  | { status: "error"; error: string };

/**
 * Server Action que envuelve la generación del Plan 90 días.
 * La lógica de IA + persistencia vive en `@/lib/ia/generar-plan-90-dias.ts`
 * para que también pueda invocarse desde el flujo de "guardar diagnóstico".
 */
export async function generarPlan90Dias(
  _prev: GenerarPlanState,
  formData: FormData,
): Promise<GenerarPlanState> {
  const diagnosticoId = formData.get("diagnostico_id");
  if (typeof diagnosticoId !== "string") {
    return { status: "error", error: "Falta el id del diagnóstico" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Carga el diagnóstico (RLS garantiza que solo accede a los propios)
  type DiagnosticoLite = { id: string; arquetipo_id: number };
  const { data: diagnostico, error: dError } = await supabase
    .from("diagnosticos")
    .select("id, arquetipo_id")
    .eq("id", diagnosticoId)
    .single<DiagnosticoLite>();

  if (dError || !diagnostico) {
    return { status: "error", error: "Diagnóstico no encontrado" };
  }

  // Lee contexto del profile (etapa carrera, país)
  type ProfileLite = {
    pais: string | null;
    etapa_carrera: "residente" | "consolidado" | "senior" | null;
  };
  const { data: profile } = await supabase
    .from("profiles")
    .select("pais, etapa_carrera")
    .eq("id", user.id)
    .single<ProfileLite>();

  const result = await generarPlanCore({
    userId: user.id,
    diagnosticoId: diagnostico.id,
    arquetipoId: diagnostico.arquetipo_id,
    etapa: profile?.etapa_carrera ?? "consolidado",
    pais: profile?.pais ?? "Latinoamérica",
    supabase,
  });

  if (!result.ok) {
    return { status: "error", error: result.error };
  }

  revalidatePath("/dashboard");
  return { status: "ok", planId: result.planId };
}

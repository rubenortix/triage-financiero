"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_PLAN_90_DIAS } from "@/lib/data/prompts-ia";
import { getArquetipoById } from "@/lib/data/arquetipos";
import type { Json } from "@/lib/types/database";

export type GenerarPlanState =
  | { status: "idle" }
  | { status: "ok"; planId: string }
  | { status: "error"; error: string };

interface SemanaPlan {
  semana: number;
  titulo: string;
  descripcion: string;
  metricaExito: string;
}

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

  const arquetipo = getArquetipoById(diagnostico.arquetipo_id);
  if (!arquetipo) {
    return { status: "error", error: "Arquetipo inválido" };
  }

  // Lee contexto del profile
  type ProfileLite = {
    pais: string | null;
    etapa_carrera: "residente" | "consolidado" | "senior" | null;
  };
  const { data: profile } = await supabase
    .from("profiles")
    .select("pais, etapa_carrera")
    .eq("id", user.id)
    .single<ProfileLite>();

  const etapa = profile?.etapa_carrera ?? "consolidado";
  const pais = profile?.pais ?? "Latinoamérica";

  // Verifica que la API key esté configurada antes de llamar
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      status: "error",
      error:
        "ANTHROPIC_API_KEY no configurada. Agrégala a .env.local y reinicia el dev server.",
    };
  }

  // Llama a Claude Sonnet usando tool_use para garantizar JSON estructurado
  // (más robusto que parsear texto libre que puede traer comentarios)
  let semanas: SemanaPlan[];
  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODELS.sonnet,
      max_tokens: 4096,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: PROMPT_PLAN_90_DIAS.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: "guardar_plan_90_dias",
          description:
            "Guarda el plan de 12 semanas generado para el usuario. Llama esta herramienta con las 12 semanas estructuradas.",
          input_schema: {
            type: "object",
            properties: {
              semanas: {
                type: "array",
                minItems: 12,
                maxItems: 12,
                items: {
                  type: "object",
                  properties: {
                    semana: {
                      type: "integer",
                      minimum: 1,
                      maximum: 12,
                      description: "Número de semana (1-12)",
                    },
                    titulo: {
                      type: "string",
                      description: "Título corto de la semana, máximo 50 caracteres",
                    },
                    descripcion: {
                      type: "string",
                      description: "Descripción de 2-3 frases sobre qué hacer y por qué",
                    },
                    metricaExito: {
                      type: "string",
                      description: "Frase concreta y medible que indica que la semana se completó",
                    },
                  },
                  required: ["semana", "titulo", "descripcion", "metricaExito"],
                },
              },
            },
            required: ["semanas"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "guardar_plan_90_dias" },
      messages: [
        {
          role: "user",
          content: PROMPT_PLAN_90_DIAS.buildUser({ arquetipo, etapa, pais }),
        },
      ],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return {
        status: "error",
        error: "La IA no devolvió la estructura esperada. Reintenta.",
      };
    }

    const input = toolUse.input as { semanas?: SemanaPlan[] };
    if (!Array.isArray(input.semanas) || input.semanas.length !== 12) {
      return {
        status: "error",
        error: "La IA no devolvió 12 semanas. Reintenta.",
      };
    }

    semanas = input.semanas;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { status: "error", error: `Falló la generación: ${msg}` };
  }

  // Persiste el plan
  type PlanRow = { id: string };
  const { data: plan, error: pError } = await supabase
    .from("planes_90_dias")
    .insert({
      user_id: user.id,
      diagnostico_id: diagnosticoId,
      semanas: semanas as unknown as Json,
      model_used: MODELS.sonnet,
    })
    .select("id")
    .single<PlanRow>();

  if (pError || !plan) {
    return {
      status: "error",
      error: pError?.message ?? "No se pudo guardar el plan",
    };
  }

  revalidatePath("/dashboard");
  return { status: "ok", planId: plan.id };
}

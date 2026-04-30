/**
 * Helper compartido para generar el Plan 90 días con Claude Sonnet.
 * Lo usan tanto el Server Action manual del dashboard como el flujo
 * automático tras guardar el diagnóstico.
 *
 * Devuelve { ok, planId } o { ok: false, error } — nunca lanza.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_PLAN_90_DIAS } from "@/lib/data/prompts-ia";
import { getArquetipoById } from "@/lib/data/arquetipos";
import type { EtapaCarrera } from "@/lib/data/scoring";
import type { Json } from "@/lib/types/database";

export interface SemanaPlan {
  semana: number;
  titulo: string;
  descripcion: string;
  metricaExito: string;
}

interface Args {
  userId: string;
  diagnosticoId: string;
  arquetipoId: number;
  etapa: EtapaCarrera;
  pais: string;
  supabase: SupabaseClient;
}

type Resultado =
  | { ok: true; planId: string }
  | { ok: false; error: string };

export async function generarPlan90Dias(args: Args): Promise<Resultado> {
  const arquetipo = getArquetipoById(args.arquetipoId);
  if (!arquetipo) {
    return { ok: false, error: "Arquetipo inválido" };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error:
        "ANTHROPIC_API_KEY no configurada. Agrégala a .env.local y reinicia el dev server.",
    };
  }

  // Llama a Claude Sonnet con tool_use para JSON garantizado
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
                      description: "Título corto, max 50 caracteres",
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
          content: PROMPT_PLAN_90_DIAS.buildUser({
            arquetipo,
            etapa: args.etapa,
            pais: args.pais,
          }),
        },
      ],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { ok: false, error: "La IA no devolvió la estructura esperada" };
    }

    const input = toolUse.input as { semanas?: SemanaPlan[] };
    if (!Array.isArray(input.semanas) || input.semanas.length !== 12) {
      return { ok: false, error: "La IA no devolvió 12 semanas" };
    }

    semanas = input.semanas;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { ok: false, error: `Falló la generación: ${msg}` };
  }

  // Persiste
  type PlanRow = { id: string };
  const { data, error } = await args.supabase
    .from("planes_90_dias")
    .insert({
      user_id: args.userId,
      diagnostico_id: args.diagnosticoId,
      semanas: semanas as unknown as Json,
      model_used: MODELS.sonnet,
    })
    .select("id")
    .single<PlanRow>();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "No se pudo guardar el plan",
    };
  }

  return { ok: true, planId: data.id };
}

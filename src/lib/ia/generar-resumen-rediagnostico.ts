/**
 * Helper que genera el resumen de evolución entre dos diagnósticos
 * (anterior vs actual) usando Claude Sonnet con tool_use.
 *
 * Devuelve mejoras, alertas, y 3 acciones priorizadas para el siguiente mes.
 * Se persiste en diagnosticos.resumen_evolucion del NUEVO diagnóstico.
 */

import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_REDIAGNOSTICO } from "@/lib/data/prompts-ia";
import { getArquetipoById } from "@/lib/data/arquetipos";

export type Prioridad = "alta" | "media" | "baja";

export interface AccionPriorizada {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
}

export interface ResumenEvolucion {
  mejoras: string[];
  alertas: string[];
  acciones: AccionPriorizada[];
  diagnosticoAnteriorId: string;
  deltaScoreTotal: number;
  modelUsed: string;
}

interface Args {
  diagnosticoAnteriorId: string;
  diagnosticoAnteriorArquetipoId: number;
  diagnosticoAnteriorScoreTotal: number;
  diagnosticoActualArquetipoId: number;
  diagnosticoActualScoreTotal: number;
}

type Resultado =
  | { ok: true; resumen: ResumenEvolucion }
  | { ok: false; error: string };

export async function generarResumenRediagnostico(args: Args): Promise<Resultado> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY no configurada" };
  }

  const anteriorArq = getArquetipoById(args.diagnosticoAnteriorArquetipoId);
  const actualArq = getArquetipoById(args.diagnosticoActualArquetipoId);
  if (!anteriorArq || !actualArq) {
    return { ok: false, error: "Arquetipos no encontrados" };
  }

  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODELS.sonnet,
      max_tokens: 1500,
      temperature: 0.5,
      system: [
        {
          type: "text",
          text: PROMPT_REDIAGNOSTICO.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: "guardar_resumen_evolucion",
          description:
            "Guarda el análisis de la evolución del paciente entre dos diagnósticos consecutivos.",
          input_schema: {
            type: "object",
            properties: {
              mejoras: {
                type: "array",
                items: { type: "string" },
                description:
                  "Lista corta (1-4) de cosas que mejoraron desde el diagnóstico anterior. Frases concretas, no genéricas.",
              },
              alertas: {
                type: "array",
                items: { type: "string" },
                description:
                  "Lista corta (0-3) de regresiones o señales preocupantes. Vacío si no hay ninguna.",
              },
              acciones: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    titulo: {
                      type: "string",
                      description: "Acción concreta y corta (max 60 chars)",
                    },
                    descripcion: {
                      type: "string",
                      description:
                        "1-2 frases sobre por qué hacer esta acción y cómo medirla.",
                    },
                    prioridad: {
                      type: "string",
                      enum: ["alta", "media", "baja"],
                    },
                  },
                  required: ["titulo", "descripcion", "prioridad"],
                },
                description:
                  "Exactamente 3 acciones priorizadas para el siguiente mes, basadas en la evolución observada.",
              },
            },
            required: ["mejoras", "alertas", "acciones"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "guardar_resumen_evolucion" },
      messages: [
        {
          role: "user",
          content: PROMPT_REDIAGNOSTICO.buildUser({
            anterior: {
              arquetipo: anteriorArq,
              scoreTotal: args.diagnosticoAnteriorScoreTotal,
            },
            actual: {
              arquetipo: actualArq,
              scoreTotal: args.diagnosticoActualScoreTotal,
            },
          }),
        },
      ],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { ok: false, error: "La IA no devolvió la estructura esperada" };
    }

    const input = toolUse.input as {
      mejoras?: string[];
      alertas?: string[];
      acciones?: AccionPriorizada[];
    };

    if (
      !Array.isArray(input.mejoras) ||
      !Array.isArray(input.alertas) ||
      !Array.isArray(input.acciones) ||
      input.acciones.length !== 3
    ) {
      return { ok: false, error: "Estructura de evolución incompleta" };
    }

    return {
      ok: true,
      resumen: {
        mejoras: input.mejoras,
        alertas: input.alertas,
        acciones: input.acciones,
        diagnosticoAnteriorId: args.diagnosticoAnteriorId,
        deltaScoreTotal:
          args.diagnosticoActualScoreTotal - args.diagnosticoAnteriorScoreTotal,
        modelUsed: MODELS.sonnet,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { ok: false, error: `Falló el resumen: ${msg}` };
  }
}

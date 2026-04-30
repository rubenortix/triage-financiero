/**
 * Helper del asistente IA conversacional.
 * Usa Claude Haiku 4.5 — barato y rápido (~$0.003 por mensaje).
 *
 * Reglas duras (en el system prompt PROMPT_ASISTENTE):
 *  - NO da asesoría financiera específica (no instrumentos, no tickers, no montos)
 *  - Si la pregunta excede scope, deriva a asesor humano (Premium)
 *  - Máximo 150 palabras por respuesta
 *  - Disclaimer regulatorio en cada output
 *
 * El historial de la conversación se persiste en `conversaciones_ia.mensajes`
 * como array de { role, content, ts }.
 */

import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_ASISTENTE } from "@/lib/data/prompts-ia";
import type { Arquetipo } from "@/lib/data/arquetipos";

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

interface Args {
  arquetipo: Arquetipo | null;
  historial: MensajeChat[];
  nuevoMensaje: string;
}

type Resultado =
  | { ok: true; respuesta: string; tokensInput: number; tokensOutput: number }
  | { ok: false; error: string };

export async function pedirRespuestaAsistente(args: Args): Promise<Resultado> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY no configurada" };
  }

  // Limita el historial al últimos 10 turnos para controlar costo
  const historialRecortado = args.historial.slice(-20);

  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODELS.haiku,
      max_tokens: 600,
      temperature: 0.6,
      system: [
        {
          type: "text",
          text: PROMPT_ASISTENTE.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        // Mensaje inicial con contexto del arquetipo del usuario
        {
          role: "user",
          content: PROMPT_ASISTENTE.buildUser({
            arquetipo: args.arquetipo,
            pregunta:
              "[Inicio de conversación. Responde de forma breve para confirmar que entiendes el contexto.]",
          }),
        },
        {
          role: "assistant",
          content:
            "Listo. Tengo tu contexto. Pregúntame lo que necesites — sobre tu arquetipo, sobre conceptos financieros básicos, o sobre cómo usar Triage.",
        },
        // Historial real
        ...historialRecortado.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        // Mensaje nuevo
        {
          role: "user" as const,
          content: args.nuevoMensaje,
        },
      ],
    });

    const respuesta = response.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();

    if (!respuesta) {
      return { ok: false, error: "El asistente no devolvió respuesta" };
    }

    return {
      ok: true,
      respuesta,
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { ok: false, error: `Falló el asistente: ${msg}` };
  }
}

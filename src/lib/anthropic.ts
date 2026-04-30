import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "@/lib/env";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  }
  return _client;
}

export const MODELS = {
  /** Diagnóstico personalizado, plan 90 días, simuladores complejos, resumen rediagnóstico */
  sonnet: "claude-sonnet-4-6",
  /** Email mensual, asistente conversacional, personalización landing — barato y rápido */
  haiku: "claude-haiku-4-5-20251001",
} as const;

export const DISCLAIMER_IA =
  "Triage Financiero proporciona análisis educativo, no asesoría financiera personalizada. Para decisiones específicas de inversión, consulta con un asesor financiero acreditado en tu jurisdicción.";

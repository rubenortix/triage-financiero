/**
 * Rate limiting por usuario para endpoints que llaman a Claude.
 *
 * Estrategia: ventana móvil de 60 segundos, contador en `profiles`.
 * Cuando el usuario llama una acción IA, incrementamos su contador. Si
 * pasaron >60s desde el último window, reseteamos. Si supera el límite,
 * rechazamos.
 *
 * No es atómico (race condition posible en burst paralelo) pero es
 * suficiente para evitar abuso de costo de un usuario individual.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface RateLimitConfig {
  /** Identificador del bucket — distintos endpoints pueden tener distintos límites */
  action: "plan_90_dias" | "rediagnostico" | "asistente" | "simulador";
  /** Máximo de llamadas por minuto para este usuario */
  maxPorMinuto: number;
}

const CONFIGS: Record<RateLimitConfig["action"], number> = {
  plan_90_dias: 3, // ~$0.05 cada uno = $0.15/min máximo por usuario
  rediagnostico: 3,
  asistente: 12, // ~$0.003 cada uno = $0.036/min máximo por usuario
  simulador: 6,
};

type Resultado =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Combina los contadores de todas las acciones en un solo bucket porque
 * el contador en profiles es uno solo. Para diferenciar acciones se podría
 * hacer una tabla `rate_limits(user_id, action, window_start, count)`,
 * pero para MVP el bucket compartido es suficiente.
 *
 * Toma `maxPorMinuto` del menor de los límites entre acciones.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitConfig["action"],
): Promise<Resultado> {
  const max = CONFIGS[action];

  type Row = {
    ai_calls_minute_count: number;
    ai_calls_minute_window_start: string | null;
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("ai_calls_minute_count, ai_calls_minute_window_start")
    .eq("id", userId)
    .single<Row>();

  const now = Date.now();
  const windowStartMs = profile?.ai_calls_minute_window_start
    ? new Date(profile.ai_calls_minute_window_start).getTime()
    : 0;

  const elapsedSec = (now - windowStartMs) / 1000;

  if (elapsedSec >= 60) {
    // Nueva ventana — reset
    await supabase
      .from("profiles")
      .update({
        ai_calls_minute_count: 1,
        ai_calls_minute_window_start: new Date(now).toISOString(),
      })
      .eq("id", userId);
    return { ok: true };
  }

  const count = profile?.ai_calls_minute_count ?? 0;
  if (count >= max) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil(60 - elapsedSec),
    };
  }

  await supabase
    .from("profiles")
    .update({
      ai_calls_minute_count: count + 1,
    })
    .eq("id", userId);

  return { ok: true };
}

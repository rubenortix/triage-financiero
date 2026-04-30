/**
 * Lógica de scoring del diagnóstico Triage.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Lógica de Scoring".
 *
 * Cada eje (liquidez, diversificación, apalancamiento) se calcula sumando
 * sus 3 preguntas (1-3 pts cada una, total 3-9) y mapeando con thresholds
 * asimétricos a un valor 1-3 que se usa para identificar el arquetipo.
 *
 * Antes usábamos Math.round(sum/3), que colapsaba sumas {5,6,7} en eje=2 y
 * concentraba ~70% de usuarios en archetipos centrales. Los nuevos thresholds
 * distribuyen mejor.
 *
 * El score total se normaliza a 0-10 ("Pulso patrimonial") y de ahí se
 * deriva el nivel (Vulnerabilidad/Estabilidad/Optimización), garantizando
 * coherencia entre el badge y el número que ve el usuario.
 */

import type { OpcionLetra } from "./preguntas-diagnostico";
import { puntosDe } from "./preguntas-diagnostico";
import { findArquetipo, type Arquetipo, type Nivel } from "./arquetipos";

export type EtapaCarrera = "residente" | "consolidado" | "senior";

export interface RespuestasDiagnostico {
  /** Q1: contexto (no puntúa, solo personalización) */
  q1: OpcionLetra;
  /** Q2-Q4: liquidez */
  q2: OpcionLetra;
  q3: OpcionLetra;
  q4: OpcionLetra;
  /** Q5-Q7: diversificación */
  q5: OpcionLetra;
  q6: OpcionLetra;
  q7: OpcionLetra;
  /** Q8-Q10: apalancamiento */
  q8: OpcionLetra;
  q9: OpcionLetra;
  q10: OpcionLetra;
}

export interface ResultadoDiagnostico {
  liquidez: 1 | 2 | 3;
  diversificacion: 1 | 2 | 3;
  apalancamiento: 1 | 2 | 3;
  /** Pulso patrimonial 0-10 */
  scoreTotal: number;
  /** Derivado del scoreTotal para garantizar coherencia con el número */
  nivel: Nivel;
  arquetipo: Arquetipo;
  etapaCarrera: EtapaCarrera;
}

const ETAPA_POR_LETRA: Record<OpcionLetra, EtapaCarrera> = {
  a: "residente",
  b: "consolidado",
  c: "senior",
};

/**
 * Mapea la suma de 3 preguntas (rango 3-9) a un eje 1/2/3 con thresholds
 * asimétricos. Distribución bajo respuestas uniformes random:
 *   eje 1: 37% (sumas 3-5)
 *   eje 2: 26% (suma 6 — promedio puro)
 *   eje 3: 37% (sumas 7-9)
 */
function ejeDe(
  p1: OpcionLetra,
  p2: OpcionLetra,
  p3: OpcionLetra,
  ids: [number, number, number],
): 1 | 2 | 3 {
  const sum =
    (puntosDe(ids[0], p1) ?? 0) +
    (puntosDe(ids[1], p2) ?? 0) +
    (puntosDe(ids[2], p3) ?? 0);

  if (sum <= 5) return 1;
  if (sum === 6) return 2;
  return 3;
}

/**
 * Deriva el nivel del scoreTotal. La tabla del playbook:
 *   0-4  → Vulnerabilidad
 *   5-7  → Estabilidad
 *   8-10 → Optimización
 *
 * Antes mostrábamos `arquetipo.nivel` (hardcoded), que a veces contradecía
 * el scoreTotal mostrado. Ahora se derivan ambos del mismo origen.
 */
export function nivelDeScore(score: number): Nivel {
  if (score <= 4) return "Vulnerabilidad";
  if (score <= 7) return "Estabilidad";
  return "Optimización";
}

export function calcularDiagnostico(r: RespuestasDiagnostico): ResultadoDiagnostico {
  const liquidez = ejeDe(r.q2, r.q3, r.q4, [2, 3, 4]);
  const diversificacion = ejeDe(r.q5, r.q6, r.q7, [5, 6, 7]);
  const apalancamiento = ejeDe(r.q8, r.q9, r.q10, [8, 9, 10]);

  const arquetipo = findArquetipo(liquidez, diversificacion, apalancamiento);

  // Score total normalizado a 0-10. Suma de ejes va de 3 (peor) a 9 (mejor).
  const sumaEjes = liquidez + diversificacion + apalancamiento;
  const scoreTotal = Math.round(((sumaEjes - 3) / 6) * 10);

  return {
    liquidez,
    diversificacion,
    apalancamiento,
    scoreTotal,
    nivel: nivelDeScore(scoreTotal),
    arquetipo,
    etapaCarrera: ETAPA_POR_LETRA[r.q1],
  };
}

/**
 * Codifica respuestas como string de 10 letras (a/b/c) para pasar por URL.
 * Orden: q1, q2, q3, q4, q5, q6, q7, q8, q9, q10
 */
export function encodeRespuestas(r: RespuestasDiagnostico): string {
  return [r.q1, r.q2, r.q3, r.q4, r.q5, r.q6, r.q7, r.q8, r.q9, r.q10].join("");
}

const LETRAS_VALIDAS = new Set<OpcionLetra>(["a", "b", "c"]);

export function decodeRespuestas(s: string): RespuestasDiagnostico | null {
  if (s.length !== 10) return null;
  const letters = s.split("") as OpcionLetra[];
  if (!letters.every((l) => LETRAS_VALIDAS.has(l))) return null;
  const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10] = letters;
  return { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 };
}

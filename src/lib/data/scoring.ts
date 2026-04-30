/**
 * Lógica de scoring del diagnóstico Triage.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Lógica de Scoring".
 *
 * Cada eje (liquidez, diversificación, apalancamiento) se calcula como el
 * promedio redondeado de sus 3 preguntas asociadas (que valen 1, 2 o 3 pts cada una),
 * resultando en un valor 1-3 que se usa para mapear al arquetipo correcto.
 *
 * El score total se normaliza a una escala 0-10 ("Pulso patrimonial").
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
  nivel: Nivel;
  arquetipo: Arquetipo;
  etapaCarrera: EtapaCarrera;
}

const ETAPA_POR_LETRA: Record<OpcionLetra, EtapaCarrera> = {
  a: "residente",
  b: "consolidado",
  c: "senior",
};

function ejeDe(p1: OpcionLetra, p2: OpcionLetra, p3: OpcionLetra, ids: [number, number, number]): 1 | 2 | 3 {
  const sum =
    (puntosDe(ids[0], p1) ?? 0) +
    (puntosDe(ids[1], p2) ?? 0) +
    (puntosDe(ids[2], p3) ?? 0);
  // sum ∈ [3, 9] → mapeo a 1-3 con redondeo
  const eje = Math.round(sum / 3);
  return Math.max(1, Math.min(3, eje)) as 1 | 2 | 3;
}

export function calcularDiagnostico(r: RespuestasDiagnostico): ResultadoDiagnostico {
  const liquidez = ejeDe(r.q2, r.q3, r.q4, [2, 3, 4]);
  const diversificacion = ejeDe(r.q5, r.q6, r.q7, [5, 6, 7]);
  const apalancamiento = ejeDe(r.q8, r.q9, r.q10, [8, 9, 10]);

  const arquetipo = findArquetipo(liquidez, diversificacion, apalancamiento);

  // Score total normalizado a 0-10
  // Suma de ejes va de 3 (peor) a 9 (mejor) → ((sum - 3) / 6) * 10
  const sumaEjes = liquidez + diversificacion + apalancamiento;
  const scoreTotal = Math.round(((sumaEjes - 3) / 6) * 10);

  return {
    liquidez,
    diversificacion,
    apalancamiento,
    scoreTotal,
    nivel: arquetipo.nivel,
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

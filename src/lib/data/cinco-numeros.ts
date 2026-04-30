/**
 * "Los 5 Números que tienes que saber" — bloque visual clave de /resultado.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Los 5 Números".
 *
 * #1 — Tu Colchón:    meses de gastos cubiertos (de Q3)
 * #2 — Tu Dependencia: % patrimonio expuesto a un solo activo (de Q6)
 * #3 — Tu Peaje:      % ingresos en deudas (de Q8)
 * #4 — Costo de no actuar: USD perdidos en 10 años (de scoreTotal)
 * #5 — Si actúas hoy: USD ganados en 10 años (de scoreTotal)
 *
 * Disclaimer: estas son estimaciones basadas en patrones patrimoniales
 * de médicos con perfil similar. Retorno real esperado 7%, inflación 3%.
 * Rango ±30%.
 */

import type { OpcionLetra } from "./preguntas-diagnostico";

export type Color = "rojo" | "amarillo" | "verde";

export interface NumeroResultado {
  etiqueta: string;
  valor: string;
  detalle: string;
  color: Color;
}

export interface CincoNumeros {
  colchon: NumeroResultado;
  dependencia: NumeroResultado;
  peaje: NumeroResultado;
  costoNoActuar: NumeroResultado;
  siActuasHoy: NumeroResultado;
}

// ============== #1 — Tu Colchón (de Q3) ==============

const COLCHON: Record<OpcionLetra, { meses: number; display: string; color: Color }> = {
  a: { meses: 0.5, display: "menos de 1 mes", color: "rojo" },
  b: { meses: 2, display: "2 meses", color: "amarillo" },
  c: { meses: 5, display: "5+ meses", color: "verde" },
};

// ============== #2 — Tu Dependencia (de Q6 — concentración real) ==============
// Q6: si tu activo más grande pierde 50%, ¿qué % de patrimonio perderías?
// Esto es la métrica DIRECTA de concentración. Antes mezclábamos con Q5
// (cuántos tipos de activo) que es una proxy débil.

const DEPENDENCIA: Record<OpcionLetra, { pct: number; color: Color }> = {
  a: { pct: 70, color: "rojo" },     // >60% perdido → altísima concentración
  b: { pct: 45, color: "amarillo" }, // 30-60% perdido → concentración media
  c: { pct: 20, color: "verde" },    // <30% perdido → bien diversificado
};

// ============== #3 — Tu Peaje (de Q8) ==============

const PEAJE: Record<OpcionLetra, { pct: number; color: Color }> = {
  a: { pct: 50, color: "rojo" },
  b: { pct: 30, color: "amarillo" },
  c: { pct: 10, color: "verde" },
};

// ============== #4 #5 — Proyecciones a 10 años (de scoreTotal) ==============

interface Proyeccion {
  costoNoActuar: number;
  siActuasHoy: number;
  mensajeEspecial?: string;
}

const PROYECCIONES_POR_SCORE: Record<number, Proyeccion> = {
  0: { costoNoActuar: 350000, siActuasHoy: 550000 },
  1: { costoNoActuar: 350000, siActuasHoy: 550000 },
  2: { costoNoActuar: 350000, siActuasHoy: 550000 },
  3: { costoNoActuar: 300000, siActuasHoy: 480000 },
  4: { costoNoActuar: 250000, siActuasHoy: 400000 },
  5: { costoNoActuar: 180000, siActuasHoy: 300000 },
  6: { costoNoActuar: 130000, siActuasHoy: 220000 },
  7: { costoNoActuar: 100000, siActuasHoy: 180000 },
  8: { costoNoActuar: 60000, siActuasHoy: 120000 },
  9: { costoNoActuar: 20000, siActuasHoy: 80000 },
  10: {
    costoNoActuar: 0,
    siActuasHoy: 80000,
    mensajeEspecial:
      "Estás en zona maestra. El siguiente paso es diversificación internacional avanzada y gobernanza patrimonial.",
  },
};

function formatUSD(n: number): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function calcularCincoNumeros(args: {
  q3: OpcionLetra;
  q6: OpcionLetra;
  q8: OpcionLetra;
  scoreTotal: number;
}): CincoNumeros {
  const { q3, q6, q8, scoreTotal } = args;

  // Colchón (de Q3)
  const c = COLCHON[q3];
  const colchon: NumeroResultado = {
    etiqueta: "Tu colchón",
    valor: c.display,
    detalle:
      c.meses < 1
        ? "Construir un fondo de emergencia es lo más urgente."
        : c.meses < 3
          ? "Vas bien. Apunta a 3-6 meses para sentirte tranquilo."
          : "Excelente colchón. Te da margen para decisiones inteligentes.",
    color: c.color,
  };

  // Dependencia (de Q6 — concentración real)
  const d = DEPENDENCIA[q6];
  const dependencia: NumeroResultado = {
    etiqueta: "Tu dependencia",
    valor: `${d.pct}%`,
    detalle:
      d.pct >= 60
        ? "Tu patrimonio depende de un solo activo. Diversificar es prioridad."
        : d.pct >= 35
          ? "Diversificación moderada. Hay margen para mejorar el balance."
          : "Diversificación sana. Tu patrimonio está bien distribuido.",
    color: d.color,
  };

  // Peaje (de Q8)
  const p = PEAJE[q8];
  const peaje: NumeroResultado = {
    etiqueta: "Tu peaje mensual",
    valor: `${p.pct}%`,
    detalle:
      p.pct >= 40
        ? "Las deudas se están comiendo tu margen. Reducirlas libera flujo."
        : p.pct >= 20
          ? "Carga de deuda manejable. Vigila las tasas altas."
          : "Carga de deuda saludable. Tu flujo está libre.",
    color: p.color,
  };

  // Proyecciones (de scoreTotal)
  const proy =
    PROYECCIONES_POR_SCORE[Math.max(0, Math.min(10, Math.round(scoreTotal)))] ??
    PROYECCIONES_POR_SCORE[5];

  const costoNoActuar: NumeroResultado = {
    etiqueta: "Costo de no actuar",
    valor:
      proy.costoNoActuar === 0
        ? "Sin pérdida estimada"
        : formatUSD(proy.costoNoActuar),
    detalle:
      proy.mensajeEspecial ??
      "Estimación de patrimonio que dejarías de construir en 10 años si no ajustas tu estructura actual.",
    color: proy.costoNoActuar > 200000 ? "rojo" : proy.costoNoActuar > 80000 ? "amarillo" : "verde",
  };

  const siActuasHoy: NumeroResultado = {
    etiqueta: "Si actúas hoy",
    valor: formatUSD(proy.siActuasHoy),
    detalle:
      "Patrimonio adicional estimado a 10 años si optimizas tu estructura desde este mes.",
    color: "verde",
  };

  return { colchon, dependencia, peaje, costoNoActuar, siActuasHoy };
}

/**
 * "Los 5 Números que tienes que saber" — bloque visual clave de /resultado.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Los 5 Números".
 *
 * #1 — Tu Colchón:    meses de gastos cubiertos (de P3)
 * #2 — Tu Dependencia: % patrimonio en un solo activo (de P5+P6)
 * #3 — Tu Peaje:      % ingresos en deudas (de P8)
 * #4 — Costo de no actuar: USD perdidos en 10 años (de score total)
 * #5 — Si actúas hoy: USD ganados en 10 años (de score total)
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

// ============== #1 — Tu Colchón ==============

const COLCHON: Record<OpcionLetra, { meses: number; display: string; color: Color }> = {
  a: { meses: 0.5, display: "menos de 1 mes", color: "rojo" },
  b: { meses: 2, display: "2 meses", color: "amarillo" },
  c: { meses: 5, display: "5+ meses", color: "verde" },
};

// ============== #2 — Tu Dependencia ==============

const DEPENDENCIA: Record<string, { pct: number; color: Color }> = {
  // P5 letra a → no importa P6, todo concentrado
  "a-a": { pct: 85, color: "rojo" },
  "a-b": { pct: 85, color: "rojo" },
  "a-c": { pct: 85, color: "rojo" },
  // P5 = b
  "b-a": { pct: 65, color: "rojo" },
  "b-b": { pct: 45, color: "amarillo" },
  "b-c": { pct: 30, color: "amarillo" },
  // P5 = c
  "c-a": { pct: 40, color: "amarillo" },
  "c-b": { pct: 25, color: "verde" },
  "c-c": { pct: 15, color: "verde" },
};

// ============== #3 — Tu Peaje ==============

const PEAJE: Record<OpcionLetra, { pct: number; color: Color }> = {
  a: { pct: 50, color: "rojo" },
  b: { pct: 30, color: "amarillo" },
  c: { pct: 10, color: "verde" },
};

// ============== #4 #5 — Proyecciones a 10 años ==============

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
  q5: OpcionLetra;
  q6: OpcionLetra;
  q8: OpcionLetra;
  scoreTotal: number;
}): CincoNumeros {
  const { q3, q5, q6, q8, scoreTotal } = args;

  // Colchón
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

  // Dependencia
  const depKey = `${q5}-${q6}`;
  const d = DEPENDENCIA[depKey] ?? { pct: 50, color: "amarillo" as Color };
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

  // Peaje
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

  // Proyecciones
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

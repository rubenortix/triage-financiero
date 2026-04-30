/**
 * Las 10 preguntas del diagnóstico Triage Financiero.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Preguntas Diagnóstico".
 *
 * Q1 es solo de personalización (etapa de carrera) y NO puntúa.
 * Q2-Q4 miden Liquidez. Q5-Q7 miden Diversificación. Q8-Q10 miden Apalancamiento.
 *
 * Cada opción vale 1pt (a), 2pt (b) o 3pt (c).
 */

export type EjeDiagnostico = "liquidez" | "diversificacion" | "apalancamiento" | "contexto";

export type OpcionLetra = "a" | "b" | "c";

export interface Opcion {
  letra: OpcionLetra;
  texto: string;
  /** Puntos (1-3). null si la pregunta es solo de contexto. */
  puntos: 1 | 2 | 3 | null;
}

export interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  opciones: readonly [Opcion, Opcion, Opcion];
  eje: EjeDiagnostico;
}

export const PREGUNTAS: readonly Pregunta[] = [
  {
    id: 1,
    categoria: "Contexto",
    pregunta: "¿En qué etapa de tu carrera estás?",
    eje: "contexto",
    opciones: [
      {
        letra: "a",
        texto: "Residente o médico joven (menos de 3 años ejerciendo)",
        puntos: null,
      },
      {
        letra: "b",
        texto: "Especialista consolidado (3 a 10 años)",
        puntos: null,
      },
      {
        letra: "c",
        texto: "Médico senior (más de 10 años, patrimonio formado)",
        puntos: null,
      },
    ],
  },
  {
    id: 2,
    categoria: "Liquidez",
    pregunta:
      "Si mañana surge una oportunidad o gasto imprevisto de USD $5.000, ¿qué harías?",
    eje: "liquidez",
    opciones: [
      { letra: "a", texto: "Pediría prestado o vendería algo", puntos: 1 },
      {
        letra: "b",
        texto: "Lo cubro pero me descuadra varios meses",
        puntos: 2,
      },
      { letra: "c", texto: "Lo cubro sin afectar mi operación", puntos: 3 },
    ],
  },
  {
    id: 3,
    categoria: "Liquidez",
    pregunta:
      "Si dejaras de recibir ingresos mañana, ¿cuántos meses cubres con tu dinero disponible?",
    eje: "liquidez",
    opciones: [
      { letra: "a", texto: "Menos de 1 mes", puntos: 1 },
      { letra: "b", texto: "Entre 1 y 3 meses", puntos: 2 },
      { letra: "c", texto: "Más de 3 meses", puntos: 3 },
    ],
  },
  {
    id: 4,
    categoria: "Liquidez",
    pregunta:
      "¿Qué parte de tu patrimonio genera ingresos recurrentes (rentas, dividendos, intereses)?",
    eje: "liquidez",
    opciones: [
      {
        letra: "a",
        texto: "Casi nada, dependo 100% de mi trabajo",
        puntos: 1,
      },
      {
        letra: "b",
        texto: "Una parte pequeña, complementa pero no me sostiene",
        puntos: 2,
      },
      {
        letra: "c",
        texto: "Una parte significativa, cubriría mis gastos básicos",
        puntos: 3,
      },
    ],
  },
  {
    id: 5,
    categoria: "Diversificación",
    pregunta: "¿En cuántos tipos de activos distintos tienes tu patrimonio?",
    eje: "diversificacion",
    opciones: [
      {
        letra: "a",
        texto: "1 o ninguno (casi todo en una sola cosa)",
        puntos: 1,
      },
      { letra: "b", texto: "2 o 3 tipos", puntos: 2 },
      { letra: "c", texto: "4 o más tipos", puntos: 3 },
    ],
  },
  {
    id: 6,
    categoria: "Diversificación",
    pregunta:
      "Si tu activo más grande perdiera 50% de su valor mañana, ¿qué % de tu patrimonio total perderías?",
    eje: "diversificacion",
    opciones: [
      { letra: "a", texto: "Más del 60%", puntos: 1 },
      { letra: "b", texto: "Entre 30% y 60%", puntos: 2 },
      { letra: "c", texto: "Menos del 30%", puntos: 3 },
    ],
  },
  {
    id: 7,
    categoria: "Diversificación",
    pregunta: "¿En qué monedas y países está tu patrimonio?",
    eje: "diversificacion",
    opciones: [
      { letra: "a", texto: "Todo en una sola moneda y país", puntos: 1 },
      {
        letra: "b",
        texto: "Mayormente local, con algo en USD o fuera",
        puntos: 2,
      },
      { letra: "c", texto: "Diversificado internacionalmente", puntos: 3 },
    ],
  },
  {
    id: 8,
    categoria: "Apalancamiento",
    pregunta:
      "¿Qué % de tus ingresos mensuales se va en pagar deudas?",
    eje: "apalancamiento",
    opciones: [
      { letra: "a", texto: "Más del 40%", puntos: 1 },
      { letra: "b", texto: "Entre 20% y 40%", puntos: 2 },
      {
        letra: "c",
        texto: "Menos del 20%, o no tengo deudas",
        puntos: 3,
      },
    ],
  },
  {
    id: 9,
    categoria: "Apalancamiento",
    pregunta: "Tus deudas actuales, ¿qué tipo de tasas tienen?",
    eje: "apalancamiento",
    opciones: [
      {
        letra: "a",
        texto: "Altas (tarjetas, consumo, libre inversión)",
        puntos: 1,
      },
      {
        letra: "b",
        texto: "Mixtas (algunas altas, algunas bajas)",
        puntos: 2,
      },
      {
        letra: "c",
        texto: "Bajas y estratégicas, o ninguna",
        puntos: 3,
      },
    ],
  },
  {
    id: 10,
    categoria: "Apalancamiento",
    pregunta: "Si necesitaras crédito hoy, ¿cómo te verían los bancos?",
    eje: "apalancamiento",
    opciones: [
      { letra: "a", texto: "Me costaría o me saldría caro", puntos: 1 },
      {
        letra: "b",
        texto: "Me darían pero no en mejores condiciones",
        puntos: 2,
      },
      {
        letra: "c",
        texto: "Soy sujeto de crédito preferencial",
        puntos: 3,
      },
    ],
  },
] as const;

export const TOTAL_PREGUNTAS = PREGUNTAS.length;

/** Mapeo letra → puntos para una pregunta dada. Retorna null si Q1. */
export function puntosDe(preguntaId: number, letra: OpcionLetra): number | null {
  const pregunta = PREGUNTAS.find((p) => p.id === preguntaId);
  if (!pregunta) throw new Error(`Pregunta ${preguntaId} no existe`);
  const opcion = pregunta.opciones.find((o) => o.letra === letra);
  if (!opcion) throw new Error(`Opción ${letra} inválida en pregunta ${preguntaId}`);
  return opcion.puntos;
}

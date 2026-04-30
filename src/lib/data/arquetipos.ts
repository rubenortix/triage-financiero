/**
 * Los 27 arquetipos patrimoniales del Mapa Diagnóstico Triage.
 * Fuente de verdad: Triage_Mapa_Diagnostico.xlsx hoja "Matriz 27 Arquetipos".
 *
 * Cada arquetipo es la intersección única de tres ejes (cada uno 1-3):
 *   - Liquidez:        1=Limitada, 2=Funcional, 3=Estratégica
 *   - Diversificación: 1=Concentrada, 2=Equilibrada, 3=Diversificada
 *   - Apalancamiento:  1=Elevado, 2=Saludable, 3=Óptimo
 *
 * 3 × 3 × 3 = 27 combinaciones únicas.
 */

export type Nivel = "Vulnerabilidad" | "Estabilidad" | "Optimización";

export interface Arquetipo {
  id: number;
  codigo: string;
  nombre: string;
  liquidez: 1 | 2 | 3;
  diversificacion: 1 | 2 | 3;
  apalancamiento: 1 | 2 | 3;
  nivel: Nivel;
  diagnostico: string;
  ejemplo: string;
  recomendacion: string;
}

export const ARQUETIPOS: readonly Arquetipo[] = [
  {
    id: 1,
    codigo: "Limitada–Concentrada–Elevado",
    nombre: "Círculo de riesgo",
    liquidez: 1,
    diversificacion: 1,
    apalancamiento: 1,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Liquidez limitada, activos concentrados y deuda alta. Sin margen para imprevistos.",
    ejemplo:
      "Inversionista con una propiedad hipotecada al 80%, sin ahorros líquidos.",
    recomendacion:
      "Reducir deuda, construir fondo de emergencia, diversificar ingresos.",
  },
  {
    id: 2,
    codigo: "Limitada–Concentrada–Saludable",
    nombre: "Equilibrio frágil",
    liquidez: 1,
    diversificacion: 1,
    apalancamiento: 2,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Sin deuda peligrosa, pero dependiente de un único activo o ingreso.",
    ejemplo: "Persona con casa pagada, sin inversiones líquidas.",
    recomendacion:
      "Monetizar parte del activo, crear flujo, diversificar en instrumentos líquidos.",
  },
  {
    id: 3,
    codigo: "Limitada–Concentrada–Óptimo",
    nombre: "Liquidez atrapada",
    liquidez: 1,
    diversificacion: 1,
    apalancamiento: 3,
    nivel: "Vulnerabilidad",
    diagnostico: "Cero deuda, pero patrimonio inmovilizado en un solo activo.",
    ejemplo: "Inversionista con un terreno valioso sin flujo de caja.",
    recomendacion:
      "Monetizar el activo, invertir en renta mensual, mantener liquidez mínima del 20%.",
  },
  {
    id: 4,
    codigo: "Limitada–Equilibrada–Elevado",
    nombre: "Caja en tensión",
    liquidez: 1,
    diversificacion: 2,
    apalancamiento: 1,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Diversificación moderada, pero deuda alta restringe flujo.",
    ejemplo:
      "Inversionista con dos propiedades hipotecadas y sin excedente mensual.",
    recomendacion: "Refinanciar deuda, reducir pasivos, controlar costos.",
  },
  {
    id: 5,
    codigo: "Limitada–Equilibrada–Saludable",
    nombre: "Estabilidad vulnerable",
    liquidez: 1,
    diversificacion: 2,
    apalancamiento: 2,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Estructura equilibrada con deuda controlada, pero sin liquidez inmediata.",
    ejemplo:
      "Inversionista con una propiedad y un fondo de inversión, sin reservas.",
    recomendacion:
      "Crear fondo de emergencia, automatizar ahorro mensual, mejorar flujo operativo.",
  },
  {
    id: 6,
    codigo: "Limitada–Equilibrada–Óptimo",
    nombre: "Potencial contenido",
    liquidez: 1,
    diversificacion: 2,
    apalancamiento: 3,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Sin deuda y estructura sana, pero sin flujo operativo ni liquidez real.",
    ejemplo: "Inversionista con activos rentables pero sin ingresos mensuales.",
    recomendacion:
      "Generar flujo pasivo, liberar capital inmovilizado, mantener balance 70/30 inversión/efectivo.",
  },
  {
    id: 7,
    codigo: "Limitada–Diversificada–Elevado",
    nombre: "Diversificación sin flujo",
    liquidez: 1,
    diversificacion: 3,
    apalancamiento: 1,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Diversificación amplia, pero con deuda alta que neutraliza el rendimiento.",
    ejemplo: "Inversionista con varias propiedades hipotecadas.",
    recomendacion:
      "Reducir deuda, priorizar activos rentables, mantener ratio deuda/activos < 0.3.",
  },
  {
    id: 8,
    codigo: "Limitada–Diversificada–Saludable",
    nombre: "Estructura sólida, caja débil",
    liquidez: 1,
    diversificacion: 3,
    apalancamiento: 2,
    nivel: "Estabilidad",
    diagnostico:
      "Portafolio diversificado con deuda controlada, pero sin liquidez inmediata.",
    ejemplo:
      "Inversionista con fondos, acciones y bienes raíces, sin dinero disponible.",
    recomendacion:
      "Mantener 5% en efectivo, crear ingresos periódicos, ajustar flujos trimestrales.",
  },
  {
    id: 9,
    codigo: "Limitada–Diversificada–Óptimo",
    nombre: "Patrimonio inmóvil",
    liquidez: 1,
    diversificacion: 3,
    apalancamiento: 3,
    nivel: "Estabilidad",
    diagnostico:
      "Portafolio maduro sin deuda, pero con activos de baja liquidez.",
    ejemplo:
      "Inversionista con propiedades arrendadas y fondos cerrados sin flujo mensual.",
    recomendacion:
      "Rotar capital, incluir activos líquidos, liberar caja anual.",
  },
  {
    id: 10,
    codigo: "Funcional–Concentrada–Elevado",
    nombre: "Dependencia controlada",
    liquidez: 2,
    diversificacion: 1,
    apalancamiento: 1,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Flujo estable pero dependiente de un solo sector y apalancado.",
    ejemplo:
      "Inversionista con dos propiedades hipotecadas que generan arriendo.",
    recomendacion:
      "Consolidar deuda, diversificar ingresos, medir rentabilidad neta.",
  },
  {
    id: 11,
    codigo: "Funcional–Concentrada–Saludable",
    nombre: "Liquidez activa, foco estrecho",
    liquidez: 2,
    diversificacion: 1,
    apalancamiento: 2,
    nivel: "Vulnerabilidad",
    diagnostico:
      "Liquidez adecuada y deuda sana, pero portafolio concentrado.",
    ejemplo: "Inversionista con un solo fondo de inversión de renta fija.",
    recomendacion:
      "Ampliar exposición, diversificar geográficamente, revisar correlación de activos.",
  },
  {
    id: 12,
    codigo: "Funcional–Concentrada–Óptimo",
    nombre: "Caja fuerte pero rígida",
    liquidez: 2,
    diversificacion: 1,
    apalancamiento: 3,
    nivel: "Estabilidad",
    diagnostico:
      "Sin deuda, liquidez moderada, pero sin crecimiento ni diversificación.",
    ejemplo: "Inversionista con alto ahorro en dólares o CDT.",
    recomendacion:
      "Asignar parte a activos de crecimiento, definir meta de rentabilidad mínima.",
  },
  {
    id: 13,
    codigo: "Funcional–Equilibrada–Elevado",
    nombre: "Crecimiento apalancado",
    liquidez: 2,
    diversificacion: 2,
    apalancamiento: 1,
    nivel: "Estabilidad",
    diagnostico:
      "Diversificación media, crecimiento sostenido mediante deuda.",
    ejemplo:
      "Inversionista que usa crédito para adquirir fondos y acciones.",
    recomendacion:
      "Mantener ratio deuda/patrimonio < 0.4, alinear vencimientos y retornos.",
  },
  {
    id: 14,
    codigo: "Funcional–Equilibrada–Saludable",
    nombre: "Estructura funcional",
    liquidez: 2,
    diversificacion: 2,
    apalancamiento: 2,
    nivel: "Estabilidad",
    diagnostico:
      "Balance estable entre liquidez, deuda y diversificación.",
    ejemplo:
      "Inversionista con fondos, renta fija y propiedad libre de hipoteca.",
    recomendacion:
      "Monitorear retornos, automatizar aportes, ajustar ante inflación.",
  },
  {
    id: 15,
    codigo: "Funcional–Equilibrada–Óptimo",
    nombre: "Liquidez inteligente",
    liquidez: 2,
    diversificacion: 2,
    apalancamiento: 3,
    nivel: "Estabilidad",
    diagnostico:
      "Liquidez fuerte, deuda nula y portafolio equilibrado.",
    ejemplo: "Inversionista con bonos, ETFs y propiedad libre de deuda.",
    recomendacion:
      "Asignar 20% a crecimiento, mantener liquidez y medir riesgo país.",
  },
  {
    id: 16,
    codigo: "Funcional–Diversificada–Elevado",
    nombre: "Expansión con riesgo",
    liquidez: 2,
    diversificacion: 3,
    apalancamiento: 1,
    nivel: "Estabilidad",
    diagnostico:
      "Diversificación avanzada pero con deuda alta para expandir.",
    ejemplo: "Inversionista con inmuebles y préstamos en curso.",
    recomendacion:
      "Reducir apalancamiento, diversificar rentas, limitar deuda al 40%.",
  },
  {
    id: 17,
    codigo: "Funcional–Diversificada–Saludable",
    nombre: "Diversificación con control",
    liquidez: 2,
    diversificacion: 3,
    apalancamiento: 2,
    nivel: "Optimización",
    diagnostico:
      "Buen portafolio con deuda prudente y flujo estable.",
    ejemplo:
      "Inversionista con propiedades, fondos y acciones con crédito leve.",
    recomendacion:
      "Rebalancear anual, medir retorno por clase, planificar estructura fiscal.",
  },
  {
    id: 18,
    codigo: "Funcional–Diversificada–Óptimo",
    nombre: "Base sólida",
    liquidez: 2,
    diversificacion: 3,
    apalancamiento: 3,
    nivel: "Optimización",
    diagnostico:
      "Portafolio diversificado sin deuda y con flujo predecible.",
    ejemplo: "Inversionista con activos globales y una propiedad libre.",
    recomendacion:
      "Definir metas de crecimiento, explorar inversión alternativa.",
  },
  {
    id: 19,
    codigo: "Estratégica–Concentrada–Elevado",
    nombre: "Liquidez sin dirección",
    liquidez: 3,
    diversificacion: 1,
    apalancamiento: 1,
    nivel: "Estabilidad",
    diagnostico:
      "Liquidez alta pero mal distribuida y endeudamiento significativo.",
    ejemplo:
      "Inversionista con efectivo alto y deudas activas en un solo tipo de activo.",
    recomendacion:
      "Reducir deuda, diversificar, definir propósito patrimonial.",
  },
  {
    id: 20,
    codigo: "Estratégica–Concentrada–Saludable",
    nombre: "Capital concentrado, controlado",
    liquidez: 3,
    diversificacion: 1,
    apalancamiento: 2,
    nivel: "Estabilidad",
    diagnostico:
      "Liquidez alta, deuda sana pero concentración excesiva.",
    ejemplo:
      "Inversionista con la mayoría del patrimonio en finca raíz local.",
    recomendacion:
      "Diversificar 10–15%, incorporar activos líquidos y alternativos.",
  },
  {
    id: 21,
    codigo: "Estratégica–Concentrada–Óptimo",
    nombre: "Liquidez ociosa",
    liquidez: 3,
    diversificacion: 1,
    apalancamiento: 3,
    nivel: "Optimización",
    diagnostico:
      "Sin deuda y con liquidez abundante pero inactiva.",
    ejemplo:
      "Inversionista con USD 200k sin invertir en cuentas remuneradas.",
    recomendacion:
      "Asignar liquidez a inversiones escalonadas, mantener 20% líquido.",
  },
  {
    id: 22,
    codigo: "Estratégica–Equilibrada–Elevado",
    nombre: "Crecimiento ambicioso",
    liquidez: 3,
    diversificacion: 2,
    apalancamiento: 1,
    nivel: "Optimización",
    diagnostico:
      "Liquidez sólida y portafolio diversificado pero apalancado.",
    ejemplo:
      "Inversionista con propiedades y fondos financiados con crédito.",
    recomendacion:
      "Evaluar rentabilidad neta vs. costo financiero, reducir deuda progresivamente.",
  },
  {
    id: 23,
    codigo: "Estratégica–Equilibrada–Saludable",
    nombre: "Solidez integral",
    liquidez: 3,
    diversificacion: 2,
    apalancamiento: 2,
    nivel: "Optimización",
    diagnostico:
      "Liquidez estable, deuda prudente y diversificación equilibrada.",
    ejemplo:
      "Inversionista con activos en renta fija, variable y propiedad.",
    recomendacion:
      "Monitorear portafolio, rebalancear y fortalecer estructura legal.",
  },
  {
    id: 24,
    codigo: "Estratégica–Equilibrada–Óptimo",
    nombre: "Estructura eficiente",
    liquidez: 3,
    diversificacion: 2,
    apalancamiento: 3,
    nivel: "Optimización",
    diagnostico:
      "Liquidez estratégica, sin deuda, diversificación controlada.",
    ejemplo: "Inversionista con portafolio internacional balanceado.",
    recomendacion:
      "Implementar métricas de performance, ampliar exposición global.",
  },
  {
    id: 25,
    codigo: "Estratégica–Diversificada–Elevado",
    nombre: "Capital agresivo",
    liquidez: 3,
    diversificacion: 3,
    apalancamiento: 1,
    nivel: "Optimización",
    diagnostico:
      "Diversificación avanzada con uso intensivo de apalancamiento.",
    ejemplo:
      "Inversionista sofisticado que usa deuda para expandirse globalmente.",
    recomendacion:
      "Controlar ratio deuda/patrimonio, cubrir riesgo cambiario y de tasas.",
  },
  {
    id: 26,
    codigo: "Estratégica–Diversificada–Saludable",
    nombre: "Modelo sólido",
    liquidez: 3,
    diversificacion: 3,
    apalancamiento: 2,
    nivel: "Optimización",
    diagnostico:
      "Estructura avanzada, deuda prudente, diversificación madura.",
    ejemplo:
      "Inversionista con propiedades y portafolios internacionales.",
    recomendacion:
      "Rebalancear anualmente, planificar fiscalmente y mantener liquidez de 6 meses.",
  },
  {
    id: 27,
    codigo: "Estratégica–Diversificada–Óptimo",
    nombre: "Arquitectura patrimonial",
    liquidez: 3,
    diversificacion: 3,
    apalancamiento: 3,
    nivel: "Optimización",
    diagnostico:
      "Liquidez estratégica, portafolio global y sin deuda. Nivel maestro.",
    ejemplo:
      "Inversionista con trusts o family office personal, portafolio global.",
    recomendacion:
      "Formalizar gobernanza patrimonial, sucesión e inversión de impacto.",
  },
] as const;

/**
 * Busca un arquetipo por sus tres ejes. Cada combinación (1-3, 1-3, 1-3)
 * mapea a exactamente un arquetipo de los 27.
 */
export function findArquetipo(
  liquidez: 1 | 2 | 3,
  diversificacion: 1 | 2 | 3,
  apalancamiento: 1 | 2 | 3,
): Arquetipo {
  const match = ARQUETIPOS.find(
    (a) =>
      a.liquidez === liquidez &&
      a.diversificacion === diversificacion &&
      a.apalancamiento === apalancamiento,
  );
  if (!match) {
    throw new Error(
      `Arquetipo no encontrado para L=${liquidez}, D=${diversificacion}, A=${apalancamiento}`,
    );
  }
  return match;
}

export function getArquetipoById(id: number): Arquetipo | undefined {
  return ARQUETIPOS.find((a) => a.id === id);
}

/**
 * Lógica matemática de los simuladores. Los cálculos numéricos NUNCA los hace IA —
 * solo código tradicional. La IA después interpreta el resultado.
 */

export interface InputDeudaVsInversion {
  /** Monto disponible que se podría usar para una de dos cosas */
  monto: number;
  /** Tasa anual efectiva de la deuda (en %, ej. 28 para 28% EA) */
  tasaDeudaPctEA: number;
  /** Retorno anual esperado de la inversión (en %, ej. 8 para 8% EA real) */
  retornoEsperadoPctEA: number;
  /** Plazo en años */
  plazoAnos: number;
}

export interface OutputDeudaVsInversion {
  /**
   * Cuánto te ahorras en intereses si pagas la deuda hoy en lugar de pagarla
   * gradualmente durante el plazo. Equivale al "valor futuro" de no pagarla.
   */
  ahorroPagandoDeuda: number;
  /**
   * Cuánto se vuelve la inversión si inviertes el monto al retorno esperado
   * durante el plazo (interés compuesto).
   */
  vfInvirtiendo: number;
  /**
   * Diferencia entre invertir y pagar deuda. Positivo = invertir gana.
   * Negativo = pagar deuda gana.
   */
  ventajaInvertir: number;
  /** Recomendación heurística basada en la diferencia */
  recomendacion: "pagar_deuda" | "invertir" | "indiferente";
}

/**
 * Compara pagar deuda vs invertir el mismo monto durante el mismo plazo.
 *
 * Asume:
 * - Tasa de deuda y retorno esperado son anuales efectivas, ya netas de impuestos
 * - El monto se aplica de una sola vez (lump sum)
 * - No considera amortización gradual, ni costos de oportunidad de liquidez
 *
 * Es una aproximación didáctica, no asesoría financiera.
 */
export function calcularDeudaVsInversion(
  inputs: InputDeudaVsInversion,
): OutputDeudaVsInversion {
  const { monto, tasaDeudaPctEA, retornoEsperadoPctEA, plazoAnos } = inputs;

  const rDeuda = tasaDeudaPctEA / 100;
  const rInversion = retornoEsperadoPctEA / 100;

  // Si pagas la deuda hoy: te ahorras los intereses futuros sobre ese monto.
  // Equivale al valor futuro al que crecería la deuda.
  const ahorroPagandoDeuda = monto * Math.pow(1 + rDeuda, plazoAnos) - monto;

  // Si inviertes hoy: el monto crece al retorno compuesto.
  const vfInvirtiendo = monto * Math.pow(1 + rInversion, plazoAnos) - monto;

  const ventajaInvertir = vfInvirtiendo - ahorroPagandoDeuda;

  // Banda de "indiferencia" del 10% del monto original — debajo de eso no hay
  // ventaja material clara dado el ruido de las proyecciones
  const banda = Math.max(0.05 * monto, 200);
  let recomendacion: OutputDeudaVsInversion["recomendacion"];
  if (ventajaInvertir > banda) recomendacion = "invertir";
  else if (ventajaInvertir < -banda) recomendacion = "pagar_deuda";
  else recomendacion = "indiferente";

  return {
    ahorroPagandoDeuda: Math.round(ahorroPagandoDeuda),
    vfInvirtiendo: Math.round(vfInvirtiendo),
    ventajaInvertir: Math.round(ventajaInvertir),
    recomendacion,
  };
}

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

// ============================================================
// Simulador #2: ¿Compro inmueble o invierto la cuota inicial?
// ============================================================

export interface InputInmuebleVsAhorro {
  /** Precio del inmueble en USD */
  precioInmueble: number;
  /** Cuota inicial que tienes ahorrada en USD */
  cuotaInicial: number;
  /** Plazo de la hipoteca en años (típico 15-30) */
  plazoHipotecaAnos: number;
  /** Tasa anual efectiva de la hipoteca, en % (típico 8-13 LatAm) */
  tasaHipotecaPctEA: number;
  /** Apreciación anual esperada del inmueble, en % EA real */
  apreciacionPctEA: number;
  /** Retorno esperado de la inversión alternativa (ETF, bonos, etc.) */
  retornoAlternativaPctEA: number;
  /** Plazo de comparación en años (cuándo "vendes y comparas") */
  plazoSimulacionAnos: number;
}

export interface OutputInmuebleVsAhorro {
  /** Pago mensual de la hipoteca (informativo, no se compara) */
  pagoMensualHipoteca: number;
  /** Saldo de la hipoteca al final del plazo de simulación */
  saldoHipotecaFinal: number;
  /** Valor del inmueble al final con apreciación compuesta */
  valorInmuebleFinal: number;
  /** Equity del inmueble = valor - saldo hipoteca */
  equityInmuebleFinal: number;
  /** Intereses totales pagados en el plazo de simulación */
  interesesPagados: number;
  /** Valor futuro de invertir solo la cuota inicial al retorno alternativo */
  vfInversionAlternativa: number;
  /** Equity inmueble - VF alternativa. Positivo = inmueble gana */
  ventajaInmueble: number;
  recomendacion: "comprar_inmueble" | "invertir" | "indiferente";
}

/**
 * Compara comprar un inmueble (con financiamiento) vs invertir la cuota
 * inicial al mismo plazo en una alternativa líquida.
 *
 * SIMPLIFICACIONES (NO es asesoría):
 * - Asume que el médico cubre la cuota mensual de la hipoteca con su salario
 *   (no toca la cuota inicial ni la inversión alternativa).
 * - No considera renta de arriendo (asume que el médico vive en el inmueble).
 * - No considera impuestos (predial, ganancia de capital, deducciones).
 * - No considera mantenimiento ni costos de cierre.
 * - Asume tasa fija (no UVR ni tasa variable).
 *
 * Para decisiones reales, consulta con un asesor financiero acreditado.
 */
export function calcularInmuebleVsAhorro(
  inputs: InputInmuebleVsAhorro,
): OutputInmuebleVsAhorro {
  const {
    precioInmueble,
    cuotaInicial,
    plazoHipotecaAnos,
    tasaHipotecaPctEA,
    apreciacionPctEA,
    retornoAlternativaPctEA,
    plazoSimulacionAnos,
  } = inputs;

  const principal = Math.max(0, precioInmueble - cuotaInicial);
  const tasaMensualEA = Math.pow(1 + tasaHipotecaPctEA / 100, 1 / 12) - 1;
  const nMesesHipoteca = plazoHipotecaAnos * 12;
  const nMesesSimulacion = Math.min(plazoSimulacionAnos, plazoHipotecaAnos) * 12;

  // PMT — pago mensual fijo
  const pagoMensualHipoteca =
    principal === 0
      ? 0
      : (principal * tasaMensualEA) /
        (1 - Math.pow(1 + tasaMensualEA, -nMesesHipoteca));

  // Saldo hipoteca después de N meses (fórmula de amortización)
  let saldoHipotecaFinal: number;
  if (plazoSimulacionAnos >= plazoHipotecaAnos) {
    saldoHipotecaFinal = 0;
  } else {
    const factor = Math.pow(1 + tasaMensualEA, nMesesSimulacion);
    saldoHipotecaFinal =
      principal * factor -
      pagoMensualHipoteca * ((factor - 1) / tasaMensualEA);
    saldoHipotecaFinal = Math.max(0, saldoHipotecaFinal);
  }

  // Intereses pagados acumulados en el plazo de simulación
  const mesesPagados = Math.min(nMesesSimulacion, nMesesHipoteca);
  const totalPagado = pagoMensualHipoteca * mesesPagados;
  const principalAmortizado = principal - saldoHipotecaFinal;
  const interesesPagados = Math.max(0, totalPagado - principalAmortizado);

  // Valor del inmueble al final con apreciación compuesta
  const valorInmuebleFinal =
    precioInmueble *
    Math.pow(1 + apreciacionPctEA / 100, plazoSimulacionAnos);

  // Equity = lo que vale - lo que aún debes
  const equityInmuebleFinal = valorInmuebleFinal - saldoHipotecaFinal;

  // Alternativa: cuota inicial invertida al retorno esperado
  const vfInversionAlternativa =
    cuotaInicial * Math.pow(1 + retornoAlternativaPctEA / 100, plazoSimulacionAnos);

  const ventajaInmueble = equityInmuebleFinal - vfInversionAlternativa;
  const banda = Math.max(0.05 * cuotaInicial, 1000);
  let recomendacion: OutputInmuebleVsAhorro["recomendacion"];
  if (ventajaInmueble > banda) recomendacion = "comprar_inmueble";
  else if (ventajaInmueble < -banda) recomendacion = "invertir";
  else recomendacion = "indiferente";

  return {
    pagoMensualHipoteca: Math.round(pagoMensualHipoteca),
    saldoHipotecaFinal: Math.round(saldoHipotecaFinal),
    valorInmuebleFinal: Math.round(valorInmuebleFinal),
    equityInmuebleFinal: Math.round(equityInmuebleFinal),
    interesesPagados: Math.round(interesesPagados),
    vfInversionAlternativa: Math.round(vfInversionAlternativa),
    ventajaInmueble: Math.round(ventajaInmueble),
    recomendacion,
  };
}

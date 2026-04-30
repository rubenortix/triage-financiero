"use client";

import { useActionState } from "react";
import { Calculator, Loader2, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/utils";
import {
  simularDeudaVsInversion,
  type SimulacionDeudaState,
} from "../_actions";

const initial: SimulacionDeudaState = { status: "idle" };

export function SimuladorForm() {
  const [state, formAction, pending] = useActionState(
    simularDeudaVsInversion,
    initial,
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,1.2fr]">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-600" />
            Inputs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pon los datos de tu situación. Todo es estimado.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto">
                Monto disponible (USD)
              </Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                inputMode="decimal"
                step="100"
                min="100"
                placeholder="10000"
                defaultValue={
                  state.status === "ok" ? state.inputs.monto : undefined
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasaDeuda">
                Tasa anual de tu deuda (% EA)
              </Label>
              <Input
                id="tasaDeuda"
                name="tasaDeuda"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                placeholder="28"
                defaultValue={
                  state.status === "ok"
                    ? state.inputs.tasaDeudaPctEA
                    : undefined
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Ej: tarjeta de crédito 28%, libre inversión 22%, hipoteca 11%
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retornoEsperado">
                Retorno esperado de inversión (% EA)
              </Label>
              <Input
                id="retornoEsperado"
                name="retornoEsperado"
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="8"
                defaultValue={
                  state.status === "ok"
                    ? state.inputs.retornoEsperadoPctEA
                    : undefined
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Real esperado: ETF global 7%, renta fija USD 5%, finca raíz 6%
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plazoAnos">Plazo (años)</Label>
              <Input
                id="plazoAnos"
                name="plazoAnos"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                max="40"
                placeholder="10"
                defaultValue={
                  state.status === "ok" ? state.inputs.plazoAnos : undefined
                }
                required
              />
            </div>

            {state.status === "error" && (
              <p className="text-sm text-pulse-700">{state.error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {pending ? "Calculando…" : "Calcular"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            Resultado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.status !== "ok" ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground py-12">
              <p>Llena los datos a la izquierda para ver el comparativo.</p>
            </div>
          ) : (
            <ResultadoSimulacion state={state} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultadoSimulacion({
  state,
}: {
  state: Extract<SimulacionDeudaState, { status: "ok" }>;
}) {
  const { inputs, output, interpretacion } = state;

  const recomLabel = {
    invertir: "Invertir gana",
    pagar_deuda: "Pagar deuda gana",
    indiferente: "Casi indiferente",
  }[output.recomendacion];

  const recomColor = {
    invertir: "optimizacion" as const,
    pagar_deuda: "vulnerabilidad" as const,
    indiferente: "estabilidad" as const,
  }[output.recomendacion];

  return (
    <div className="space-y-5">
      <div>
        <Badge variant={recomColor} className="text-sm px-3 py-1">
          {recomLabel}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ResultadoCard
          icon={<Wallet className="h-4 w-4" />}
          titulo="Si pagas la deuda hoy"
          valor={formatUSD(output.ahorroPagandoDeuda)}
          detalle="Ahorro en intereses a lo largo del plazo"
        />
        <ResultadoCard
          icon={<TrendingUp className="h-4 w-4" />}
          titulo="Si inviertes el monto"
          valor={formatUSD(output.vfInvirtiendo)}
          detalle="Ganancia compuesta al final del plazo"
        />
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Diferencia
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {output.ventajaInvertir >= 0 ? "+" : "−"}
          {formatUSD(Math.abs(output.ventajaInvertir))}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {output.ventajaInvertir >= 0
            ? "A favor de invertir."
            : "A favor de pagar la deuda."}
        </p>
      </div>

      {interpretacion && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs uppercase tracking-wider text-brand-700 font-medium">
            Lectura para tu arquetipo
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-line">
            {interpretacion}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground border-t border-border pt-3">
        Cálculo simplificado de interés compuesto. No considera amortización
        gradual, impuestos, ni el costo de oportunidad de la liquidez. Para
        decisiones reales, consulta con un asesor financiero acreditado.
      </p>
    </div>
  );
}

function ResultadoCard({
  icon,
  titulo,
  valor,
  detalle,
}: {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  detalle: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wide">{titulo}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{valor}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        {detalle}
      </p>
    </div>
  );
}

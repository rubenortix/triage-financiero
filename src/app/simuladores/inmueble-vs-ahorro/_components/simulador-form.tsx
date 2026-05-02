"use client";

import { useActionState } from "react";
import {
  Calculator,
  Loader2,
  TrendingUp,
  Home,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/utils";
import {
  simularInmuebleVsAhorro,
  type SimulacionInmuebleState,
} from "../_actions";

const initial: SimulacionInmuebleState = { status: "idle" };

export function SimuladorForm() {
  const [state, formAction, pending] = useActionState(
    simularInmuebleVsAhorro,
    initial,
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-700" />
            Inputs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tipea los datos. Todo es estimado.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="precioInmueble">Precio del inmueble (USD)</Label>
              <Input
                id="precioInmueble"
                name="precioInmueble"
                type="number"
                step="1000"
                min="1000"
                placeholder="120000"
                defaultValue={
                  state.status === "ok" ? state.inputs.precioInmueble : undefined
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuotaInicial">Cuota inicial disponible (USD)</Label>
              <Input
                id="cuotaInicial"
                name="cuotaInicial"
                type="number"
                step="500"
                min="500"
                placeholder="30000"
                defaultValue={
                  state.status === "ok" ? state.inputs.cuotaInicial : undefined
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="plazoHipotecaAnos">Hipoteca (años)</Label>
                <Input
                  id="plazoHipotecaAnos"
                  name="plazoHipotecaAnos"
                  type="number"
                  step="1"
                  min="1"
                  max="40"
                  placeholder="20"
                  defaultValue={
                    state.status === "ok"
                      ? state.inputs.plazoHipotecaAnos
                      : undefined
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasaHipotecaPctEA">Tasa (% EA)</Label>
                <Input
                  id="tasaHipotecaPctEA"
                  name="tasaHipotecaPctEA"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="11"
                  defaultValue={
                    state.status === "ok"
                      ? state.inputs.tasaHipotecaPctEA
                      : undefined
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="apreciacionPctEA">Apreciación (% EA)</Label>
                <Input
                  id="apreciacionPctEA"
                  name="apreciacionPctEA"
                  type="number"
                  step="0.5"
                  placeholder="4"
                  defaultValue={
                    state.status === "ok"
                      ? state.inputs.apreciacionPctEA
                      : undefined
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retornoAlternativaPctEA">Alt. (% EA)</Label>
                <Input
                  id="retornoAlternativaPctEA"
                  name="retornoAlternativaPctEA"
                  type="number"
                  step="0.5"
                  placeholder="7"
                  defaultValue={
                    state.status === "ok"
                      ? state.inputs.retornoAlternativaPctEA
                      : undefined
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plazoSimulacionAnos">
                Plazo de comparación (años)
              </Label>
              <Input
                id="plazoSimulacionAnos"
                name="plazoSimulacionAnos"
                type="number"
                step="1"
                min="1"
                max="40"
                placeholder="10"
                defaultValue={
                  state.status === "ok"
                    ? state.inputs.plazoSimulacionAnos
                    : undefined
                }
                required
              />
            </div>

            {state.status === "error" && (
              <p className="text-sm text-pulse-700">{state.error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={pending}
            >
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-700" />
            Resultado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.status !== "ok" ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground py-12">
              <p>Llena los datos a la izquierda para ver el comparativo.</p>
            </div>
          ) : (
            <Resultado state={state} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Resultado({
  state,
}: {
  state: Extract<SimulacionInmuebleState, { status: "ok" }>;
}) {
  const { inputs, output, interpretacion } = state;

  const recomLabel = {
    comprar_inmueble: "Inmueble gana",
    invertir: "Invertir gana",
    indiferente: "Casi indiferente",
  }[output.recomendacion];

  const recomColor = {
    comprar_inmueble: "optimizacion" as const,
    invertir: "estabilidad" as const,
    indiferente: "outline" as const,
  }[output.recomendacion];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={recomColor} className="text-sm px-3 py-1">
          {recomLabel}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">
          a {inputs.plazoSimulacionAnos} años
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ResCard
          icon={<Home className="h-4 w-4" />}
          titulo="Equity inmueble"
          valor={formatUSD(output.equityInmuebleFinal)}
          detalle={`Valor proyectado ${formatUSD(output.valorInmuebleFinal)} − saldo hipoteca ${formatUSD(output.saldoHipotecaFinal)}`}
        />
        <ResCard
          icon={<Coins className="h-4 w-4" />}
          titulo="Si inviertes la cuota inicial"
          valor={formatUSD(output.vfInversionAlternativa)}
          detalle="Crecimiento compuesto de la cuota inicial al retorno alternativo"
        />
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Diferencia
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
          {output.ventajaInmueble >= 0 ? "+" : "−"}
          {formatUSD(Math.abs(output.ventajaInmueble))}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {output.ventajaInmueble >= 0
            ? "A favor del inmueble (apalancamiento + apreciación)."
            : "A favor de invertir la cuota inicial líquida."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pago mensual hipoteca
          </p>
          <p className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatUSD(output.pagoMensualHipoteca)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Intereses pagados
          </p>
          <p className="mt-1 font-mono text-lg font-medium tabular-nums">
            {formatUSD(output.interesesPagados)}
          </p>
        </div>
      </div>

      {interpretacion && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-medium">
            Lectura para tu arquetipo
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-line">
            {interpretacion}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground border-t border-border pt-3 leading-relaxed">
        Asume que cubres la cuota mensual con tu salario, no incluye
        impuestos, mantenimiento ni costos de cierre. Tasa fija. Para
        decisiones reales consulta con un asesor acreditado.
      </p>
    </div>
  );
}

function ResCard({
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
        <span className="text-xs uppercase tracking-wider">{titulo}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {valor}
      </p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        {detalle}
      </p>
    </div>
  );
}

import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArquetipoById } from "@/lib/data/arquetipos";
import { cn } from "@/lib/utils";
import type { ResumenEvolucion } from "@/lib/ia/generar-resumen-rediagnostico";

interface DiagnosticoLite {
  id: string;
  score_total: number;
  score_liquidez: number;
  score_diversificacion: number;
  score_apalancamiento: number;
  arquetipo_id: number;
  created_at: string;
}

interface Props {
  anterior: DiagnosticoLite;
  actual: DiagnosticoLite;
  resumen: ResumenEvolucion | null;
}

export function ComparativaCard({ anterior, actual, resumen }: Props) {
  const arqAnterior = getArquetipoById(anterior.arquetipo_id);
  const arqActual = getArquetipoById(actual.arquetipo_id);
  const cambioArquetipo = anterior.arquetipo_id !== actual.arquetipo_id;
  const delta = actual.score_total - anterior.score_total;
  const dias = Math.round(
    (new Date(actual.created_at).getTime() -
      new Date(anterior.created_at).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="border-brand-200 bg-brand-50/30">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">Tu evolución</CardTitle>
          <Badge variant="outline">
            {dias === 0
              ? "hace minutos"
              : dias === 1
                ? "hace 1 día"
                : `hace ${dias} días`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparativa con tu pulso anterior del{" "}
          {new Date(anterior.created_at).toLocaleDateString("es", {
            day: "numeric",
            month: "long",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bloque pulso antes/después */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pulso patrimonial
          </p>
          <div className="mt-2 flex items-center gap-4 sm:gap-6 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Antes</p>
              <p className="text-3xl font-semibold tabular-nums">
                {anterior.score_total}
                <span className="text-base text-muted-foreground">/10</span>
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Ahora</p>
              <p className="text-3xl font-semibold tabular-nums text-brand-700">
                {actual.score_total}
                <span className="text-base text-muted-foreground">/10</span>
              </p>
            </div>
            <DeltaBadge delta={delta} />
          </div>
        </div>

        {/* Bloque ejes */}
        <div className="grid gap-3 sm:grid-cols-3">
          <EjeBox
            label="Liquidez"
            antes={anterior.score_liquidez}
            ahora={actual.score_liquidez}
          />
          <EjeBox
            label="Diversificación"
            antes={anterior.score_diversificacion}
            ahora={actual.score_diversificacion}
          />
          <EjeBox
            label="Apalancamiento"
            antes={anterior.score_apalancamiento}
            ahora={actual.score_apalancamiento}
          />
        </div>

        {/* Bloque arquetipo */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Arquetipo patrimonial
          </p>
          {cambioArquetipo ? (
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground line-through">
                {arqAnterior?.nombre ?? "—"}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-semibold">
                {arqActual?.nombre ?? "—"}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm">
              Sigue siendo{" "}
              <strong className="text-foreground">{arqActual?.nombre}</strong>.
              La estructura patrimonial no cambió de categoría.
            </p>
          )}
        </div>

        {/* Resumen IA — solo si está */}
        {resumen ? (
          <>
            {resumen.mejoras.length > 0 && (
              <Bloque
                titulo="Lo que mejoró"
                tipo="positivo"
                items={resumen.mejoras}
              />
            )}
            {resumen.alertas.length > 0 && (
              <Bloque
                titulo="Atención"
                tipo="alerta"
                items={resumen.alertas}
              />
            )}
            <section>
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                3 acciones para los próximos 30 días
              </h3>
              <ol className="space-y-3">
                {resumen.acciones.map((a, i) => (
                  <AccionRow key={i} numero={i + 1} accion={a} />
                ))}
              </ol>
            </section>
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            El resumen IA de tu evolución no se pudo generar esta vez. La
            comparativa numérica de arriba es válida.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <Badge variant="outline" className="ml-auto">
        sin cambio
      </Badge>
    );
  }
  const positivo = delta > 0;
  return (
    <Badge
      variant={positivo ? "optimizacion" : "vulnerabilidad"}
      className="ml-auto inline-flex items-center gap-1"
    >
      {positivo ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {positivo ? "+" : ""}
      {delta} {Math.abs(delta) === 1 ? "punto" : "puntos"}
    </Badge>
  );
}

function EjeBox({
  label,
  antes,
  ahora,
}: {
  label: string;
  antes: number;
  ahora: number;
}) {
  const delta = ahora - antes;
  const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  const colorClass =
    delta > 0
      ? "text-brand-700"
      : delta < 0
        ? "text-pulse-700"
        : "text-muted-foreground";

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-lg tabular-nums text-muted-foreground">
          {antes}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-lg tabular-nums font-semibold">{ahora}</span>
        <span className={cn("ml-auto inline-flex items-center", colorClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function Bloque({
  titulo,
  tipo,
  items,
}: {
  titulo: string;
  tipo: "positivo" | "alerta";
  items: string[];
}) {
  const Icon = tipo === "positivo" ? CheckCircle2 : AlertTriangle;
  const colorClass =
    tipo === "positivo" ? "text-brand-700" : "text-vital-700";

  return (
    <section>
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {titulo}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
            <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", colorClass)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AccionRow({
  numero,
  accion,
}: {
  numero: number;
  accion: { titulo: string; descripcion: string; prioridad: "alta" | "media" | "baja" };
}) {
  const variant =
    accion.prioridad === "alta"
      ? ("vulnerabilidad" as const)
      : accion.prioridad === "media"
        ? ("estabilidad" as const)
        : ("outline" as const);

  return (
    <li className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-sm font-semibold tabular-nums">
          {numero}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className="font-semibold leading-tight">{accion.titulo}</h4>
            <Badge variant={variant} className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              {accion.prioridad}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {accion.descripcion}
          </p>
        </div>
      </div>
    </li>
  );
}

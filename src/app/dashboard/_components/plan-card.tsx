import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SemanaPlan {
  semana: number;
  titulo: string;
  descripcion: string;
  metricaExito: string;
}

export function PlanCard({
  semanas,
  generatedAt,
  modelUsed,
}: {
  semanas: SemanaPlan[];
  generatedAt: string;
  modelUsed: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Tu Plan 90 días</CardTitle>
          <Badge variant="default">12 semanas</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Generado el{" "}
          {new Date(generatedAt).toLocaleDateString("es", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          <span className="font-mono text-xs">{modelUsed}</span>
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {semanas.map((s) => (
            <li
              key={s.semana}
              className="flex gap-4 rounded-md border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold tabular-nums">
                {s.semana}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold leading-tight">{s.titulo}</h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {s.descripcion}
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-brand-700">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">
                    <span className="uppercase tracking-wider font-medium">
                      Éxito:
                    </span>{" "}
                    {s.metricaExito}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

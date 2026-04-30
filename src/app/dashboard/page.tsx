import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ClipboardList,
  ArrowRight,
  LogOut,
  Sparkles,
  Calculator,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArquetipoById } from "@/lib/data/arquetipos";
import { GenerarPlanButton } from "./_components/generar-plan-button";
import { PlanCard, type SemanaPlan } from "./_components/plan-card";
import { ComparativaCard } from "./_components/comparativa-card";
import type { ResumenEvolucion } from "@/lib/ia/generar-resumen-rediagnostico";

export const metadata = { title: "Dashboard" };

type DiagnosticoRow = {
  id: string;
  score_total: number;
  score_liquidez: number;
  score_diversificacion: number;
  score_apalancamiento: number;
  arquetipo_id: number;
  resumen_evolucion: ResumenEvolucion | null;
  created_at: string;
};

type PlanRow = {
  id: string;
  diagnostico_id: string;
  semanas: SemanaPlan[];
  model_used: string;
  generated_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Carga últimos diagnósticos con todos los ejes y el resumen_evolucion
  const { data: diagnosticos } = await supabase
    .from("diagnosticos")
    .select(
      "id, score_total, score_liquidez, score_diversificacion, score_apalancamiento, arquetipo_id, resumen_evolucion, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<DiagnosticoRow[]>();

  const ultimo = diagnosticos?.[0];
  const anterior = diagnosticos?.[1];
  const arquetipoUltimo = ultimo ? getArquetipoById(ultimo.arquetipo_id) : null;

  // Carga el plan asociado al último diagnóstico (si existe)
  let plan: PlanRow | null = null;
  if (ultimo) {
    const { data } = await supabase
      .from("planes_90_dias")
      .select("id, diagnostico_id, semanas, model_used, generated_at")
      .eq("user_id", user.id)
      .eq("diagnostico_id", ultimo.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .returns<PlanRow[]>();
    plan = data?.[0] ?? null;
  }

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hola{user.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tu sala de triage personal. Mide tu pulso patrimonial cada 30 días.
          </p>
        </section>

        {!ultimo ? (
          <Card>
            <CardHeader>
              <CardTitle>Aún no tienes diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Empieza con 10 preguntas, 3 minutos.
              </p>
              <Button asChild>
                <Link href="/diagnostico">
                  Hacer diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pulso actual */}
            <section className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tu último pulso</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-semibold tabular-nums leading-none">
                    {ultimo.score_total}
                  </span>
                  <span className="text-muted-foreground mb-1">/10</span>
                  {arquetipoUltimo && (
                    <Badge
                      variant={
                        arquetipoUltimo.nivel === "Vulnerabilidad"
                          ? "vulnerabilidad"
                          : arquetipoUltimo.nivel === "Estabilidad"
                            ? "estabilidad"
                            : "optimizacion"
                      }
                      className="ml-2 mb-1"
                    >
                      {arquetipoUltimo.nivel}
                    </Badge>
                  )}
                </div>
                {arquetipoUltimo && (
                  <h2 className="mt-2 text-xl font-semibold">
                    {arquetipoUltimo.nombre}
                  </h2>
                )}
              </div>
              <Button asChild variant="outline">
                <Link href="/diagnostico">
                  <ClipboardList className="h-4 w-4" />
                  Re-diagnosticar
                </Link>
              </Button>
            </section>

            {/* Comparativa de re-diagnóstico — solo cuando hay 2+ */}
            {anterior && (
              <section>
                <ComparativaCard
                  anterior={anterior}
                  actual={ultimo}
                  resumen={ultimo.resumen_evolucion}
                />
              </section>
            )}

            {/* Plan 90 días */}
            <section>
              {plan ? (
                <PlanCard
                  semanas={plan.semanas}
                  generatedAt={plan.generated_at}
                  modelUsed={plan.model_used}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-brand-600" />
                        Tu Plan 90 días personalizado
                      </CardTitle>
                      <Badge variant="outline">Pro · gratis en beta</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Claude Sonnet diseñará 12 semanas con una acción concreta cada
                      semana, basadas en tu arquetipo{" "}
                      <strong className="text-foreground">
                        {arquetipoUltimo?.nombre}
                      </strong>{" "}
                      y tu etapa de carrera.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <GenerarPlanButton diagnosticoId={ultimo.id} />
                    <p className="mt-3 text-xs text-muted-foreground">
                      Tarda 10–20 segundos. Se guarda en tu cuenta.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Historial */}
            {diagnosticos && diagnosticos.length > 1 && (
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                      Historial de pulsos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-border -my-2">
                      {diagnosticos.map((d) => {
                        const arq = getArquetipoById(d.arquetipo_id);
                        return (
                          <li
                            key={d.id}
                            className="flex items-center justify-between py-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {arq?.nombre ?? "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(d.created_at).toLocaleDateString("es", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span className="text-lg font-semibold tabular-nums">
                              {d.score_total}/10
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            )}
          </>
        )}

        {/* Simuladores */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Simuladores
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-brand-600" />
                  Deuda vs Inversión
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Si tienes excedente y deuda al mismo tiempo, qué te conviene
                  más a 10 años.
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/simuladores/deuda-vs-inversion">
                    Abrir simulador
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground">
                  Más simuladores · próximamente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>· Inmueble vs ahorro</p>
                <p>· Cuándo puedo retirarme</p>
                <p>· Asistente IA conversacional</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}

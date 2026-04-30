import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ClipboardList,
  ArrowRight,
  LogOut,
  Sparkles,
  Calculator,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArquetipoById } from "@/lib/data/arquetipos";
import { GenerarPlanButton } from "./_components/generar-plan-button";
import { PlanCard, type SemanaPlan } from "./_components/plan-card";
import { ComparativaCard } from "./_components/comparativa-card";
import { cn } from "@/lib/utils";
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

  const nombreUsuario = user.email ? user.email.split("@")[0] : null;

  return (
    <>
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium tracking-tight"
          >
            <Activity className="h-4 w-4 text-brand-700" />
            <span>Triage Financiero</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
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

      <main className="mx-auto max-w-5xl px-6 sm:px-8 py-12 sm:py-16 space-y-16">
        {/* Greeting editorial */}
        <section className="fade-up space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-700 pulse-soft" />
            Tu sala de triage
          </p>
          <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-foreground">
            Hola{nombreUsuario ? "," : "."}
            {nombreUsuario && (
              <span className="not-italic font-sans font-medium text-foreground/80">
                {" "}
                {nombreUsuario}.
              </span>
            )}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
            Mide tu pulso patrimonial cada 30 días. Cada re-diagnóstico te
            muestra cómo evolucionas y refresca tu plan.
          </p>
        </section>

        {!ultimo ? (
          <section className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center fade-up fade-up-delay-1">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 mb-3">
              Primer paso
            </p>
            <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight">
              Aún no tienes diagnóstico.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Empieza con 10 preguntas. 3 minutos. Cero jerga financiera.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/diagnostico">
                Hacer mi diagnóstico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>
        ) : (
          <>
            {/* Pulso actual — momento dramático */}
            <section className="fade-up fade-up-delay-1 grid lg:grid-cols-12 gap-8 items-end border-t border-border/60 pt-10">
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Tu último pulso
                </p>
                <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                  <span className="font-mono text-7xl sm:text-8xl lg:text-9xl font-medium tabular-nums leading-none text-foreground">
                    {ultimo.score_total}
                  </span>
                  <div className="pb-2 sm:pb-3 lg:pb-4 space-y-2">
                    <span className="block text-xl sm:text-2xl font-mono text-muted-foreground">
                      /10
                    </span>
                    {arquetipoUltimo && (
                      <Badge
                        variant={
                          arquetipoUltimo.nivel === "Vulnerabilidad"
                            ? "vulnerabilidad"
                            : arquetipoUltimo.nivel === "Estabilidad"
                              ? "estabilidad"
                              : "optimizacion"
                        }
                      >
                        {arquetipoUltimo.nivel}
                      </Badge>
                    )}
                  </div>
                </div>
                {arquetipoUltimo && (
                  <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight pt-2">
                    {arquetipoUltimo.nombre}
                  </h2>
                )}
              </div>

              {/* Aside con ejes */}
              <aside className="lg:col-span-5">
                <div className="border-l-2 border-brand-700/30 pl-6 space-y-5 mb-6">
                  <EjeBox label="Liquidez" valor={ultimo.score_liquidez} />
                  <EjeBox
                    label="Diversificación"
                    valor={ultimo.score_diversificacion}
                  />
                  <EjeBox
                    label="Apalancamiento"
                    valor={ultimo.score_apalancamiento}
                  />
                </div>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/diagnostico">
                    <ClipboardList className="h-4 w-4" />
                    Re-diagnosticar
                  </Link>
                </Button>
              </aside>
            </section>

            {/* Comparativa de re-diagnóstico */}
            {anterior && (
              <section className="fade-up">
                <SectionLabel>Tu evolución</SectionLabel>
                <ComparativaCard
                  anterior={anterior}
                  actual={ultimo}
                  resumen={ultimo.resumen_evolucion}
                />
              </section>
            )}

            {/* Plan 90 días */}
            <section className="fade-up">
              <SectionLabel>Tu Plan 90 días</SectionLabel>
              {plan ? (
                <PlanCard
                  semanas={plan.semanas}
                  generatedAt={plan.generated_at}
                  modelUsed={plan.model_used}
                />
              ) : (
                <Card className="bg-card border-border/80">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="font-serif italic text-2xl flex items-center gap-2 tracking-tight">
                        <Sparkles className="h-5 w-5 text-brand-700" />
                        Tu Plan 90 días personalizado
                      </CardTitle>
                      <Badge variant="outline">Pro · gratis en beta</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Claude Sonnet diseñará 12 semanas con una acción concreta
                      cada semana, basadas en tu arquetipo{" "}
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
              <section className="fade-up">
                <SectionLabel>Historial de pulsos</SectionLabel>
                <Card className="bg-card border-border/80">
                  <CardContent className="pt-6">
                    <ul className="divide-y divide-border/60 -my-2">
                      {diagnosticos.map((d) => {
                        const arq = getArquetipoById(d.arquetipo_id);
                        return (
                          <li
                            key={d.id}
                            className="flex items-center justify-between py-4"
                          >
                            <div className="space-y-1">
                              <p className="text-base font-medium leading-tight">
                                {arq?.nombre ?? "—"}
                              </p>
                              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                {new Date(d.created_at).toLocaleDateString(
                                  "es",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <span className="font-mono text-2xl font-medium tabular-nums">
                              {d.score_total}
                              <span className="text-sm text-muted-foreground">
                                /10
                              </span>
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

        {/* Herramientas */}
        <section className="fade-up">
          <SectionLabel>Herramientas</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-card border-border/80">
              <CardHeader>
                <CardTitle className="font-serif italic text-xl flex items-center gap-2 tracking-tight">
                  <MessageCircle className="h-4 w-4 text-brand-700" />
                  Asistente Triage
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pregúntale dudas sobre tu arquetipo o conceptos financieros
                  básicos. Conoce tu contexto.
                </p>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/asistente">
                    Abrir chat
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/80">
              <CardHeader>
                <CardTitle className="font-serif italic text-xl flex items-center gap-2 tracking-tight">
                  <Calculator className="h-4 w-4 text-brand-700" />
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
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Próximamente: simulador inmueble vs ahorro · simulador retiro · email mensual con tu evolución
          </p>
        </section>
      </main>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
      {children}
    </p>
  );
}

function EjeBox({ label, valor }: { label: string; valor: number }) {
  const dotsBase = "inline-block h-2 w-2 rounded-full";
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="font-mono text-2xl font-medium tabular-nums text-foreground">
          {valor}
          <span className="text-sm text-muted-foreground">/3</span>
        </span>
        <div className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                dotsBase,
                n <= valor ? "bg-brand-700" : "bg-rule",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

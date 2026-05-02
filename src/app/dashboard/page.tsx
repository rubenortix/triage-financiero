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
  Home as HomeIcon,
  Stethoscope,
  LineChart,
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
          <section className="fade-up fade-up-delay-1 space-y-8">
            <div className="rounded-lg border-2 border-brand-200 bg-brand-50/30 p-8 sm:p-12">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-700 mb-3">
                Bienvenido — primer paso
              </p>
              <h2 className="font-serif italic text-3xl sm:text-5xl tracking-tight leading-[1.05]">
                Empecemos por
                <br />
                <span className="not-italic font-sans font-medium text-foreground/80">
                  tu diagnóstico inicial.
                </span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
                10 preguntas en 3 minutos. Nada de cuentas bancarias, nada de
                números exactos — solo elecciones múltiples sobre tu situación.
                Al final ves tu pulso patrimonial y un Plan 90 días generado
                para ti.
              </p>
              <Button asChild size="lg" className="mt-8 text-base h-12 px-7">
                <Link href="/diagnostico">
                  Empezar mi diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Tus respuestas se guardan en tu cuenta. Puedes re-diagnosticar
                cada 30 días para medir cómo evolucionas.
              </p>
            </div>

            {/* Lo que vas a recibir — 3 pasos */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Lo que vas a recibir
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <PasoCard
                  numero="01"
                  icon={<Stethoscope className="h-5 w-5" />}
                  titulo="Pulso patrimonial"
                  texto="Score 0–10 con tus signos vitales: liquidez, diversificación, apalancamiento. Un arquetipo de los 27 del Mapa Triage."
                />
                <PasoCard
                  numero="02"
                  icon={<Sparkles className="h-5 w-5" />}
                  titulo="Plan 90 días"
                  texto="Claude Sonnet escribe 12 semanas con una acción concreta cada semana, calibrada a tu arquetipo y etapa de carrera."
                />
                <PasoCard
                  numero="03"
                  icon={<LineChart className="h-5 w-5" />}
                  titulo="Evolución mensual"
                  texto="Cada 30 días vuelves a medir tu pulso. Ves cómo cambió tu score, qué mejoró, y obtienes un nuevo plan."
                />
              </div>
            </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HerramientaCard
              icon={<MessageCircle className="h-4 w-4 text-brand-700" />}
              titulo="Asistente Triage"
              descripcion="Pregúntale dudas sobre tu arquetipo o conceptos financieros básicos. Conoce tu contexto."
              href="/asistente"
              cta="Abrir chat"
            />
            <HerramientaCard
              icon={<Calculator className="h-4 w-4 text-brand-700" />}
              titulo="Deuda vs Inversión"
              descripcion="Si tienes excedente y deuda al mismo tiempo, qué te conviene más a 10 años."
              href="/simuladores/deuda-vs-inversion"
              cta="Abrir simulador"
            />
            <HerramientaCard
              icon={<HomeIcon className="h-4 w-4 text-brand-700" />}
              titulo="Inmueble vs Ahorro"
              descripcion="Comprar inmueble con financiamiento vs invertir la cuota inicial al retorno alternativo."
              href="/simuladores/inmueble-vs-ahorro"
              cta="Abrir simulador"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Próximamente: simulador retiro/independencia · email mensual con tu evolución
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

function PasoCard({
  numero,
  icon,
  titulo,
  texto,
}: {
  numero: string;
  icon: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          {icon}
        </div>
        <span className="font-mono text-xs tracking-widest text-muted-foreground">
          {numero}
        </span>
      </div>
      <h3 className="mt-4 font-serif italic text-xl tracking-tight">
        {titulo}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {texto}
      </p>
    </div>
  );
}

function HerramientaCard({
  icon,
  titulo,
  descripcion,
  href,
  cta,
}: {
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="bg-card border-border/80">
      <CardHeader>
        <CardTitle className="font-serif italic text-xl flex items-center gap-2 tracking-tight">
          {icon}
          {titulo}
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {descripcion}
        </p>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={href}>
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
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

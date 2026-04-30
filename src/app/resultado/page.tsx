import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertCircle,
  TrendingUp,
  Wallet,
  Target,
  Coins,
  LogIn,
  LogOut,
} from "lucide-react";
import { calcularDiagnostico, decodeRespuestas } from "@/lib/data/scoring";
import { calcularCincoNumeros, type Color } from "@/lib/data/cinco-numeros";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DISCLAIMER_IA } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { GuardarButton } from "./_components/guardar-button";

interface Props {
  searchParams: Promise<{ r?: string }>;
}

export const metadata = { title: "Tu resultado" };

export default async function ResultadoPage({ searchParams }: Props) {
  const { r } = await searchParams;
  const respuestas = r ? decodeRespuestas(r) : null;
  if (!respuestas || !r) {
    redirect("/diagnostico");
  }

  const resultado = calcularDiagnostico(respuestas);
  const cinco = calcularCincoNumeros({
    q3: respuestas.q3,
    q6: respuestas.q6,
    q8: respuestas.q8,
    scoreTotal: resultado.scoreTotal,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/diagnostico">Volver a hacer</Link>
            </Button>
            {user ? (
              <form action="/auth/logout" method="post">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </form>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/login?next=${encodeURIComponent(`/resultado?r=${r}`)}`}>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-8 py-12 sm:py-16 space-y-16">
        {/* Pulso patrimonial — momento dramático */}
        <section className="relative">
          <div
            className="ecg-line absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60px] -z-10 opacity-50"
            aria-hidden="true"
          />
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <p className="fade-up text-xs uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-700 pulse-soft" />
                Tu pulso patrimonial
              </p>

              <div className="count-up flex items-end gap-2 sm:gap-4 flex-wrap">
                <span className="font-mono text-[8rem] sm:text-[10rem] lg:text-[12rem] font-medium tabular-nums leading-none text-foreground">
                  {resultado.scoreTotal}
                </span>
                <div className="pb-4 sm:pb-6 lg:pb-8 space-y-2">
                  <span className="block text-2xl sm:text-3xl font-mono text-muted-foreground">
                    /10
                  </span>
                  <Badge
                    variant={
                      resultado.nivel === "Vulnerabilidad"
                        ? "vulnerabilidad"
                        : resultado.nivel === "Estabilidad"
                          ? "estabilidad"
                          : "optimizacion"
                    }
                  >
                    {resultado.nivel}
                  </Badge>
                </div>
              </div>

              <h1 className="fade-up fade-up-delay-1 font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-foreground pt-2">
                {resultado.arquetipo.nombre}
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {resultado.arquetipo.codigo}
              </p>
            </div>

            {/* Mini grid de ejes */}
            <aside className="lg:col-span-5 fade-up fade-up-delay-2">
              <div className="border-l-2 border-brand-700/30 pl-6 space-y-6">
                <EjeBox label="Liquidez" valor={resultado.liquidez} />
                <EjeBox label="Diversificación" valor={resultado.diversificacion} />
                <EjeBox label="Apalancamiento" valor={resultado.apalancamiento} />
              </div>
            </aside>
          </div>
        </section>

        {/* Tres cards: estado, perfil, prioridad */}
        <section className="grid gap-6 md:grid-cols-3 fade-up">
          <DiagCard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Estado actual"
            text={resultado.arquetipo.diagnostico}
          />
          <DiagCard
            icon={<Target className="h-4 w-4" />}
            label="Perfil tipo"
            text={resultado.arquetipo.ejemplo}
          />
          <DiagCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Prioridad inmediata"
            text={resultado.arquetipo.recomendacion}
          />
        </section>

        {/* Los 5 números */}
        <section>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Tu situación en cifras
            </p>
            <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight">
              Los 5 números que
              <br />
              <span className="not-italic font-sans font-medium text-foreground/80">
                tienes que saber.
              </span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              3 sobre tu situación actual, 2 proyecciones a 10 años.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumeroCard icon={<Wallet className="h-5 w-5" />} numero="1" data={cinco.colchon} />
            <NumeroCard icon={<Coins className="h-5 w-5" />} numero="2" data={cinco.dependencia} />
            <NumeroCard icon={<TrendingUp className="h-5 w-5" />} numero="3" data={cinco.peaje} />
            <NumeroCard
              icon={<AlertCircle className="h-5 w-5" />}
              numero="4"
              data={cinco.costoNoActuar}
              proyeccion
            />
            <NumeroCard
              icon={<Target className="h-5 w-5" />}
              numero="5"
              data={cinco.siActuasHoy}
              proyeccion
            />
          </div>
        </section>

        {/* CTA — depende de auth state */}
        {user ? (
          <section className="rounded-lg border-2 border-brand-200 bg-brand-50/40 p-8 sm:p-12 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 mb-3">
              Próximo paso
            </p>
            <h3 className="font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight">
              Guarda este diagnóstico,
              <br />
              <span className="not-italic font-sans font-medium text-foreground/80">
                desbloquea tu Plan 90 días.
              </span>
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Claude Sonnet escribe 12 semanas con una acción concreta por semana,
              calibrada a tu arquetipo. Se guarda en tu cuenta junto al historial
              de pulsos para medir evolución.
            </p>
            <div className="mt-8 flex justify-center">
              <GuardarButton encoded={r} />
            </div>
          </section>
        ) : (
          <section className="rounded-lg border-2 border-border bg-paper-soft/40 p-8 sm:p-12 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Próximo paso
            </p>
            <h3 className="font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight">
              Guarda tu progreso.
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Crea tu cuenta gratis y vuelve a medir tu pulso cada 30 días para
              ver cómo evoluciona. Sin contraseñas, solo tu email.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link
                  href={`/login?next=${encodeURIComponent(`/resultado?r=${r}`)}`}
                >
                  Crear cuenta gratis
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/">Volver al inicio</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta · Sin spam · Cancela cuando quieras
            </p>
          </section>
        )}

        {/* Disclaimer */}
        <section className="text-xs text-muted-foreground border-t border-border pt-6">
          <p className="leading-relaxed">{DISCLAIMER_IA}</p>
        </section>
      </main>
    </>
  );
}

function EjeBox({
  label,
  valor,
}: {
  label: string;
  valor: 1 | 2 | 3;
}) {
  const dotsBase = "inline-block h-2 w-2 rounded-full";
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-mono text-3xl font-medium tabular-nums text-foreground">
          {valor}
          <span className="text-base text-muted-foreground">/3</span>
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

function DiagCard({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <Card className="bg-card border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}

function NumeroCard({
  icon,
  numero,
  data,
  proyeccion,
}: {
  icon: React.ReactNode;
  numero: string;
  data: { etiqueta: string; valor: string; detalle: string; color: Color };
  proyeccion?: boolean;
}) {
  const colorClasses: Record<Color, string> = {
    rojo: "text-pulse-700 bg-pulse-50 border-pulse-200",
    amarillo: "text-vital-700 bg-vital-50 border-vital-200",
    verde: "text-brand-700 bg-brand-50 border-brand-200",
  };
  return (
    <Card className="bg-card border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <span className="font-mono text-xs tracking-widest text-muted-foreground">
            №{numero}
          </span>
          <div
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border",
              colorClasses[data.color],
            )}
          >
            {icon}
          </div>
        </div>
        <CardTitle className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mt-3">
          {data.etiqueta}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl font-medium tabular-nums tracking-tight text-foreground">
          {data.valor}
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {data.detalle}
        </p>
        {proyeccion && (
          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Proyección a 10 años · ±30%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

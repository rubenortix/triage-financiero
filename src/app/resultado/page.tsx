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
    q5: respuestas.q5,
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
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
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

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
        {/* Pulso patrimonial */}
        <section>
          <p className="text-sm text-muted-foreground">Tu pulso patrimonial</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-7xl font-semibold tabular-nums leading-none text-foreground">
              {resultado.scoreTotal}
            </span>
            <span className="text-2xl text-muted-foreground mb-2">/10</span>
            <Badge
              variant={
                resultado.nivel === "Vulnerabilidad"
                  ? "vulnerabilidad"
                  : resultado.nivel === "Estabilidad"
                    ? "estabilidad"
                    : "optimizacion"
              }
              className="ml-3 mb-3"
            >
              {resultado.nivel}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            {resultado.arquetipo.nombre}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            {resultado.arquetipo.codigo}
          </p>
        </section>

        {/* Tres cards: estado, perfil, prioridad */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Estado actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {resultado.arquetipo.diagnostico}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <Target className="h-4 w-4" />
                Perfil tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {resultado.arquetipo.ejemplo}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Prioridad inmediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {resultado.arquetipo.recomendacion}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Los 5 números */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            Los 5 números que tienes que saber
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            3 sobre tu situación actual, 2 proyecciones a 10 años.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <section className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <h3 className="text-2xl font-semibold tracking-tight">
              Guarda este resultado
            </h3>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Lo verás en tu dashboard junto a tus próximos rediagnósticos para
              medir tu evolución.
            </p>
            <div className="mt-6 flex justify-center">
              <GuardarButton encoded={r} />
            </div>
          </section>
        ) : (
          <section className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <h3 className="text-2xl font-semibold tracking-tight">
              Guarda tu progreso
            </h3>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Crea tu cuenta gratis y vuelve a medir tu pulso cada 30 días para
              ver cómo evoluciona. Sin contraseñas, solo tu email.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
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
            <p className="mt-3 text-xs text-muted-foreground">
              Sin tarjeta · Sin spam · Cancela cuando quieras
            </p>
          </section>
        )}

        {/* Plan 90 días — preview bloqueado */}
        <section className="rounded-lg border border-border bg-card p-8 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            Tu Plan 90 días personalizado
          </h3>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            12 semanas, una acción concreta cada semana, generadas por IA según
            tu arquetipo. Disponible próximamente en el plan Pro.
          </p>
          <div className="mt-6">
            <Button size="lg" disabled>
              Próximamente · $29/mes
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="text-xs text-muted-foreground border-t border-border pt-6">
          <p className="leading-relaxed">{DISCLAIMER_IA}</p>
        </section>
      </main>
    </>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">#{numero}</span>
          <div
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border",
              colorClasses[data.color],
            )}
          >
            {icon}
          </div>
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
          {data.etiqueta}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{data.valor}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{data.detalle}</p>
        {proyeccion && (
          <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            Proyección a 10 años · ±30%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

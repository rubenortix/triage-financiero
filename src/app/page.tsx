import Link from "next/link";
import { Activity, Stethoscope, ClipboardCheck, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/diagnostico">Empezar diagnóstico</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Stethoscope className="h-3.5 w-3.5" />
            Para médicos hispanohablantes
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Le hacemos triage a tu vida financiera.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            En 3 minutos sabes dónde estás. En 12 semanas, sabes a dónde vas.
            Diagnóstico patrimonial, decisiones puntuales asistidas por IA y
            coaching mensual — sin jerga financiera, sin asesores que te venden
            cosas.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/diagnostico">Empezar diagnóstico gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#como-funciona">Cómo funciona</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sin tarjeta. Sin compromiso. 10 preguntas, 3 minutos.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="px-6 py-16 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Como una sala de urgencias, pero para tu patrimonio
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Step
              icon={<ClipboardCheck className="h-5 w-5" />}
              title="1. Diagnóstico"
              text="10 preguntas, 3 minutos. Te ubicamos en uno de 27 arquetipos patrimoniales."
            />
            <Step
              icon={<Activity className="h-5 w-5" />}
              title="2. Pulso patrimonial"
              text="Score 0-10 con tus signos vitales: liquidez, diversificación, apalancamiento."
            />
            <Step
              icon={<LineChart className="h-5 w-5" />}
              title="3. Plan 90 días"
              text="Roadmap de 12 semanas con una acción concreta por semana, hecho para ti."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 mt-auto">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Triage Financiero</p>
          <nav className="flex items-center gap-6">
            <Link href="/terminos" className="hover:text-foreground">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

function Step({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* Header — minimalista */}
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium tracking-tight">
            <Activity className="h-4 w-4 text-brand-700" />
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

      {/* Hero — asimétrico, editorial */}
      <section className="relative overflow-hidden">
        <div className="ecg-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-6 sm:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-end">
            <div className="lg:col-span-8 space-y-8">
              <p className="fade-up text-xs uppercase tracking-[0.2em] text-brand-700 inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-700 pulse-soft" />
                Para médicos hispanohablantes
              </p>

              <h1 className="fade-up fade-up-delay-1 font-serif italic text-5xl sm:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight text-foreground">
                Le hacemos triage
                <br />
                <span className="not-italic font-sans font-medium tracking-tighter text-foreground/80">
                  a tu vida financiera.
                </span>
              </h1>

              <p className="fade-up fade-up-delay-2 max-w-xl text-lg leading-relaxed text-muted-foreground">
                En <span className="text-foreground font-medium">3 minutos</span> sabes dónde estás. En{" "}
                <span className="text-foreground font-medium">12 semanas</span>, sabes a dónde vas. Diagnóstico
                patrimonial, decisiones puntuales asistidas por IA, coaching mensual — sin jerga financiera, sin
                asesores que te venden cosas.
              </p>

              <div className="fade-up fade-up-delay-3 flex items-center gap-4 flex-wrap pt-2">
                <Button asChild size="lg" className="text-base h-12 px-7">
                  <Link href="/diagnostico">Empezar diagnóstico gratis</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Sin tarjeta. Sin compromiso.
                  <br />
                  10 preguntas, 3 minutos.
                </p>
              </div>
            </div>

            {/* Columna lateral con stats — visual de "signos vitales" */}
            <aside className="lg:col-span-4 fade-up fade-up-delay-3">
              <div className="border-l-2 border-brand-700/30 pl-6 space-y-8">
                <Stat numero="27" texto="arquetipos patrimoniales" />
                <Stat numero="10" texto="preguntas en 3 minutos" />
                <Stat numero="12" texto="semanas de plan personalizado" />
                <Stat numero="0" texto="jerga financiera innecesaria" />
              </div>
            </aside>
          </div>
        </div>

        {/* ECG line decorativa al fondo del hero */}
        <div className="ecg-line h-[60px] w-full opacity-60" aria-hidden="true" />
      </section>

      {/* Cómo funciona — editorial 3 columnas */}
      <section id="como-funciona" className="border-t border-border/60 bg-paper-soft/40">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Cómo funciona
            </p>
            <h2 className="font-serif italic text-4xl sm:text-5xl leading-tight tracking-tight text-foreground">
              Como una sala de urgencias,
              <br />
              <span className="not-italic font-sans font-medium text-foreground/80">
                pero para tu patrimonio.
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-x-8 gap-y-12">
            <Paso
              numero="01"
              titulo="Diagnóstico"
              texto="10 preguntas, 3 minutos. Te ubicamos en uno de 27 arquetipos patrimoniales."
            />
            <Paso
              numero="02"
              titulo="Pulso patrimonial"
              texto="Score 0-10 con tus signos vitales: liquidez, diversificación, apalancamiento."
            />
            <Paso
              numero="03"
              titulo="Plan 90 días"
              texto="Roadmap de 12 semanas con una acción concreta cada semana, hecho para ti."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-auto">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Triage Financiero</p>
          <nav className="flex items-center gap-6">
            <Link href="/terminos" className="hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

function Stat({ numero, texto }: { numero: string; texto: string }) {
  return (
    <div>
      <p className="font-mono text-3xl font-medium tabular-nums text-brand-700 leading-none">
        {numero}
      </p>
      <p className="mt-2 text-sm text-muted-foreground leading-snug max-w-[12rem]">
        {texto}
      </p>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  texto,
}: {
  numero: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="border-t border-border pt-6">
      <p className="font-mono text-xs tracking-widest text-brand-700">{numero}</p>
      <h3 className="mt-3 font-serif italic text-2xl tracking-tight text-foreground">
        {titulo}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{texto}</p>
    </div>
  );
}

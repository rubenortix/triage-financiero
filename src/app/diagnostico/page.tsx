import Link from "next/link";
import { Activity } from "lucide-react";
import { DiagnosticoForm } from "./_components/diagnostico-form";

export const metadata = {
  title: "Diagnóstico",
  description: "10 preguntas, 3 minutos. Diagnóstico patrimonial Triage Financiero.",
};

export default function DiagnosticoPage() {
  return (
    <>
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium tracking-tight"
          >
            <Activity className="h-4 w-4 text-brand-700" />
            <span>Triage Financiero</span>
          </Link>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Diagnóstico · 3 min
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 sm:px-8 py-12 sm:py-16">
        <DiagnosticoForm />
      </main>
    </>
  );
}

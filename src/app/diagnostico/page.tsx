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
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
          <span className="text-xs text-muted-foreground">Diagnóstico · 3 min</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <DiagnosticoForm />
      </main>
    </>
  );
}

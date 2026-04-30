"use client";

import { useActionState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  guardarDiagnostico,
  type GuardarDiagnosticoState,
} from "../_actions";

const initial: GuardarDiagnosticoState = { status: "idle" };

export function GuardarButton({ encoded }: { encoded: string }) {
  const [state, formAction, pending] = useActionState(
    guardarDiagnostico,
    initial,
  );

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Diagnóstico guardado</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Ir a mi dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <input type="hidden" name="r" value={encoded} />
      <Button type="submit" size="lg" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? "Guardando…" : "Guardar este resultado"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-pulse-700">{state.error}</p>
      )}
    </form>
  );
}

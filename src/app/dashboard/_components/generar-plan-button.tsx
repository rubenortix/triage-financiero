"use client";

import { useActionState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generarPlan90Dias,
  type GenerarPlanState,
} from "../_actions";

const initial: GenerarPlanState = { status: "idle" };

export function GenerarPlanButton({
  diagnosticoId,
}: {
  diagnosticoId: string;
}) {
  const [state, formAction, pending] = useActionState(
    generarPlan90Dias,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="diagnostico_id" value={diagnosticoId} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {pending ? "Generando con IA…" : "Generar mi Plan 90 días"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-pulse-700 max-w-md leading-relaxed">
          {state.error}
        </p>
      )}
    </form>
  );
}

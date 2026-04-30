"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { guardarDiagnostico } from "../_actions";
import { generarPlan90Dias } from "@/app/dashboard/_actions";

type Fase =
  | "idle"
  | "guardando"
  | "generando-plan"
  | "exito-completo"
  | "exito-parcial" // diagnóstico guardado pero plan falló
  | "error";

export function GuardarButton({ encoded }: { encoded: string }) {
  const [pending, startTransition] = useTransition();
  const [fase, setFase] = useState<Fase>("idle");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      // Paso 1: guardar diagnóstico
      setFase("guardando");
      setError(null);

      const saveFd = new FormData();
      saveFd.append("r", encoded);
      const saveResult = await guardarDiagnostico({ status: "idle" }, saveFd);

      if (saveResult.status === "error") {
        setError(saveResult.error);
        setFase("error");
        return;
      }
      if (saveResult.status !== "ok") return;

      // Paso 2: generar plan IA con el diagnostico_id
      setFase("generando-plan");
      const planFd = new FormData();
      planFd.append("diagnostico_id", saveResult.id);
      const planResult = await generarPlan90Dias({ status: "idle" }, planFd);

      if (planResult.status === "error") {
        // El diagnóstico SÍ se guardó. El plan falló pero no es crítico.
        setError(planResult.error);
        setFase("exito-parcial");
        return;
      }

      setFase("exito-completo");
    });
  }

  if (fase === "exito-completo") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">
            ¡Listo! Tu diagnóstico y Plan 90 días están en tu cuenta.
          </span>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard">Ver mi dashboard</Link>
        </Button>
      </div>
    );
  }

  if (fase === "exito-parcial") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-vital-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            Diagnóstico guardado. El plan se generará desde el dashboard.
          </span>
        </div>
        {error && (
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            {error}
          </p>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard">Ir a mi dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center gap-2">
      <Button type="submit" size="lg" disabled={pending}>
        {fase === "idle" && (
          <>
            <Save className="h-4 w-4" />
            Guardar y generar mi Plan 90 días
          </>
        )}
        {fase === "guardando" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando diagnóstico…
          </>
        )}
        {fase === "generando-plan" && (
          <>
            <Sparkles className="h-4 w-4 animate-pulse" />
            Claude Sonnet está escribiendo tu plan…
          </>
        )}
        {fase === "error" && "Reintentar"}
      </Button>
      {fase === "generando-plan" && (
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          12 semanas, una acción concreta cada semana. Tarda ~15 segundos. No
          cierres esta ventana.
        </p>
      )}
      {fase === "error" && error && (
        <p className="text-sm text-pulse-700 max-w-md text-center">{error}</p>
      )}
    </form>
  );
}

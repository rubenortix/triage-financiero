"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  PREGUNTAS,
  TOTAL_PREGUNTAS,
  type OpcionLetra,
} from "@/lib/data/preguntas-diagnostico";
import { encodeRespuestas } from "@/lib/data/scoring";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DiagnosticoForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, OpcionLetra>>({});
  const [submitting, setSubmitting] = useState(false);

  const pregunta = PREGUNTAS[step];
  const seleccionada = respuestas[pregunta.id];
  const esUltima = step === TOTAL_PREGUNTAS - 1;
  const todasContestadas = PREGUNTAS.every((p) => respuestas[p.id]);

  function seleccionar(letra: OpcionLetra) {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: letra }));
  }

  function avanzar() {
    if (!seleccionada) return;
    if (esUltima) {
      enviar();
      return;
    }
    setStep((s) => Math.min(TOTAL_PREGUNTAS - 1, s + 1));
  }

  function retroceder() {
    setStep((s) => Math.max(0, s - 1));
  }

  function enviar() {
    if (!todasContestadas) return;
    setSubmitting(true);
    const encoded = encodeRespuestas({
      q1: respuestas[1],
      q2: respuestas[2],
      q3: respuestas[3],
      q4: respuestas[4],
      q5: respuestas[5],
      q6: respuestas[6],
      q7: respuestas[7],
      q8: respuestas[8],
      q9: respuestas[9],
      q10: respuestas[10],
    });
    router.push(`/resultado?r=${encoded}`);
  }

  return (
    <div className="space-y-10">
      {/* Header del paso — número grande mono + categoría */}
      <div key={`head-${pregunta.id}`} className="fade-up flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-4xl font-medium tabular-nums text-brand-700">
            {String(step + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            / {String(TOTAL_PREGUNTAS).padStart(2, "0")}
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {pregunta.categoria}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5" aria-hidden="true">
        {PREGUNTAS.map((p, i) => (
          <span
            key={p.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < step
                ? "bg-brand-700"
                : i === step
                  ? "bg-brand-700"
                  : "bg-rule",
            )}
          />
        ))}
      </div>

      {/* Pregunta — italic serif dramático */}
      <h1
        key={`q-${pregunta.id}`}
        className="fade-up font-serif italic text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] text-foreground"
      >
        {pregunta.pregunta}
      </h1>

      {/* Opciones */}
      <div className="space-y-3" key={`opts-${pregunta.id}`}>
        {pregunta.opciones.map((op, i) => {
          const activa = seleccionada === op.letra;
          return (
            <button
              key={op.letra}
              type="button"
              onClick={() => seleccionar(op.letra)}
              className={cn(
                "fade-up w-full text-left rounded-lg border-2 p-5 transition-all duration-200",
                "hover:border-brand-400 hover:bg-brand-50/40",
                activa
                  ? "border-brand-700 bg-brand-50/60 shadow-sm"
                  : "border-border bg-card",
                i === 0 && "fade-up-delay-1",
                i === 1 && "fade-up-delay-2",
                i === 2 && "fade-up-delay-3",
              )}
              style={{ animationDelay: `${100 * (i + 1)}ms` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 transition-colors",
                    activa
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-border bg-card",
                  )}
                >
                  {activa ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      {op.letra.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-base sm:text-lg leading-relaxed text-foreground pt-0.5">
                  {op.texto}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-6 border-t border-border/60">
        <Button
          type="button"
          variant="ghost"
          onClick={retroceder}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>
        <Button
          type="button"
          onClick={avanzar}
          disabled={!seleccionada || submitting}
          size="lg"
        >
          {esUltima ? (submitting ? "Enviando…" : "Ver mi resultado") : "Continuar"}
          {!esUltima && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

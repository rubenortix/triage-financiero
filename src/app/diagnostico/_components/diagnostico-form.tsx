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
  const progreso = ((step + 1) / TOTAL_PREGUNTAS) * 100;
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
    <div className="space-y-8">
      {/* Barra de progreso */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            Pregunta {step + 1} de {TOTAL_PREGUNTAS}
          </span>
          <span>{pregunta.categoria}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold leading-snug tracking-tight">
          {pregunta.pregunta}
        </h1>
      </div>

      {/* Opciones */}
      <div className="space-y-3">
        {pregunta.opciones.map((op) => {
          const activa = seleccionada === op.letra;
          return (
            <button
              key={op.letra}
              type="button"
              onClick={() => seleccionar(op.letra)}
              className={cn(
                "w-full text-left rounded-lg border-2 p-4 transition-colors",
                "hover:border-brand-400 hover:bg-brand-50",
                activa
                  ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 mt-0.5",
                    activa
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-border",
                  )}
                >
                  {activa ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {op.letra.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-base leading-relaxed text-foreground">
                  {op.texto}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-4">
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

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { enviarMensaje } from "../_actions";
import type { MensajeChat } from "@/lib/ia/asistente";

interface Props {
  conversacionIdInicial: string | null;
  mensajesIniciales: MensajeChat[];
}

const SUGERENCIAS = [
  "¿Qué significa mi arquetipo?",
  "¿Cómo construyo un fondo de emergencia?",
  "¿Vale la pena pagar mi tarjeta de crédito antes de invertir?",
  "¿En qué se diferencia liquidez de diversificación?",
];

export function ChatAsistente({
  conversacionIdInicial,
  mensajesIniciales,
}: Props) {
  const [conversacionId, setConversacionId] = useState<string | null>(
    conversacionIdInicial,
  );
  const [mensajes, setMensajes] = useState<MensajeChat[]>(mensajesIniciales);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollAnchor = useRef<HTMLDivElement>(null);

  // Auto-scroll cuando llega mensaje nuevo
  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, pending]);

  function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || pending) return;

    setError(null);
    setDraft("");

    // Optimistic: agrega el mensaje del user inmediato
    const optimistic: MensajeChat = {
      role: "user",
      content: trimmed,
      ts: new Date().toISOString(),
    };
    setMensajes((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("mensaje", trimmed);
      if (conversacionId) fd.append("conversacionId", conversacionId);

      const result = await enviarMensaje({ status: "idle" }, fd);

      if (result.status === "error") {
        setError(result.error);
        // Quita el optimistic del user para que pueda reintentar
        setMensajes((prev) => prev.slice(0, -1));
        setDraft(trimmed);
        return;
      }

      if (result.status === "ok") {
        setConversacionId(result.conversacionId);
        setMensajes(result.mensajes);
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(draft);
  }

  const conversacionVacia = mensajes.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Mensajes */}
      <div className="flex-1 space-y-5 mb-6 min-h-[40vh]">
        {conversacionVacia && !pending ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-paper-soft/30 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Empieza con
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={pending}
                  className="text-left rounded-md border border-border bg-card p-3 text-sm hover:border-brand-400 hover:bg-brand-50/40 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          mensajes.map((m, i) => <Burbuja key={i} mensaje={m} />)
        )}

        {pending && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-700/60 animate-bounce" />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-brand-700/60 animate-bounce"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-brand-700/60 animate-bounce"
                  style={{ animationDelay: "240ms" }}
                />
              </span>
            </div>
          </div>
        )}

        <div ref={scrollAnchor} />
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-pulse-200 bg-pulse-50 px-4 py-2 text-sm text-pulse-700 inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 bg-background border-t border-border pt-4"
      >
        <div className="flex gap-2 items-end">
          <textarea
            name="mensaje"
            placeholder="Escribe tu pregunta…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            disabled={pending}
            className="flex-1 resize-none rounded-md border border-border bg-card px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 max-h-32"
          />
          <Button type="submit" size="lg" disabled={pending || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  );
}

function Burbuja({ mensaje }: { mensaje: MensajeChat }) {
  const esUser = mensaje.role === "user";
  return (
    <div className={cn("flex items-start gap-3", esUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          esUser
            ? "bg-foreground text-background"
            : "bg-brand-50 text-brand-700",
        )}
      >
        {esUser ? "Tú" : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-line",
          esUser
            ? "bg-foreground text-background"
            : "border border-border bg-card text-foreground",
        )}
      >
        {mensaje.content}
      </div>
    </div>
  );
}

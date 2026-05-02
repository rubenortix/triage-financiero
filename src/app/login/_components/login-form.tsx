"use client";

import { useActionState } from "react";
import { Mail, CheckCircle2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendMagicLink, type SendMagicLinkState } from "../_actions";

const initial: SendMagicLinkState = { status: "idle" };

interface Props {
  next?: string;
  betaGate: boolean;
}

export function LoginForm({ next, betaGate }: Props) {
  const [state, formAction, pending] = useActionState(sendMagicLink, initial);

  if (state.status === "ok") {
    return (
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-700" />
        <h2 className="mt-3 text-lg font-semibold">Revisa tu email</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Te enviamos un enlace a{" "}
          <strong className="text-foreground">{state.email}</strong>. Haz click
          en él para entrar. Puedes cerrar esta ventana.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {betaGate && (
        <div className="space-y-2">
          <Label htmlFor="invitationCode" className="flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" />
            Código de invitación
          </Label>
          <Input
            id="invitationCode"
            name="invitationCode"
            placeholder="TRIAGE-XXXXXX"
            required
            autoFocus
            autoComplete="off"
            disabled={pending}
            className="font-mono uppercase tracking-wider"
          />
          <p className="text-xs text-muted-foreground">
            Triage está en beta cerrada. Si no tienes código, escribe a{" "}
            <a
              href="mailto:hola@triagefinanciero.com"
              className="underline hover:text-foreground"
            >
              hola@triagefinanciero.com
            </a>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tunombre@hospital.com"
          required
          autoFocus={!betaGate}
          autoComplete="email"
          disabled={pending}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-pulse-700">{state.error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Mail className="h-4 w-4" />
        {pending ? "Enviando…" : "Enviar enlace mágico"}
      </Button>
    </form>
  );
}

import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(requireEnv("RESEND_API_KEY"));
  }
  return _resend;
}

/**
 * From: prefiere RESEND_FROM_EMAIL configurado en .env.
 * Mientras el dominio no esté verificado, Resend solo permite enviar a la
 * dirección del dueño de la API key con onboarding@resend.dev.
 */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Triage Financiero <onboarding@resend.dev>";

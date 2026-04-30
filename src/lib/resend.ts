import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(requireEnv("RESEND_API_KEY"));
  }
  return _resend;
}

export const FROM_EMAIL = "Triage Financiero <hola@triagefinanciero.com>";

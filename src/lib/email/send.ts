/**
 * Helpers para enviar emails específicos. Aíslan los detalles de Resend
 * y manejan errores silenciosamente — un email fallido no debe romper el
 * flujo de auth o el cron.
 */

import { getResend, FROM_EMAIL } from "@/lib/resend";
import {
  welcomeEmail,
  recordatorioMensualEmail,
} from "@/lib/email/templates";

interface EnvioBase {
  ok: boolean;
  error?: string;
  emailId?: string;
}

export async function enviarWelcome(args: {
  to: string;
  nombre?: string | null;
}): Promise<EnvioBase> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }
  try {
    const tpl = welcomeEmail({ nombre: args.nombre });
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, emailId: result.data?.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
}

export async function enviarRecordatorioMensual(args: {
  to: string;
  nombre?: string | null;
  diasDesdeUltimo: number;
  scoreActual: number;
  arquetipoNombre: string;
  nivel: "Vulnerabilidad" | "Estabilidad" | "Optimización";
}): Promise<EnvioBase> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }
  try {
    const tpl = recordatorioMensualEmail(args);
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, emailId: result.data?.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
}

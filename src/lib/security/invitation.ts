/**
 * Helper para validar y consumir códigos de invitación durante la beta cerrada.
 *
 * Flujo:
 *  1. Usuario pega su código en /login
 *  2. validateInvitationCode() comprueba que existe y no está usado
 *  3. Si OK, login Server Action setea cookie HttpOnly con el código
 *  4. Tras magic link click, /auth/callback lee la cookie y llama a
 *     consumeInvitationCode() para marcar `used_by + used_at`
 */

import { createAdminClient } from "@/lib/supabase/admin";

export const BETA_GATE_ENABLED = process.env.BETA_GATE_ENABLED === "true";
export const INVITATION_COOKIE = "triage_invitation_code";

interface CodeRow {
  code: string;
  used_at: string | null;
}

export async function validateInvitationCode(
  code: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!code || code.length < 4 || code.length > 32) {
    return { ok: false, reason: "Código con formato inválido" };
  }
  const trimmed = code.trim().toUpperCase();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invitation_codes")
    .select("code, used_at")
    .eq("code", trimmed)
    .maybeSingle<CodeRow>();

  if (error) {
    return { ok: false, reason: "Error validando código" };
  }
  if (!data) {
    return { ok: false, reason: "Código no encontrado" };
  }
  if (data.used_at) {
    return { ok: false, reason: "Código ya fue usado" };
  }
  return { ok: true };
}

export async function consumeInvitationCode(args: {
  code: string;
  userId: string;
}): Promise<{ ok: boolean }> {
  const trimmed = args.code.trim().toUpperCase();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invitation_codes")
    .update({
      used_by: args.userId,
      used_at: new Date().toISOString(),
    })
    .eq("code", trimmed)
    .is("used_at", null); // condición: solo si aún no usado (anti-race)

  return { ok: !error };
}

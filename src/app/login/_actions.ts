"use server";

import { headers, cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  BETA_GATE_ENABLED,
  INVITATION_COOKIE,
  validateInvitationCode,
} from "@/lib/security/invitation";

const schema = z.object({
  email: z.string().email("Email inválido"),
  next: z
    .string()
    .optional()
    .refine(
      (n) => !n || (n.startsWith("/") && !n.startsWith("//")),
      { message: "Ruta de redirección inválida" },
    ),
  invitationCode: z.string().optional(),
});

export type SendMagicLinkState =
  | { status: "idle" }
  | { status: "ok"; email: string }
  | { status: "error"; error: string };

export async function sendMagicLink(
  _prev: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
    invitationCode: formData.get("invitationCode") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  // Beta gate — si está activado, exige código válido antes de mandar magic link
  if (BETA_GATE_ENABLED) {
    const code = (parsed.data.invitationCode ?? "").trim();
    if (!code) {
      return {
        status: "error",
        error: "Triage está en beta cerrada. Ingresa tu código de invitación.",
      };
    }
    const validation = await validateInvitationCode(code);
    if (!validation.ok) {
      return { status: "error", error: validation.reason };
    }
    // Setea cookie HttpOnly para consumir en /auth/callback tras login exitoso
    const cookieStore = await cookies();
    cookieStore.set(INVITATION_COOKIE, code.toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hora — suficiente para que el usuario abra el email
      path: "/",
    });
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const next = parsed.data.next ?? "/dashboard";
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: "error", error: error.message };
  }

  return { status: "ok", email: parsed.data.email };
}

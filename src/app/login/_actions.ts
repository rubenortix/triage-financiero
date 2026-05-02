"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Email inválido"),
  next: z
    .string()
    .optional()
    .refine(
      (n) => !n || (n.startsWith("/") && !n.startsWith("//")),
      { message: "Ruta de redirección inválida" },
    ),
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
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
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

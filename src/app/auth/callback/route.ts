import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { enviarWelcome } from "@/lib/email/send";
import {
  BETA_GATE_ENABLED,
  INVITATION_COOKIE,
  consumeInvitationCode,
} from "@/lib/security/invitation";

/**
 * Endpoint que recibe el redirect del magic link de Supabase.
 * Intercambia el code por una sesión, redirige al ?next= o a /dashboard.
 *
 * Si es la primera vez del usuario (welcome_email_sent_at == null), también
 * dispara el email de bienvenida — fire-and-forget para no retrasar el redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  // Lee el usuario y verifica si necesita welcome email
  type ProfileLite = {
    email: string;
    nombre: string | null;
    welcome_email_sent_at: string | null;
  };
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, nombre, welcome_email_sent_at")
      .eq("id", user.id)
      .single<ProfileLite>();

    if (profile && !profile.welcome_email_sent_at) {
      // Marca primero (para evitar dobles envíos en casos race), luego envía
      await supabase
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", user.id);

      // Fire-and-forget — no esperamos para no retrasar el redirect
      enviarWelcome({ to: profile.email, nombre: profile.nombre }).catch(() => {
        // Log silencioso — un welcome fallido no rompe la auth
      });
    }

    // Beta gate: consume el código de invitación si lo había en cookie
    if (BETA_GATE_ENABLED) {
      const cookieStore = await cookies();
      const code = cookieStore.get(INVITATION_COOKIE)?.value;
      if (code) {
        await consumeInvitationCode({ code, userId: user.id });
        cookieStore.delete(INVITATION_COOKIE);
      }
    }
  }

  // Anti open-redirect
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}

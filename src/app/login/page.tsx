import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BETA_GATE_ENABLED } from "@/lib/security/invitation";
import { LoginForm } from "./_components/login-form";

export const metadata = { title: "Entrar" };

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  // Si ya está autenticado, redirige
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(next ?? "/dashboard");
  }

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-2 text-muted-foreground">
          Te enviamos un enlace mágico al email. Sin contraseña.
        </p>

        {error && (
          <div className="mt-6 rounded-md border border-pulse-200 bg-pulse-50 px-4 py-3 text-sm text-pulse-700">
            Hubo un problema con el enlace. Vuelve a pedir uno.
          </div>
        )}

        <div className="mt-8">
          <LoginForm next={next} betaGate={BETA_GATE_ENABLED} />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-foreground">
            Términos
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-foreground">
            Política de Privacidad
          </Link>
          .
        </p>
      </main>
    </>
  );
}

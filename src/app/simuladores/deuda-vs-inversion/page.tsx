import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SimuladorForm } from "./_components/simulador-form";

export const metadata = {
  title: "Simulador · Deuda vs Inversión",
  description:
    "Si tienes USD disponibles y deuda activa, ¿qué te conviene más: pagar la deuda o invertir?",
};

export default async function SimuladorDeudaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/simuladores/deuda-vs-inversion");
  }

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <section>
          <p className="text-sm text-brand-600 font-medium">
            Simulador · Pro
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            ¿Pago la deuda o invierto?
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl leading-relaxed">
            Si tienes un excedente de USD y al mismo tiempo cargas con deuda,
            la pregunta no es trivial. Aquí comparamos las dos opciones a 10
            años de proyección con interés compuesto.
          </p>
        </section>

        <SimuladorForm />
      </main>
    </>
  );
}

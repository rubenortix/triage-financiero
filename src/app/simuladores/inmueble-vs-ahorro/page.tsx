import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SimuladorForm } from "./_components/simulador-form";

export const metadata = {
  title: "Simulador · Inmueble vs Ahorro",
  description:
    "Si tienes una cuota inicial ahorrada, ¿qué te conviene más en 10 años: comprar inmueble con financiamiento o invertir esa plata líquida?",
};

export default async function SimuladorInmueblePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/simuladores/inmueble-vs-ahorro");
  }

  return (
    <>
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium tracking-tight"
          >
            <Activity className="h-4 w-4 text-brand-700" />
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

      <main className="mx-auto max-w-5xl px-6 sm:px-8 py-10 space-y-8">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-medium">
            Simulador · Pro
          </p>
          <h1 className="mt-2 font-serif italic text-3xl sm:text-5xl tracking-tight leading-[1.05]">
            ¿Compro inmueble
            <br />
            <span className="not-italic font-sans font-medium text-foreground/80">
              o invierto esa plata?
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
            Comparamos comprar el inmueble (con financiamiento e
            apalancamiento) vs invertir la cuota inicial al retorno esperado de
            una alternativa líquida. Cálculo a tu plazo de comparación.
          </p>
        </section>

        <SimuladorForm />
      </main>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ClipboardList, ArrowRight, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArquetipoById } from "@/lib/data/arquetipos";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Carga el último diagnóstico del usuario
  type DiagnosticoRow = {
    id: string;
    score_total: number;
    arquetipo_id: number;
    created_at: string;
  };
  const { data: diagnosticos } = await supabase
    .from("diagnosticos")
    .select("id, score_total, arquetipo_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<DiagnosticoRow[]>();

  const ultimo = diagnosticos?.[0];
  const arquetipoUltimo = ultimo ? getArquetipoById(ultimo.arquetipo_id) : null;

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-brand-600" />
            <span>Triage Financiero</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hola{user.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tu sala de triage personal. Mide tu pulso patrimonial cada 30 días.
          </p>
        </section>

        {!ultimo ? (
          <Card>
            <CardHeader>
              <CardTitle>Aún no tienes diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Empieza con 10 preguntas, 3 minutos.
              </p>
              <Button asChild>
                <Link href="/diagnostico">
                  Hacer diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tu último pulso</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-semibold tabular-nums leading-none">
                    {ultimo.score_total}
                  </span>
                  <span className="text-muted-foreground mb-1">/10</span>
                  {arquetipoUltimo && (
                    <Badge
                      variant={
                        arquetipoUltimo.nivel === "Vulnerabilidad"
                          ? "vulnerabilidad"
                          : arquetipoUltimo.nivel === "Estabilidad"
                            ? "estabilidad"
                            : "optimizacion"
                      }
                      className="ml-2 mb-1"
                    >
                      {arquetipoUltimo.nivel}
                    </Badge>
                  )}
                </div>
                {arquetipoUltimo && (
                  <h2 className="mt-2 text-xl font-semibold">
                    {arquetipoUltimo.nombre}
                  </h2>
                )}
              </div>
              <Button asChild variant="outline">
                <Link href="/diagnostico">
                  <ClipboardList className="h-4 w-4" />
                  Re-diagnosticar
                </Link>
              </Button>
            </div>

            {diagnosticos && diagnosticos.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                    Historial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border -my-2">
                    {diagnosticos.map((d) => {
                      const arq = getArquetipoById(d.arquetipo_id);
                      return (
                        <li
                          key={d.id}
                          className="flex items-center justify-between py-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {arq?.nombre ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(d.created_at).toLocaleDateString("es", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className="text-lg font-semibold tabular-nums">
                            {d.score_total}/10
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Próximamente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>· Plan 90 días personalizado por IA</p>
            <p>· Simulador deuda vs inversión</p>
            <p>· Asistente IA conversacional</p>
            <p>· Email mensual con tu evolución</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getArquetipoById, type Arquetipo } from "@/lib/data/arquetipos";
import { ChatAsistente } from "./_components/chat-asistente";
import type { MensajeChat } from "@/lib/ia/asistente";

export const metadata = {
  title: "Asistente",
  description:
    "Pregúntale dudas sobre tu arquetipo o conceptos financieros básicos al asistente Triage.",
};

type ConversacionRow = {
  id: string;
  mensajes: MensajeChat[];
  started_at: string;
};

export default async function AsistentePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/asistente");
  }

  // Carga la conversación más reciente del usuario
  const { data } = await supabase
    .from("conversaciones_ia")
    .select("id, mensajes, started_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .returns<ConversacionRow[]>();

  const conversacion = data?.[0] ?? null;
  const mensajes: MensajeChat[] = conversacion
    ? Array.isArray(conversacion.mensajes)
      ? conversacion.mensajes
      : []
    : [];

  // Trae arquetipo del último diagnóstico (para mostrar contexto)
  type DiagnosticoLite = { arquetipo_id: number };
  const { data: ultimoDiag } = await supabase
    .from("diagnosticos")
    .select("arquetipo_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DiagnosticoLite>();

  const arquetipo: Arquetipo | null = ultimoDiag
    ? (getArquetipoById(ultimoDiag.arquetipo_id) ?? null)
    : null;

  return (
    <>
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 h-16 flex items-center justify-between">
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

      <main className="mx-auto max-w-3xl w-full px-6 sm:px-8 py-8 sm:py-12 flex-1 flex flex-col">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-700 pulse-soft" />
            Asistente Triage · Claude Haiku
          </p>
          <h1 className="mt-3 font-serif italic text-3xl sm:text-4xl tracking-tight leading-tight">
            Pregúntame lo que necesites.
          </h1>
          {arquetipo ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Tengo tu contexto: arquetipo{" "}
              <strong className="text-foreground">{arquetipo.nombre}</strong>{" "}
              ({arquetipo.nivel}).
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Empieza con tu{" "}
              <Link href="/diagnostico" className="underline hover:text-foreground">
                diagnóstico
              </Link>{" "}
              para que te conozca.
            </p>
          )}
        </div>

        <ChatAsistente
          conversacionIdInicial={conversacion?.id ?? null}
          mensajesIniciales={mensajes}
        />

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-4">
          El asistente Triage da información educativa, no asesoría financiera.
          No recomienda instrumentos específicos. Para decisiones de inversión,
          consulta con un asesor acreditado en tu jurisdicción.
        </p>
      </main>
    </>
  );
}

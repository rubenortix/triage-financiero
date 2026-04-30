import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getArquetipoById } from "@/lib/data/arquetipos";
import { enviarRecordatorioMensual } from "@/lib/email/send";
import { nivelDeScore } from "@/lib/data/scoring";

/**
 * Cron handler que envía recordatorios mensuales a usuarios cuyo último
 * diagnóstico tiene >=28 días Y no han recibido recordatorio en los últimos
 * 25 días.
 *
 * Protegido por header Authorization: Bearer <CRON_SECRET>.
 *
 * En producción se invoca por Vercel Cron (config en vercel.json) cada día
 * a las 14:00 UTC. En dev se puede invocar manualmente:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *        http://localhost:3000/api/cron/email-recordatorio
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    return NextResponse.json(
      { error: "Supabase no configurado" },
      { status: 500 },
    );
  }

  // Cliente con service role — bypassa RLS para barrer todos los usuarios
  const supabase = createServerClient(url, serviceRole, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const ahora = new Date();
  const haceVeintiocho = new Date(ahora.getTime() - 28 * 24 * 60 * 60 * 1000);
  const haceVeinticinco = new Date(ahora.getTime() - 25 * 24 * 60 * 60 * 1000);

  // Trae profiles con su último diagnóstico via función RPC sería más limpio,
  // pero para MVP hacemos dos queries separadas y cruzamos en código.
  type ProfileLite = {
    id: string;
    email: string;
    nombre: string | null;
    ultimo_recordatorio_at: string | null;
  };

  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, nombre, ultimo_recordatorio_at")
    .returns<ProfileLite[]>();

  if (pErr || !profiles) {
    return NextResponse.json(
      { error: pErr?.message ?? "No se pudieron leer profiles" },
      { status: 500 },
    );
  }

  const enviados: string[] = [];
  const saltados: { user_id: string; razon: string }[] = [];

  for (const p of profiles) {
    // Skip si ya recibió recordatorio reciente
    if (
      p.ultimo_recordatorio_at &&
      new Date(p.ultimo_recordatorio_at) > haceVeinticinco
    ) {
      saltados.push({ user_id: p.id, razon: "recordatorio reciente" });
      continue;
    }

    // Trae el último diagnóstico
    type DiagLite = {
      score_total: number;
      arquetipo_id: number;
      created_at: string;
    };
    const { data: ultimoDiag } = await supabase
      .from("diagnosticos")
      .select("score_total, arquetipo_id, created_at")
      .eq("user_id", p.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<DiagLite>();

    if (!ultimoDiag) {
      saltados.push({ user_id: p.id, razon: "sin diagnostico" });
      continue;
    }

    const fechaDiag = new Date(ultimoDiag.created_at);
    if (fechaDiag > haceVeintiocho) {
      saltados.push({ user_id: p.id, razon: "diagnostico reciente" });
      continue;
    }

    const arq = getArquetipoById(ultimoDiag.arquetipo_id);
    if (!arq) {
      saltados.push({ user_id: p.id, razon: "arquetipo invalido" });
      continue;
    }

    const dias = Math.floor(
      (ahora.getTime() - fechaDiag.getTime()) / (1000 * 60 * 60 * 24),
    );

    const result = await enviarRecordatorioMensual({
      to: p.email,
      nombre: p.nombre,
      diasDesdeUltimo: dias,
      scoreActual: ultimoDiag.score_total,
      arquetipoNombre: arq.nombre,
      nivel: nivelDeScore(ultimoDiag.score_total),
    });

    if (result.ok) {
      await supabase
        .from("profiles")
        .update({ ultimo_recordatorio_at: ahora.toISOString() })
        .eq("id", p.id);
      enviados.push(p.email);
    } else {
      saltados.push({ user_id: p.id, razon: `error: ${result.error}` });
    }
  }

  return NextResponse.json({
    enviados: enviados.length,
    saltados: saltados.length,
    detalle_saltados: saltados.slice(0, 20),
    detalle_enviados: enviados,
  });
}

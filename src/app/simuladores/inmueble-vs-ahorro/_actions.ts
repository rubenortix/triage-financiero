"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_SIMULADOR_INMUEBLE } from "@/lib/data/prompts-ia";
import { getArquetipoById, type Arquetipo } from "@/lib/data/arquetipos";
import {
  calcularInmuebleVsAhorro,
  type InputInmuebleVsAhorro,
  type OutputInmuebleVsAhorro,
} from "@/lib/data/simuladores";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { Json } from "@/lib/types/database";

const schema = z.object({
  precioInmueble: z.coerce.number().positive().max(10_000_000),
  cuotaInicial: z.coerce.number().positive().max(10_000_000),
  plazoHipotecaAnos: z.coerce.number().int().min(1).max(40),
  tasaHipotecaPctEA: z.coerce.number().min(0).max(50),
  apreciacionPctEA: z.coerce.number().min(-10).max(30),
  retornoAlternativaPctEA: z.coerce.number().min(-10).max(50),
  plazoSimulacionAnos: z.coerce.number().int().min(1).max(40),
});

export type SimulacionInmuebleState =
  | { status: "idle" }
  | {
      status: "ok";
      inputs: InputInmuebleVsAhorro;
      output: OutputInmuebleVsAhorro;
      interpretacion: string | null;
      simulacionId: string | null;
    }
  | { status: "error"; error: string };

export async function simularInmuebleVsAhorro(
  _prev: SimulacionInmuebleState,
  formData: FormData,
): Promise<SimulacionInmuebleState> {
  const parsed = schema.safeParse({
    precioInmueble: formData.get("precioInmueble"),
    cuotaInicial: formData.get("cuotaInicial"),
    plazoHipotecaAnos: formData.get("plazoHipotecaAnos"),
    tasaHipotecaPctEA: formData.get("tasaHipotecaPctEA"),
    apreciacionPctEA: formData.get("apreciacionPctEA"),
    retornoAlternativaPctEA: formData.get("retornoAlternativaPctEA"),
    plazoSimulacionAnos: formData.get("plazoSimulacionAnos"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  if (parsed.data.cuotaInicial > parsed.data.precioInmueble) {
    return {
      status: "error",
      error: "La cuota inicial no puede ser mayor al precio del inmueble.",
    };
  }

  const inputs: InputInmuebleVsAhorro = parsed.data;
  const output = calcularInmuebleVsAhorro(inputs);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/simuladores/inmueble-vs-ahorro");
  }

  const rl = await checkRateLimit(supabase, user.id, "simulador");
  if (!rl.ok) {
    return {
      status: "error",
      error: `Estás simulando muy seguido. Espera ${rl.retryAfterSeconds}s.`,
    };
  }

  type DiagnosticoLite = { arquetipo_id: number };
  const { data: ultimoDiag } = await supabase
    .from("diagnosticos")
    .select("arquetipo_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<DiagnosticoLite>();

  const arquetipo: Arquetipo | undefined = ultimoDiag
    ? getArquetipoById(ultimoDiag.arquetipo_id)
    : undefined;

  let interpretacion: string | null = null;
  if (arquetipo && process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: MODELS.sonnet,
        max_tokens: 600,
        temperature: 0.5,
        system: [
          {
            type: "text",
            text: PROMPT_SIMULADOR_INMUEBLE.system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: PROMPT_SIMULADOR_INMUEBLE.buildUser({
              inputs: parsed.data,
              output: {
                pagoMensualHipoteca: output.pagoMensualHipoteca,
                equityInmuebleFinal: output.equityInmuebleFinal,
                vfInversionAlternativa: output.vfInversionAlternativa,
                ventajaInmueble: output.ventajaInmueble,
                interesesPagados: output.interesesPagados,
              },
              arquetipo,
            }),
          },
        ],
      });
      interpretacion = response.content
        .map((c) => (c.type === "text" ? c.text : ""))
        .join("")
        .trim();
    } catch {
      interpretacion = null;
    }
  }

  type SimulacionRow = { id: string };
  const { data: sim } = await supabase
    .from("simulaciones")
    .insert({
      user_id: user.id,
      tipo: "inmueble_vs_ahorro",
      inputs: inputs as unknown as Json,
      output: output as unknown as Json,
      interpretacion_ia: interpretacion,
    })
    .select("id")
    .single<SimulacionRow>();

  revalidatePath("/dashboard");

  return {
    status: "ok",
    inputs,
    output,
    interpretacion,
    simulacionId: sim?.id ?? null,
  };
}

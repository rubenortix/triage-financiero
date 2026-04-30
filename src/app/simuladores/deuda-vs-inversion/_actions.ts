"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { PROMPT_SIMULADOR_DEUDA } from "@/lib/data/prompts-ia";
import { getArquetipoById, type Arquetipo } from "@/lib/data/arquetipos";
import {
  calcularDeudaVsInversion,
  type InputDeudaVsInversion,
  type OutputDeudaVsInversion,
} from "@/lib/data/simuladores";
import type { Json } from "@/lib/types/database";

const schema = z.object({
  monto: z.coerce.number().positive("Monto debe ser positivo").max(10_000_000),
  tasaDeuda: z.coerce.number().min(0).max(200, "Tasa muy alta"),
  retornoEsperado: z.coerce.number().min(-50).max(100),
  plazoAnos: z.coerce.number().min(1).max(40),
});

export type SimulacionDeudaState =
  | { status: "idle" }
  | {
      status: "ok";
      inputs: InputDeudaVsInversion;
      output: OutputDeudaVsInversion;
      interpretacion: string | null;
      simulacionId: string | null;
    }
  | { status: "error"; error: string };

export async function simularDeudaVsInversion(
  _prev: SimulacionDeudaState,
  formData: FormData,
): Promise<SimulacionDeudaState> {
  const parsed = schema.safeParse({
    monto: formData.get("monto"),
    tasaDeuda: formData.get("tasaDeuda"),
    retornoEsperado: formData.get("retornoEsperado"),
    plazoAnos: formData.get("plazoAnos"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const inputs: InputDeudaVsInversion = {
    monto: parsed.data.monto,
    tasaDeudaPctEA: parsed.data.tasaDeuda,
    retornoEsperadoPctEA: parsed.data.retornoEsperado,
    plazoAnos: parsed.data.plazoAnos,
  };

  // Cálculo numérico SIEMPRE en código, nunca en IA
  const output = calcularDeudaVsInversion(inputs);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/simuladores/deuda-vs-inversion");
  }

  // Trae el arquetipo del usuario para contextualizar la interpretación IA
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

  // Llama a Claude Sonnet para interpretación (opcional — si falla, devolvemos
  // el cálculo sin interpretación)
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
            text: PROMPT_SIMULADOR_DEUDA.system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: PROMPT_SIMULADOR_DEUDA.buildUser({
              inputs: {
                monto: inputs.monto,
                tasaDeuda: inputs.tasaDeudaPctEA,
                retornoEsperado: inputs.retornoEsperadoPctEA,
                plazoAnos: inputs.plazoAnos,
              },
              output: {
                vfPagandoDeuda: output.ahorroPagandoDeuda,
                vfInvirtiendo: output.vfInvirtiendo,
                ganancia: output.ventajaInvertir,
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
      // Silencioso — el simulador funciona sin la interpretación
      interpretacion = null;
    }
  }

  // Guarda la simulación
  type SimulacionRow = { id: string };
  const { data: sim } = await supabase
    .from("simulaciones")
    .insert({
      user_id: user.id,
      tipo: "deuda_vs_inversion",
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

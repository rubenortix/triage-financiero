/**
 * Tipos generados de Supabase. Por ahora un placeholder mínimo —
 * se reemplaza con `supabase gen types typescript` cuando el proyecto exista.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          pais: string | null;
          etapa_carrera: "residente" | "consolidado" | "senior" | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      arquetipos: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          liquidez: number;
          diversificacion: number;
          apalancamiento: number;
          nivel: "Vulnerabilidad" | "Estabilidad" | "Optimización";
          diagnostico: string;
          ejemplo: string;
          recomendacion: string;
        };
        Insert: Database["public"]["Tables"]["arquetipos"]["Row"];
        Update: Partial<Database["public"]["Tables"]["arquetipos"]["Row"]>;
      };
      diagnosticos: {
        Row: {
          id: string;
          user_id: string;
          respuestas: Json;
          score_liquidez: number;
          score_diversificacion: number;
          score_apalancamiento: number;
          score_total: number;
          arquetipo_id: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["diagnosticos"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["diagnosticos"]["Row"]>;
      };
      planes_90_dias: {
        Row: {
          id: string;
          user_id: string;
          diagnostico_id: string;
          semanas: Json;
          model_used: string;
          generated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["planes_90_dias"]["Row"],
          "id" | "generated_at"
        > & { id?: string; generated_at?: string };
        Update: Partial<Database["public"]["Tables"]["planes_90_dias"]["Row"]>;
      };
      simulaciones: {
        Row: {
          id: string;
          user_id: string;
          tipo: string;
          inputs: Json;
          output: Json;
          interpretacion_ia: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["simulaciones"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["simulaciones"]["Row"]>;
      };
      suscripciones: {
        Row: {
          id: string;
          user_id: string;
          provider: "stripe" | "mercadopago" | "dlocal";
          provider_subscription_id: string;
          status: "trialing" | "active" | "canceled" | "past_due";
          tier: "pro" | "premium" | "circulo";
          trial_ends_at: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["suscripciones"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["suscripciones"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

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
          is_beta_tester: boolean;
          invitation_code: string | null;
          welcome_email_sent_at: string | null;
          ultimo_recordatorio_at: string | null;
          ai_calls_minute_count: number;
          ai_calls_minute_window_start: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          pais?: string | null;
          etapa_carrera?: "residente" | "consolidado" | "senior" | null;
          is_beta_tester?: boolean;
          invitation_code?: string | null;
          welcome_email_sent_at?: string | null;
          ultimo_recordatorio_at?: string | null;
          ai_calls_minute_count?: number;
          ai_calls_minute_window_start?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
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
        Relationships: [];
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
          resumen_evolucion: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          respuestas: Json;
          score_liquidez: number;
          score_diversificacion: number;
          score_apalancamiento: number;
          score_total: number;
          arquetipo_id: number;
          resumen_evolucion?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["diagnosticos"]["Insert"]>;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          diagnostico_id: string;
          semanas: Json;
          model_used: string;
          generated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["planes_90_dias"]["Insert"]>;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          tipo: string;
          inputs: Json;
          output: Json;
          interpretacion_ia?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["simulaciones"]["Insert"]>;
        Relationships: [];
      };
      conversaciones_ia: {
        Row: {
          id: string;
          user_id: string;
          mensajes: Json;
          tokens_consumidos: number;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          mensajes?: Json;
          tokens_consumidos?: number;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["conversaciones_ia"]["Insert"]>;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          provider: "stripe" | "mercadopago" | "dlocal";
          provider_subscription_id: string;
          status: "trialing" | "active" | "canceled" | "past_due";
          tier: "pro" | "premium" | "circulo";
          trial_ends_at?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["suscripciones"]["Insert"]>;
        Relationships: [];
      };
      eventos: {
        Row: {
          id: string;
          user_id: string | null;
          evento: string;
          properties: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          evento: string;
          properties?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["eventos"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      etapa_carrera: "residente" | "consolidado" | "senior";
      nivel_diagnostico: "Vulnerabilidad" | "Estabilidad" | "Optimización";
      subscription_provider: "stripe" | "mercadopago" | "dlocal";
      subscription_status: "trialing" | "active" | "canceled" | "past_due";
      subscription_tier: "pro" | "premium" | "circulo";
    };
    CompositeTypes: Record<string, never>;
  };
}

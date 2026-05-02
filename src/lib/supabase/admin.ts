/**
 * Cliente Supabase con service_role — bypassa RLS.
 *
 * SOLO usar en server-side (Server Actions, Route Handlers, cron jobs)
 * para operaciones administrativas: validar invitation codes, barrer
 * usuarios para emails masivos, etc.
 *
 * NUNCA exponer al cliente.
 */

import { createServerClient } from "@supabase/ssr";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Supabase admin no configurado: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createServerClient(url, serviceRole, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

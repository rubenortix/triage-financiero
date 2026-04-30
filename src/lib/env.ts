import { z } from "zod";

/** Strings vacíos en .env se tratan como undefined (no como string vacío). */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().url().optional());

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  ANTHROPIC_API_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  RESEND_API_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalUrl,
});

export const env = serverSchema.parse(process.env);

export function requireEnv<K extends keyof typeof env>(
  key: K,
): NonNullable<(typeof env)[K]> {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${key}. Revisa .env.local`,
    );
  }
  return value as NonNullable<(typeof env)[K]>;
}

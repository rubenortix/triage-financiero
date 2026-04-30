-- ============================================
-- Triage Financiero — Welcome email tracking
-- Fecha: 2026-04-30
-- ============================================
--
-- Agrega columna `welcome_email_sent_at` a profiles para no duplicar el
-- email de bienvenida si el usuario hace múltiples sesiones de magic link.

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

-- Columna también útil para tracking de comunicación: cuándo enviamos el
-- último recordatorio mensual a este usuario (para no spamear).
alter table public.profiles
  add column if not exists ultimo_recordatorio_at timestamptz;

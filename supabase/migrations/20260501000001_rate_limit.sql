-- ============================================
-- Triage Financiero — Rate limiting por usuario
-- Fecha: 2026-05-01
-- ============================================
--
-- Agrega contador minutal de llamadas IA por usuario para prevenir
-- abuso de costo en endpoints que llaman a Anthropic.

alter table public.profiles
  add column if not exists ai_calls_minute_count integer not null default 0;

alter table public.profiles
  add column if not exists ai_calls_minute_window_start timestamptz;

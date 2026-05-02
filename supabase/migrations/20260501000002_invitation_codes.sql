-- ============================================
-- Triage Financiero — Sistema de invitaciones beta
-- Fecha: 2026-05-01
-- ============================================
--
-- Códigos de invitación de un solo uso para gating del registro durante
-- la beta cerrada. Cuando BETA_GATE=true en env vars, /login exige código
-- válido antes de enviar el magic link.
--
-- Generar códigos:
--   insert into public.invitation_codes (code, nombre_invitado) values
--     ('TRIAGE-ABC123', 'Dr. Ramírez'),
--     ('TRIAGE-XYZ789', 'Dra. González');
--
-- O generar 30 random:
--   insert into public.invitation_codes (code, nombre_invitado)
--   select 'TRIAGE-' || upper(substring(md5(random()::text || g), 1, 6)), null
--   from generate_series(1, 30) g
--   on conflict do nothing;

create table if not exists public.invitation_codes (
  code text primary key,
  nombre_invitado text,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_invitation_codes_unused
  on public.invitation_codes(used_at)
  where used_at is null;

-- RLS: tabla administrativa — sin acceso público de lectura desde el cliente.
-- Las validaciones se hacen vía service role en Server Actions, no vía anon key.
alter table public.invitation_codes enable row level security;

-- Sin policies = nadie puede leer/escribir vía anon key. Solo service role.
-- (Es lo que queremos: el código se valida desde el server, nunca expuesto al cliente.)

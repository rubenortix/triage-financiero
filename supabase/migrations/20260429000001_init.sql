-- ============================================
-- Triage Financiero — Schema inicial (idempotente)
-- Versión: 0.1.0
-- Fecha: 2026-04-29
--
-- Este archivo se puede correr múltiples veces sin error.
-- ============================================

-- =====================
-- Extensiones requeridas
-- =====================
create extension if not exists "uuid-ossp";

-- =====================
-- Enums (idempotentes vía DO blocks)
-- =====================
do $$ begin
  create type etapa_carrera as enum ('residente', 'consolidado', 'senior');
exception when duplicate_object then null; end $$;

do $$ begin
  create type nivel_diagnostico as enum ('Vulnerabilidad', 'Estabilidad', 'Optimización');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_provider as enum ('stripe', 'mercadopago', 'dlocal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trialing', 'active', 'canceled', 'past_due');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_tier as enum ('pro', 'premium', 'circulo');
exception when duplicate_object then null; end $$;

-- =====================
-- profiles (extiende auth.users)
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text,
  pais text,
  etapa_carrera etapa_carrera,
  is_beta_tester boolean not null default false,
  invitation_code text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_pais on public.profiles(pais);

-- =====================
-- arquetipos (tabla maestra, 27 filas)
-- =====================
create table if not exists public.arquetipos (
  id integer primary key,
  codigo text not null unique,
  nombre text not null,
  liquidez smallint not null check (liquidez between 1 and 3),
  diversificacion smallint not null check (diversificacion between 1 and 3),
  apalancamiento smallint not null check (apalancamiento between 1 and 3),
  nivel nivel_diagnostico not null,
  diagnostico text not null,
  ejemplo text not null,
  recomendacion text not null,
  unique (liquidez, diversificacion, apalancamiento)
);

-- =====================
-- diagnosticos
-- =====================
create table if not exists public.diagnosticos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  respuestas jsonb not null,
  score_liquidez smallint not null check (score_liquidez between 1 and 3),
  score_diversificacion smallint not null check (score_diversificacion between 1 and 3),
  score_apalancamiento smallint not null check (score_apalancamiento between 1 and 3),
  score_total smallint not null check (score_total between 0 and 10),
  arquetipo_id integer not null references public.arquetipos(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_diagnosticos_user_created on public.diagnosticos(user_id, created_at desc);

-- =====================
-- planes_90_dias
-- =====================
create table if not exists public.planes_90_dias (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  diagnostico_id uuid not null references public.diagnosticos(id) on delete cascade,
  semanas jsonb not null,
  model_used text not null,
  generated_at timestamptz not null default now()
);

create index if not exists idx_planes_user on public.planes_90_dias(user_id, generated_at desc);

-- =====================
-- simulaciones
-- =====================
create table if not exists public.simulaciones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  inputs jsonb not null,
  output jsonb not null,
  interpretacion_ia text,
  created_at timestamptz not null default now()
);

create index if not exists idx_simulaciones_user_tipo on public.simulaciones(user_id, tipo, created_at desc);

-- =====================
-- conversaciones_ia
-- =====================
create table if not exists public.conversaciones_ia (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mensajes jsonb not null default '[]'::jsonb,
  tokens_consumidos integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists idx_conversaciones_user on public.conversaciones_ia(user_id, started_at desc);

-- =====================
-- suscripciones
-- =====================
create table if not exists public.suscripciones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider subscription_provider not null,
  provider_subscription_id text not null,
  status subscription_status not null,
  tier subscription_tier not null,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index if not exists idx_suscripciones_user_status on public.suscripciones(user_id, status);

-- =====================
-- eventos
-- =====================
create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  evento text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_eventos_evento_created on public.eventos(evento, created_at desc);
create index if not exists idx_eventos_user_created on public.eventos(user_id, created_at desc);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.diagnosticos enable row level security;
alter table public.planes_90_dias enable row level security;
alter table public.simulaciones enable row level security;
alter table public.conversaciones_ia enable row level security;
alter table public.suscripciones enable row level security;
alter table public.eventos enable row level security;
alter table public.arquetipos enable row level security;

-- arquetipos lectura pública
drop policy if exists "arquetipos lectura pública" on public.arquetipos;
create policy "arquetipos lectura pública" on public.arquetipos
  for select using (true);

-- profiles
drop policy if exists "profiles select propio" on public.profiles;
create policy "profiles select propio" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles update propio" on public.profiles;
create policy "profiles update propio" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles insert propio" on public.profiles;
create policy "profiles insert propio" on public.profiles
  for insert with check (auth.uid() = id);

-- diagnosticos
drop policy if exists "diagnosticos select propio" on public.diagnosticos;
create policy "diagnosticos select propio" on public.diagnosticos
  for select using (auth.uid() = user_id);
drop policy if exists "diagnosticos insert propio" on public.diagnosticos;
create policy "diagnosticos insert propio" on public.diagnosticos
  for insert with check (auth.uid() = user_id);

-- planes_90_dias
drop policy if exists "planes select propio" on public.planes_90_dias;
create policy "planes select propio" on public.planes_90_dias
  for select using (auth.uid() = user_id);
drop policy if exists "planes insert propio" on public.planes_90_dias;
create policy "planes insert propio" on public.planes_90_dias
  for insert with check (auth.uid() = user_id);

-- simulaciones
drop policy if exists "simulaciones select propio" on public.simulaciones;
create policy "simulaciones select propio" on public.simulaciones
  for select using (auth.uid() = user_id);
drop policy if exists "simulaciones insert propio" on public.simulaciones;
create policy "simulaciones insert propio" on public.simulaciones
  for insert with check (auth.uid() = user_id);

-- conversaciones_ia
drop policy if exists "conversaciones select propio" on public.conversaciones_ia;
create policy "conversaciones select propio" on public.conversaciones_ia
  for select using (auth.uid() = user_id);
drop policy if exists "conversaciones insert propio" on public.conversaciones_ia;
create policy "conversaciones insert propio" on public.conversaciones_ia
  for insert with check (auth.uid() = user_id);
drop policy if exists "conversaciones update propio" on public.conversaciones_ia;
create policy "conversaciones update propio" on public.conversaciones_ia
  for update using (auth.uid() = user_id);

-- suscripciones (la escritura va vía service role en webhooks)
drop policy if exists "suscripciones select propio" on public.suscripciones;
create policy "suscripciones select propio" on public.suscripciones
  for select using (auth.uid() = user_id);

-- eventos
drop policy if exists "eventos insert libre" on public.eventos;
create policy "eventos insert libre" on public.eventos
  for insert with check (true);
drop policy if exists "eventos select propio" on public.eventos;
create policy "eventos select propio" on public.eventos
  for select using (auth.uid() = user_id);

-- ============================================
-- Trigger: crear profile automáticamente al registrarse
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Trigger: updated_at en suscripciones
-- ============================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_suscripciones_updated_at on public.suscripciones;
create trigger set_suscripciones_updated_at
  before update on public.suscripciones
  for each row execute function public.set_updated_at();

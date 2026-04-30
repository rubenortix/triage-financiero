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
-- ============================================
-- Triage Financiero — Seed de los 27 arquetipos
-- Fuente de verdad: Triage_Mapa_Diagnostico.xlsx
-- ============================================

insert into public.arquetipos
  (id, codigo, nombre, liquidez, diversificacion, apalancamiento, nivel, diagnostico, ejemplo, recomendacion)
values
  (1, 'Limitada–Concentrada–Elevado', 'Círculo de riesgo', 1, 1, 1, 'Vulnerabilidad',
   'Liquidez limitada, activos concentrados y deuda alta. Sin margen para imprevistos.',
   'Inversionista con una propiedad hipotecada al 80%, sin ahorros líquidos.',
   'Reducir deuda, construir fondo de emergencia, diversificar ingresos.'),
  (2, 'Limitada–Concentrada–Saludable', 'Equilibrio frágil', 1, 1, 2, 'Vulnerabilidad',
   'Sin deuda peligrosa, pero dependiente de un único activo o ingreso.',
   'Persona con casa pagada, sin inversiones líquidas.',
   'Monetizar parte del activo, crear flujo, diversificar en instrumentos líquidos.'),
  (3, 'Limitada–Concentrada–Óptimo', 'Liquidez atrapada', 1, 1, 3, 'Vulnerabilidad',
   'Cero deuda, pero patrimonio inmovilizado en un solo activo.',
   'Inversionista con un terreno valioso sin flujo de caja.',
   'Monetizar el activo, invertir en renta mensual, mantener liquidez mínima del 20%.'),
  (4, 'Limitada–Equilibrada–Elevado', 'Caja en tensión', 1, 2, 1, 'Vulnerabilidad',
   'Diversificación moderada, pero deuda alta restringe flujo.',
   'Inversionista con dos propiedades hipotecadas y sin excedente mensual.',
   'Refinanciar deuda, reducir pasivos, controlar costos.'),
  (5, 'Limitada–Equilibrada–Saludable', 'Estabilidad vulnerable', 1, 2, 2, 'Vulnerabilidad',
   'Estructura equilibrada con deuda controlada, pero sin liquidez inmediata.',
   'Inversionista con una propiedad y un fondo de inversión, sin reservas.',
   'Crear fondo de emergencia, automatizar ahorro mensual, mejorar flujo operativo.'),
  (6, 'Limitada–Equilibrada–Óptimo', 'Potencial contenido', 1, 2, 3, 'Vulnerabilidad',
   'Sin deuda y estructura sana, pero sin flujo operativo ni liquidez real.',
   'Inversionista con activos rentables pero sin ingresos mensuales.',
   'Generar flujo pasivo, liberar capital inmovilizado, mantener balance 70/30 inversión/efectivo.'),
  (7, 'Limitada–Diversificada–Elevado', 'Diversificación sin flujo', 1, 3, 1, 'Vulnerabilidad',
   'Diversificación amplia, pero con deuda alta que neutraliza el rendimiento.',
   'Inversionista con varias propiedades hipotecadas.',
   'Reducir deuda, priorizar activos rentables, mantener ratio deuda/activos < 0.3.'),
  (8, 'Limitada–Diversificada–Saludable', 'Estructura sólida, caja débil', 1, 3, 2, 'Estabilidad',
   'Portafolio diversificado con deuda controlada, pero sin liquidez inmediata.',
   'Inversionista con fondos, acciones y bienes raíces, sin dinero disponible.',
   'Mantener 5% en efectivo, crear ingresos periódicos, ajustar flujos trimestrales.'),
  (9, 'Limitada–Diversificada–Óptimo', 'Patrimonio inmóvil', 1, 3, 3, 'Estabilidad',
   'Portafolio maduro sin deuda, pero con activos de baja liquidez.',
   'Inversionista con propiedades arrendadas y fondos cerrados sin flujo mensual.',
   'Rotar capital, incluir activos líquidos, liberar caja anual.'),
  (10, 'Funcional–Concentrada–Elevado', 'Dependencia controlada', 2, 1, 1, 'Vulnerabilidad',
   'Flujo estable pero dependiente de un solo sector y apalancado.',
   'Inversionista con dos propiedades hipotecadas que generan arriendo.',
   'Consolidar deuda, diversificar ingresos, medir rentabilidad neta.'),
  (11, 'Funcional–Concentrada–Saludable', 'Liquidez activa, foco estrecho', 2, 1, 2, 'Vulnerabilidad',
   'Liquidez adecuada y deuda sana, pero portafolio concentrado.',
   'Inversionista con un solo fondo de inversión de renta fija.',
   'Ampliar exposición, diversificar geográficamente, revisar correlación de activos.'),
  (12, 'Funcional–Concentrada–Óptimo', 'Caja fuerte pero rígida', 2, 1, 3, 'Estabilidad',
   'Sin deuda, liquidez moderada, pero sin crecimiento ni diversificación.',
   'Inversionista con alto ahorro en dólares o CDT.',
   'Asignar parte a activos de crecimiento, definir meta de rentabilidad mínima.'),
  (13, 'Funcional–Equilibrada–Elevado', 'Crecimiento apalancado', 2, 2, 1, 'Estabilidad',
   'Diversificación media, crecimiento sostenido mediante deuda.',
   'Inversionista que usa crédito para adquirir fondos y acciones.',
   'Mantener ratio deuda/patrimonio < 0.4, alinear vencimientos y retornos.'),
  (14, 'Funcional–Equilibrada–Saludable', 'Estructura funcional', 2, 2, 2, 'Estabilidad',
   'Balance estable entre liquidez, deuda y diversificación.',
   'Inversionista con fondos, renta fija y propiedad libre de hipoteca.',
   'Monitorear retornos, automatizar aportes, ajustar ante inflación.'),
  (15, 'Funcional–Equilibrada–Óptimo', 'Liquidez inteligente', 2, 2, 3, 'Estabilidad',
   'Liquidez fuerte, deuda nula y portafolio equilibrado.',
   'Inversionista con bonos, ETFs y propiedad libre de deuda.',
   'Asignar 20% a crecimiento, mantener liquidez y medir riesgo país.'),
  (16, 'Funcional–Diversificada–Elevado', 'Expansión con riesgo', 2, 3, 1, 'Estabilidad',
   'Diversificación avanzada pero con deuda alta para expandir.',
   'Inversionista con inmuebles y préstamos en curso.',
   'Reducir apalancamiento, diversificar rentas, limitar deuda al 40%.'),
  (17, 'Funcional–Diversificada–Saludable', 'Diversificación con control', 2, 3, 2, 'Optimización',
   'Buen portafolio con deuda prudente y flujo estable.',
   'Inversionista con propiedades, fondos y acciones con crédito leve.',
   'Rebalancear anual, medir retorno por clase, planificar estructura fiscal.'),
  (18, 'Funcional–Diversificada–Óptimo', 'Base sólida', 2, 3, 3, 'Optimización',
   'Portafolio diversificado sin deuda y con flujo predecible.',
   'Inversionista con activos globales y una propiedad libre.',
   'Definir metas de crecimiento, explorar inversión alternativa.'),
  (19, 'Estratégica–Concentrada–Elevado', 'Liquidez sin dirección', 3, 1, 1, 'Estabilidad',
   'Liquidez alta pero mal distribuida y endeudamiento significativo.',
   'Inversionista con efectivo alto y deudas activas en un solo tipo de activo.',
   'Reducir deuda, diversificar, definir propósito patrimonial.'),
  (20, 'Estratégica–Concentrada–Saludable', 'Capital concentrado, controlado', 3, 1, 2, 'Estabilidad',
   'Liquidez alta, deuda sana pero concentración excesiva.',
   'Inversionista con la mayoría del patrimonio en finca raíz local.',
   'Diversificar 10–15%, incorporar activos líquidos y alternativos.'),
  (21, 'Estratégica–Concentrada–Óptimo', 'Liquidez ociosa', 3, 1, 3, 'Optimización',
   'Sin deuda y con liquidez abundante pero inactiva.',
   'Inversionista con USD 200k sin invertir en cuentas remuneradas.',
   'Asignar liquidez a inversiones escalonadas, mantener 20% líquido.'),
  (22, 'Estratégica–Equilibrada–Elevado', 'Crecimiento ambicioso', 3, 2, 1, 'Optimización',
   'Liquidez sólida y portafolio diversificado pero apalancado.',
   'Inversionista con propiedades y fondos financiados con crédito.',
   'Evaluar rentabilidad neta vs. costo financiero, reducir deuda progresivamente.'),
  (23, 'Estratégica–Equilibrada–Saludable', 'Solidez integral', 3, 2, 2, 'Optimización',
   'Liquidez estable, deuda prudente y diversificación equilibrada.',
   'Inversionista con activos en renta fija, variable y propiedad.',
   'Monitorear portafolio, rebalancear y fortalecer estructura legal.'),
  (24, 'Estratégica–Equilibrada–Óptimo', 'Estructura eficiente', 3, 2, 3, 'Optimización',
   'Liquidez estratégica, sin deuda, diversificación controlada.',
   'Inversionista con portafolio internacional balanceado.',
   'Implementar métricas de performance, ampliar exposición global.'),
  (25, 'Estratégica–Diversificada–Elevado', 'Capital agresivo', 3, 3, 1, 'Optimización',
   'Diversificación avanzada con uso intensivo de apalancamiento.',
   'Inversionista sofisticado que usa deuda para expandirse globalmente.',
   'Controlar ratio deuda/patrimonio, cubrir riesgo cambiario y de tasas.'),
  (26, 'Estratégica–Diversificada–Saludable', 'Modelo sólido', 3, 3, 2, 'Optimización',
   'Estructura avanzada, deuda prudente, diversificación madura.',
   'Inversionista con propiedades y portafolios internacionales.',
   'Rebalancear anualmente, planificar fiscalmente y mantener liquidez de 6 meses.'),
  (27, 'Estratégica–Diversificada–Óptimo', 'Arquitectura patrimonial', 3, 3, 3, 'Optimización',
   'Liquidez estratégica, portafolio global y sin deuda. Nivel maestro.',
   'Inversionista con trusts o family office personal, portafolio global.',
   'Formalizar gobernanza patrimonial, sucesión e inversión de impacto.')
on conflict (id) do update set
  codigo = excluded.codigo,
  nombre = excluded.nombre,
  liquidez = excluded.liquidez,
  diversificacion = excluded.diversificacion,
  apalancamiento = excluded.apalancamiento,
  nivel = excluded.nivel,
  diagnostico = excluded.diagnostico,
  ejemplo = excluded.ejemplo,
  recomendacion = excluded.recomendacion;

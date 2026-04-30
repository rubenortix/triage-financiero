# Triage Financiero

> La primera plataforma de finanzas personales para médicos hispanohablantes.
> Diagnóstico patrimonial, decisiones puntuales asistidas por IA y coaching mensual.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + backend | Next.js 16 (App Router) + TypeScript + React 19 |
| Estilos | Tailwind CSS v4 + shadcn-style components |
| Datos / Auth / Storage | Supabase (Postgres + Auth + RLS) |
| IA | Anthropic Claude — Sonnet 4.6 + Haiku 4.5 |
| Pagos | Stripe (USD) |
| Email | Resend + React Email |
| Hosting | Vercel |

## Requisitos

- Node.js 20+ (probado con 24)
- Cuenta en Supabase, Anthropic, Stripe y Resend (pueden quedar vacías mientras desarrollas las pantallas iniciales)

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Completa los valores con tus credenciales

# 3. Levantar dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

El flujo `/diagnostico → /resultado` funciona sin Supabase, Stripe ni IA. Las
respuestas se codifican en la URL para esa demo. La persistencia y la IA se
activan cuando llenas las variables.

## Setup de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia URL y `anon key` a `.env.local`
3. Aplica el schema y seed de los 27 arquetipos:

```bash
# Si tienes Supabase CLI:
supabase link --project-ref <tu-ref>
supabase db push
psql "$SUPABASE_DB_URL" < supabase/seed.sql

# O manualmente: ve a Supabase Studio → SQL Editor y ejecuta:
#   1. supabase/migrations/20260429000001_init.sql
#   2. supabase/seed.sql
```

## Setup de Stripe

1. Cuenta en [dashboard.stripe.com](https://dashboard.stripe.com) (modo test)
2. Crea 3 productos con sus precios mensuales:
   - **Pro** — $29/mes (con trial de 15 días)
   - **Premium** — $99/mes
   - **Círculo** — $300/mes
3. Copia los `price_id` a `.env.local`
4. Configura webhook hacia `/api/stripe/webhook` con eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## Estructura de carpetas

```
src/
├── app/                          # App Router (Next.js 16)
│   ├── page.tsx                  # Landing
│   ├── diagnostico/              # 10 preguntas
│   ├── resultado/                # Pulso + arquetipo + 5 números
│   ├── layout.tsx                # Root con Inter + paleta médica
│   └── globals.css               # Tokens Tailwind v4
├── components/
│   └── ui/                       # Button, Card, Input, Label, Badge
├── lib/
│   ├── data/                     # Fuente de verdad del producto
│   │   ├── arquetipos.ts         # Los 27 arquetipos
│   │   ├── preguntas-diagnostico.ts  # Las 10 preguntas
│   │   ├── scoring.ts            # Lógica de cálculo
│   │   ├── cinco-numeros.ts      # Los 5 números de /resultado
│   │   └── prompts-ia.ts         # Templates de prompts
│   ├── supabase/                 # Clientes (browser + server + middleware)
│   ├── anthropic.ts              # Claude SDK
│   ├── stripe.ts                 # Stripe SDK
│   ├── resend.ts                 # Resend SDK
│   ├── utils.ts                  # cn() helper
│   ├── env.ts                    # Validación de variables
│   └── types/database.ts         # Tipos de DB (placeholder)
├── middleware.ts                 # Refresh de sesión Supabase
└── supabase/
    ├── migrations/
    │   └── 20260429000001_init.sql
    └── seed.sql
```

## Comandos útiles

```bash
npm run dev      # dev server con hot reload
npm run build    # build de producción
npm run start    # corre el build
```

## Documento maestro

`Triage_Mapa_Diagnostico.xlsx` (en `~/Downloads`) es la **fuente de verdad** del producto:
27 arquetipos, 10 preguntas, scoring, prompts IA, roadmap. Cualquier cambio en
esos datos se refleja AHÍ primero, después en el código.

## Roadmap próximos pasos

- [ ] Páginas legales: `/terminos`, `/privacidad`
- [ ] Auth con Supabase (signup/login con email)
- [ ] Persistir diagnóstico en `diagnosticos` después de auth
- [ ] Generación del Plan 90 días con Claude Sonnet
- [ ] Stripe Checkout + webhook → tabla `suscripciones`
- [ ] Dashboard `/dashboard` (Pro)
- [ ] Simulador "Deuda vs Inversión"
- [ ] Email mensual con Resend
- [ ] Asistente IA conversacional

Ver `Triage_Mapa_Diagnostico.xlsx` hoja "Roadmap Features" para el desglose
por tier (Free / Pro / Premium / Círculo).

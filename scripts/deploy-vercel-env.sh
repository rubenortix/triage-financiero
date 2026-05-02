#!/usr/bin/env bash
# Helper para subir todas las env vars del proyecto a Vercel production.
# Lee los valores de .env.local (gitignored) en vez de hardcodearlos.
#
# Uso:
#   VERCEL_TOKEN=vcp_... bash scripts/deploy-vercel-env.sh
#
# Requiere:
#   - .env.local presente con las vars completas
#   - VERCEL_TOKEN seteado en el shell que invoca este script
#   - npx vercel disponible (se descarga al vuelo si no)

set -e

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN no seteado. Genera uno en https://vercel.com/account/tokens"
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "Error: no se encontró .env.local en el directorio actual"
  exit 1
fi

# Lista de variables que SÍ van a Vercel production.
# (.env.local puede tener otras vars locales que no queremos exponer.)
VARS_TO_DEPLOY=(
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  RESEND_API_KEY
  RESEND_FROM_EMAIL
  CRON_SECRET
)

# Source .env.local para tener los valores en memoria (no se imprimen)
set -a
# shellcheck disable=SC1091
source .env.local
set +a

add_env() {
  local key="$1"
  local value="${!key}"
  if [ -z "$value" ]; then
    echo "  [skip] $key vacío en .env.local"
    return
  fi
  echo "  [push] $key"
  printf '%s' "$value" | npx --yes vercel@latest env add "$key" production --force >/dev/null 2>&1 || \
  printf '%s' "$value" | npx --yes vercel@latest env add "$key" production >/dev/null 2>&1 || \
    echo "  [warn] falló $key (puede que ya exista — usa env rm primero)"
}

echo "Subiendo env vars a Vercel production…"
for var in "${VARS_TO_DEPLOY[@]}"; do
  add_env "$var"
done
echo "Listo."

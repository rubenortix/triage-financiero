-- ============================================
-- Triage Financiero — Re-diagnóstico con comparativa
-- Fecha: 2026-04-30
-- ============================================
--
-- Agrega columna `resumen_evolucion` a `diagnosticos` para guardar el
-- resultado del análisis IA al comparar con el diagnóstico anterior.
--
-- Estructura del JSONB:
-- {
--   "mejoras": ["..."],
--   "alertas": ["..."],
--   "acciones": [
--     { "titulo": "...", "descripcion": "...", "prioridad": "alta"|"media"|"baja" }
--   ],
--   "diagnosticoAnteriorId": "uuid",
--   "deltaScoreTotal": 2,
--   "modelUsed": "claude-sonnet-4-6"
-- }
--
-- Se llena solo cuando el usuario ya tenía al menos un diagnóstico previo.
-- Para el primer diagnóstico de un usuario, queda null.

alter table public.diagnosticos
  add column if not exists resumen_evolucion jsonb;

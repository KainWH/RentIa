-- ════════════════════════════════════════════════════════════
--  Migración 013: Horario de atención del negocio
--  Texto libre que el agente IA usa para responder al cliente
--  cuando pregunta por horarios.
-- ════════════════════════════════════════════════════════════

alter table tenants add column if not exists business_hours text;

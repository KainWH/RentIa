-- ════════════════════════════════════════════════════════════
--  Migración 007: Campos de cumplimiento Meta/WhatsApp
--  - conversations.last_user_message_at  → ventana de 24h
--  - contacts.opted_in_at               → consentimiento documentado
--  - contacts.opt_in_source             → origen del opt-in
--  - contacts.ctwa_clid                 → atribución de Meta Ads
--  - tabla message_templates            → control de templates aprobados
-- ════════════════════════════════════════════════════════════

-- ── 1. Ventana de 24h en conversaciones ──────────────────────────────────────
-- Registra cuándo fue el ÚLTIMO mensaje del usuario (no del bot).
-- Se actualiza en el webhook cada vez que llega un mensaje entrante.
alter table conversations
  add column if not exists last_user_message_at timestamptz;

-- ── 2. Campos de opt-in en contactos ─────────────────────────────────────────
-- opted_in_at:   cuándo el usuario dio consentimiento
-- opt_in_source: cómo llegó ('ctwa_ad' | 'direct_message' | 'manual_import')
-- ctwa_clid:     Click ID de Meta Ads para atribución de ROI
alter table contacts
  add column if not exists opted_in_at   timestamptz,
  add column if not exists opt_in_source text,
  add column if not exists ctwa_clid     text;

-- ── 3. Tabla de templates de WhatsApp ────────────────────────────────────────
-- Solo se pueden enviar templates con status = 'APPROVED'.
-- Meta rechaza templates pendientes o rechazados sin aviso claro.
create table if not exists message_templates (
  id           uuid primary key default uuid_generate_v4(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  name         text not null,
  language     text not null default 'es',
  category     text not null check (category in ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  status       text not null default 'PENDING' check (status in ('APPROVED', 'PENDING', 'REJECTED')),
  approved_at  timestamptz,
  created_at   timestamptz default now(),
  unique(tenant_id, name, language)
);

alter table message_templates enable row level security;

create policy "Tenant owners can manage message templates"
  on message_templates for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

create index if not exists message_templates_tenant_status_idx
  on message_templates(tenant_id, status);

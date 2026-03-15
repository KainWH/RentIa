-- ════════════════════════════════════════════════════════════
--  Migración 003: configuración del catálogo de productos
--  Almacena el Google Sheet ID y GID por tenant
-- ════════════════════════════════════════════════════════════

create table catalog_configs (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  sheet_url  text,          -- URL completa del Google Sheet (para mostrar al usuario)
  sheet_id   text,          -- ID extraído del Sheet
  sheet_gid  text default '0',  -- GID de la pestaña
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

alter table catalog_configs enable row level security;

create policy "Tenant owners can manage catalog config"
  on catalog_configs for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );

create trigger set_updated_at_catalog_configs
  before update on catalog_configs
  for each row execute procedure update_updated_at();

-- Crear config de catálogo vacía para tenants existentes
insert into catalog_configs (tenant_id)
select id from tenants
on conflict (tenant_id) do nothing;

-- Actualizar trigger de nuevo usuario para crear catalog_config vacía
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  insert into tenants (owner_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  returning id into new_tenant_id;

  insert into whatsapp_configs (tenant_id) values (new_tenant_id);
  insert into ai_configs       (tenant_id) values (new_tenant_id);
  insert into catalog_configs  (tenant_id) values (new_tenant_id); -- vacía, opcional

  return new;
end;
$$;

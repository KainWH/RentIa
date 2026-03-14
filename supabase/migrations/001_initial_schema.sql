-- ════════════════════════════════════════════════════════════
--  RentIA — Schema inicial de la base de datos
--  Archivo: supabase/migrations/001_initial_schema.sql
--
--  CONCEPTO CLAVE: Multi-tenant
--  Cada "tenant" es un agente/empresa que paga por usar RentIA.
--  Todos comparten la misma base de datos, pero cada tabla tiene
--  un "tenant_id" que los separa. Es como tener edificios (tenants)
--  en el mismo terreno (base de datos).
-- ════════════════════════════════════════════════════════════

-- ── EXTENSIONES ──────────────────────────────────────────────
-- uuid-ossp: genera IDs únicos del tipo "550e8400-e29b-41d4-a716-446655440000"
-- Es mejor que números secuenciales porque no se puede adivinar el siguiente ID
create extension if not exists "uuid-ossp";


-- ════════════════════════════════════════════════════════════
--  TABLA: tenants
--  Un tenant = una cuenta de RentIA (un agente inmobiliario, una agencia)
--  Cuando alguien se registra, creamos un tenant para él
-- ════════════════════════════════════════════════════════════
create table tenants (
  id         uuid primary key default uuid_generate_v4(),
  -- owner_id apunta al usuario de Supabase Auth (auth.users)
  -- ON DELETE CASCADE = si se borra el usuario, se borra el tenant
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,          -- Nombre de la agencia/agente
  created_at timestamptz default now()
);

-- Índice: acelera búsquedas por owner_id (usaremos esto mucho)
create index tenants_owner_id_idx on tenants(owner_id);


-- ════════════════════════════════════════════════════════════
--  TABLA: whatsapp_configs
--  Cada tenant conecta su propio número de WhatsApp Business
--  Separado de tenants para mantener las tablas limpias
-- ════════════════════════════════════════════════════════════
create table whatsapp_configs (
  id                   uuid primary key default uuid_generate_v4(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  phone_number_id      text,          -- ID del número en Meta (no el número en sí)
  access_token         text,          -- Token de acceso de Meta (secreto)
  phone_display        text,          -- "+52 55 1234 5678" (solo para mostrar)
  is_configured        boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  unique(tenant_id)    -- Un tenant solo puede tener 1 config de WhatsApp
);


-- ════════════════════════════════════════════════════════════
--  TABLA: ai_configs
--  La configuración de IA de cada tenant
--  El "system_prompt" es la instrucción que le da personalidad al bot
-- ════════════════════════════════════════════════════════════
create table ai_configs (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  enabled       boolean default true,
  system_prompt text default 'Eres un asistente amigable de bienes raíces.
Responde de forma breve y profesional.
Cuando el lead muestre interés en una propiedad, pide su nombre y cuándo puede agendar una cita.',
  model         text default 'gemini-1.5-flash',  -- Modelo de Gemini a usar
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(tenant_id)
);


-- ════════════════════════════════════════════════════════════
--  TABLA: contacts
--  Los leads/clientes que escriben por WhatsApp
--  Se crean automáticamente cuando llega el primer mensaje
-- ════════════════════════════════════════════════════════════
create table contacts (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  phone           text not null,         -- "+5215512345678" (formato E.164)
  name            text,                  -- Puede ser null si no se conoce
  notes           text,                  -- Notas del agente sobre este lead
  created_at      timestamptz default now(),
  last_message_at timestamptz,           -- Cuándo fue el último mensaje
  -- Un mismo teléfono no puede aparecer 2 veces para el mismo tenant
  unique(tenant_id, phone)
);

create index contacts_tenant_id_idx on contacts(tenant_id);


-- ════════════════════════════════════════════════════════════
--  TABLA: conversations
--  Cada conversación es el "hilo" entre un tenant y un contacto
--  Un contacto puede tener múltiples conversaciones (a lo largo del tiempo)
-- ════════════════════════════════════════════════════════════
create table conversations (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  contact_id  uuid not null references contacts(id) on delete cascade,
  status      text default 'open' check (status in ('open', 'closed', 'archived')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index conversations_tenant_id_idx on conversations(tenant_id);
create index conversations_contact_id_idx on conversations(contact_id);


-- ════════════════════════════════════════════════════════════
--  TABLA: messages
--  Cada mensaje individual dentro de una conversación
--  direction: inbound = recibido de WhatsApp, outbound = enviado por nosotros
-- ════════════════════════════════════════════════════════════
create table messages (
  id                   uuid primary key default uuid_generate_v4(),
  conversation_id      uuid not null references conversations(id) on delete cascade,
  content              text not null,
  direction            text not null check (direction in ('inbound', 'outbound')),
  sent_by_ai           boolean default false,  -- true si lo generó OpenAI
  -- whatsapp_message_id: el ID que devuelve Meta al enviar/recibir
  -- Lo guardamos para poder marcar como leído y evitar duplicados
  whatsapp_message_id  text,
  created_at           timestamptz default now()
);

create index messages_conversation_id_idx on messages(conversation_id);


-- ════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--
--  CONCEPTO CLAVE: RLS es la seguridad de Supabase
--  Sin RLS, cualquier usuario podría leer datos de otros tenants.
--  Con RLS, Supabase revisa cada query y solo devuelve lo que le pertenece.
--
--  Funciona así:
--  1. Habilitas RLS en la tabla
--  2. Creas "políticas" que definen quién puede ver/editar qué
--  3. Supabase aplica esas políticas automáticamente
-- ════════════════════════════════════════════════════════════

-- Habilitar RLS en todas las tablas
alter table tenants          enable row level security;
alter table whatsapp_configs enable row level security;
alter table ai_configs       enable row level security;
alter table contacts         enable row level security;
alter table conversations    enable row level security;
alter table messages         enable row level security;


-- ── Políticas para: tenants ───────────────────────────────────
-- auth.uid() = el ID del usuario logueado actualmente
create policy "Users can only see their own tenant"
  on tenants for select
  using (owner_id = auth.uid());

create policy "Users can insert their own tenant"
  on tenants for insert
  with check (owner_id = auth.uid());

create policy "Users can update their own tenant"
  on tenants for update
  using (owner_id = auth.uid());


-- ── Políticas para: whatsapp_configs ─────────────────────────
-- La subconsulta verifica que el tenant pertenece al usuario logueado
create policy "Tenant owners can manage whatsapp config"
  on whatsapp_configs for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );


-- ── Políticas para: ai_configs ────────────────────────────────
create policy "Tenant owners can manage ai config"
  on ai_configs for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );


-- ── Políticas para: contacts ──────────────────────────────────
create policy "Tenant owners can manage contacts"
  on contacts for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );


-- ── Políticas para: conversations ────────────────────────────
create policy "Tenant owners can manage conversations"
  on conversations for all
  using (
    tenant_id in (select id from tenants where owner_id = auth.uid())
  );


-- ── Políticas para: messages ──────────────────────────────────
-- Messages no tiene tenant_id directo, así que hay que hacer join
create policy "Tenant owners can manage messages"
  on messages for all
  using (
    conversation_id in (
      select id from conversations
      where tenant_id in (
        select id from tenants where owner_id = auth.uid()
      )
    )
  );


-- ════════════════════════════════════════════════════════════
--  FUNCIÓN: handle_new_user()
--
--  CONCEPTO: Trigger de base de datos
--  Un trigger es código que se ejecuta AUTOMÁTICAMENTE cuando
--  ocurre un evento (INSERT, UPDATE, DELETE) en una tabla.
--
--  Este trigger escucha cuando se crea un nuevo usuario en auth.users
--  y automáticamente crea:
--  1. Su tenant (con nombre genérico)
--  2. Su config de WhatsApp (vacía)
--  3. Su config de IA (con prompt por defecto)
--
--  Así el usuario ya tiene todo listo al registrarse.
-- ════════════════════════════════════════════════════════════
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
-- security definer: se ejecuta como el dueño de la función (postgres = superusuario)
-- set search_path = public: CRÍTICO en Supabase — sin esto no encuentra las tablas
as $$
declare
  new_tenant_id uuid;
begin
  -- 1. Crear el tenant usando el nombre del metadata del usuario
  insert into tenants (owner_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
    -- coalesce: usa el primero que no sea null
    -- Si el usuario ingresó su nombre: lo usa
    -- Si no: usa la parte del email antes del @
  )
  returning id into new_tenant_id;

  -- 2. Crear config de WhatsApp vacía
  insert into whatsapp_configs (tenant_id) values (new_tenant_id);

  -- 3. Crear config de IA con valores por defecto
  insert into ai_configs (tenant_id) values (new_tenant_id);

  return new;
end;
$$;

-- Conectar la función al evento de creación de usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ════════════════════════════════════════════════════════════
--  FUNCIÓN: update_updated_at()
--  Actualiza automáticamente la columna updated_at cuando se modifica una fila
-- ════════════════════════════════════════════════════════════
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_whatsapp_configs
  before update on whatsapp_configs
  for each row execute procedure update_updated_at();

create trigger set_updated_at_ai_configs
  before update on ai_configs
  for each row execute procedure update_updated_at();

create trigger set_updated_at_conversations
  before update on conversations
  for each row execute procedure update_updated_at();


-- ════════════════════════════════════════════════════════════
--  POLÍTICA ESPECIAL: service_role para el webhook
--
--  El webhook de WhatsApp usa SUPABASE_SERVICE_ROLE_KEY
--  que tiene acceso total (bypassa RLS).
--  No necesita políticas especiales — puede hacer todo.
--
--  IMPORTANTE: nunca expongas SERVICE_ROLE_KEY al navegador.
--  Solo úsala en el servidor (API Routes, no componentes de React).
-- ════════════════════════════════════════════════════════════

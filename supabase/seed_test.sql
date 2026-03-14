insert into contacts (tenant_id, phone, name, last_message_at)
values (
  '5487fd06-3099-42aa-b821-f8140526e3b2',
  '+5215512345678',
  'Juan Pérez',
  now()
);

insert into conversations (tenant_id, contact_id)
select '5487fd06-3099-42aa-b821-f8140526e3b2', id
from contacts
where phone = '+5215512345678'
and tenant_id = '5487fd06-3099-42aa-b821-f8140526e3b2';

insert into messages (conversation_id, content, direction, sent_by_ai)
select id, '¿Hola, tienen propiedades en Polanco?', 'inbound', false
from conversations
where tenant_id = '5487fd06-3099-42aa-b821-f8140526e3b2'
order by created_at desc limit 1;

insert into messages (conversation_id, content, direction, sent_by_ai)
select id, '¡Hola Juan! Sí, tenemos varias opciones en Polanco. ¿Cuál es tu presupuesto aproximado?', 'outbound', true
from conversations
where tenant_id = '5487fd06-3099-42aa-b821-f8140526e3b2'
order by created_at desc limit 1;

insert into messages (conversation_id, content, direction, sent_by_ai)
select id, 'Tengo un presupuesto de 5 millones.', 'inbound', false
from conversations
where tenant_id = '5487fd06-3099-42aa-b821-f8140526e3b2'
order by created_at desc limit 1;

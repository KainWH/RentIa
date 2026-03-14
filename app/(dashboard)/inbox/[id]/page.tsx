// Vista de conversación — ruta: /inbox/[id]
// Muestra todos los mensajes de una conversación específica

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) redirect("/login")

  // Cargar la conversación con los datos del contacto
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      id,
      status,
      contacts (
        id,
        name,
        phone
      )
    `)
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)  // Seguridad: solo puede ver sus propias conversaciones
    .single()

  if (!conversation) notFound()

  const contact = Array.isArray(conversation.contacts)
    ? conversation.contacts[0]
    : conversation.contacts

  const displayName = contact?.name ?? contact?.phone ?? "Desconocido"

  // Cargar todos los mensajes de la conversación (más antiguos primero)
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, direction, sent_by_ai, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })

  return (
    <div className="flex flex-col h-full -m-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b flex-shrink-0">
        <Link href="/inbox" className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          ←
        </Link>
        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
          {displayName[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{displayName}</p>
          <p className="text-xs text-gray-400">{contact?.phone}</p>
        </div>
      </div>

      {/* ── Mensajes ── */}
      <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-3 bg-gray-50">
        {!messages || messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">
            No hay mensajes en esta conversación
          </p>
        ) : (
          messages.map((msg) => {
            const isInbound = msg.direction === "inbound"
            const time = new Date(msg.created_at).toLocaleTimeString("es-MX", {
              hour:   "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 max-w-[70%] ${
                  isInbound ? "self-start" : "self-end items-end"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isInbound
                      ? "bg-white border text-gray-900 rounded-tl-sm"
                      : "bg-green-600 text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{time}</span>
                  {msg.sent_by_ai && (
                    <span className="text-xs text-gray-400">· 🤖 IA</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}

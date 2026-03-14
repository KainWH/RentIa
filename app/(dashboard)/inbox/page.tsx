// Inbox — lista de conversaciones
// Server Component: carga datos directamente desde Supabase

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function InboxPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) redirect("/login")

  // Traer conversaciones con los datos del contacto incluidos (JOIN)
  // order by updated_at: las más recientes primero
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      status,
      updated_at,
      contacts (
        id,
        name,
        phone
      )
    `)
    .eq("tenant_id", tenant.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-500 text-sm">Todas tus conversaciones de WhatsApp</p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-900 font-medium">Aún no hay conversaciones</p>
          <p className="text-gray-400 text-sm mt-1">
            Conecta tu número de WhatsApp en{" "}
            <Link href="/settings" className="text-green-600 hover:underline">
              Configuración
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          {conversations.map((conv, index) => {
            // contacts puede ser objeto o array según la query — normalizamos
            const contact = Array.isArray(conv.contacts) ? conv.contacts[0] : conv.contacts
            const displayName = contact?.name ?? contact?.phone ?? "Desconocido"
            const formattedDate = new Date(conv.updated_at).toLocaleDateString("es-MX", {
              day:   "numeric",
              month: "short",
              hour:  "2-digit",
              minute: "2-digit",
            })

            return (
              <Link
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition ${
                  index !== conversations.length - 1 ? "border-b" : ""
                }`}
              >
                {/* Avatar con inicial */}
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {displayName[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">{displayName}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-400 truncate">{contact?.phone}</span>
                    {conv.status !== "open" && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
                        {conv.status}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-gray-300 flex-shrink-0">›</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

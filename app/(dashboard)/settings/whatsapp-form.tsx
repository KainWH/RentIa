"use client"
// Formulario de WhatsApp — Client Component
// Necesita "use client" porque usamos useState para mostrar mensajes de éxito/error

import { useState } from "react"
import { saveWhatsappConfig } from "./actions"
import type { WhatsappConfig } from "@/types"

export default function WhatsappForm({ config }: { config: WhatsappConfig | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(formData: FormData) {
    setStatus("loading")
    const result = await saveWhatsappConfig(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setStatus("error")
    } else {
      setStatus("success")
    }
  }

  return (
    <section className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp Business</h2>
      <p className="text-sm text-gray-500 mb-4">
        Ingresa las credenciales de tu app en{" "}
        <a
          href="https://developers.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          Meta for Developers
        </a>
      </p>

      <form action={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number ID</label>
          <p className="text-xs text-gray-400 mb-1">
            En Meta Developer → Tu App → WhatsApp → API Setup → Phone Number ID
          </p>
          <input
            name="phone_number_id"
            type="text"
            defaultValue={config?.phone_number_id ?? ""}
            placeholder="123456789012345"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Access Token</label>
          <p className="text-xs text-gray-400 mb-1">
            En Meta Developer → Tu App → WhatsApp → API Setup → Temporary/Permanent Token
          </p>
          <input
            name="access_token"
            type="password"
            defaultValue={config?.access_token ?? ""}
            placeholder="EAABsbCS..."
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Número de teléfono</label>
          <p className="text-xs text-gray-400 mb-1">
            El número en formato internacional, solo para mostrarlo en la UI
          </p>
          <input
            name="phone_display"
            type="text"
            defaultValue={config?.phone_display ?? ""}
            placeholder="+52 55 1234 5678"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">
            ✅ Configuración guardada
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {status === "loading" ? "Guardando..." : "Guardar"}
          </button>
          {config?.is_configured && (
            <span className="text-xs text-green-600 font-medium">● Conectado</span>
          )}
        </div>
      </form>
    </section>
  )
}

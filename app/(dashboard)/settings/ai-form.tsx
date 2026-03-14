"use client"
// Formulario de configuración de IA — Client Component

import { useState } from "react"
import { saveAiConfig } from "./actions"
import type { AiConfig } from "@/types"

export default function AiForm({ config }: { config: AiConfig | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(formData: FormData) {
    setStatus("loading")
    const result = await saveAiConfig(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setStatus("error")
    } else {
      setStatus("success")
    }
  }

  return (
    <section className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Asistente IA</h2>
      <p className="text-sm text-gray-500 mb-4">
        Define cómo responde tu asistente automático en WhatsApp
      </p>

      <form action={handleSubmit} className="flex flex-col gap-4">
        {/* Toggle para activar/desactivar la IA */}
        <div className="flex items-center gap-3">
          <input
            name="enabled"
            id="enabled"
            type="checkbox"
            defaultChecked={config?.enabled ?? true}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Respuestas automáticas activadas
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Prompt del sistema</label>
          <p className="text-xs text-gray-400 mb-1">
            Instrucciones que definen la personalidad y comportamiento de tu asistente
          </p>
          <textarea
            name="system_prompt"
            rows={6}
            defaultValue={config?.system_prompt ?? ""}
            placeholder="Ej: Eres un asistente amigable de bienes raíces. Responde de forma breve y profesional. Cuando el lead muestre interés en una propiedad, pide su nombre y cuándo puede agendar una cita."
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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

        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {status === "loading" ? "Guardando..." : "Guardar prompt"}
        </button>
      </form>
    </section>
  )
}

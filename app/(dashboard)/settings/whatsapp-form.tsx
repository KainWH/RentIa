"use client"

import { useState } from "react"
import type { WhatsappConfig } from "@/types"

type VerifyResult = {
  ok: boolean
  displayPhoneNumber?: string
  verifiedName?: string
  qualityRating?: string
  error?: string
}

export default function WhatsappForm({ config }: { config: WhatsappConfig | null }) {
  const [phoneNumberId, setPhoneNumberId] = useState(config?.phone_number_id ?? "")
  const [accessToken, setAccessToken]     = useState("")
  const [status, setStatus]   = useState<"idle" | "saving" | "verifying" | "connected" | "error">("idle")
  const [errorMsg, setErrorMsg]     = useState("")
  const [verified, setVerified]     = useState<VerifyResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    setVerified(null)

    // 1. Guardar credenciales
    const saveRes = await fetch("/api/settings/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number_id: phoneNumberId,
        access_token:    accessToken,
      }),
    })

    const saveData = await saveRes.json()
    if (saveData.error) {
      setErrorMsg(saveData.error)
      setStatus("error")
      return
    }

    // 2. Verificar conexión con Meta
    setStatus("verifying")
    const verifyRes  = await fetch("/api/settings/whatsapp/verify")
    const verifyData: VerifyResult = await verifyRes.json()

    setVerified(verifyData)
    setStatus(verifyData.ok ? "connected" : "error")
    if (!verifyData.ok) setErrorMsg(verifyData.error ?? "No se pudo verificar la conexión")
  }

  return (
    <section className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp Business</h2>
      <p className="text-sm text-gray-500 mb-4">
        Ingresa las credenciales de tu app en{" "}
        <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
          Meta for Developers
        </a>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number ID</label>
          <p className="text-xs text-gray-400 mb-1">Meta Developer → Tu App → WhatsApp → API Setup → Phone Number ID</p>
          <input
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="123456789012345"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Access Token</label>
          <p className="text-xs text-gray-400 mb-1">Meta Developer → Tu App → WhatsApp → API Setup → Token</p>
          {config?.is_configured && (
            <p className="text-xs text-green-600 mb-1">● Token ya configurado — deja vacío para mantenerlo</p>
          )}
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder={config?.is_configured ? "••••••••••••••••" : "EAABsbCS..."}
            required={!config?.is_configured}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Resultado de verificación */}
        {status === "connected" && verified?.ok && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex flex-col gap-0.5">
            <p className="text-green-700 text-sm font-semibold">✅ Conectado con Meta</p>
            {verified.verifiedName && (
              <p className="text-green-600 text-xs">Cuenta: <span className="font-medium">{verified.verifiedName}</span></p>
            )}
            {verified.displayPhoneNumber && (
              <p className="text-green-600 text-xs">Número: <span className="font-medium">{verified.displayPhoneNumber}</span></p>
            )}
            {verified.qualityRating && (
              <p className="text-green-600 text-xs">Calidad: <span className="font-medium">{verified.qualityRating}</span></p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            ❌ {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving" || status === "verifying"}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {status === "saving"    ? "Guardando..."    :
             status === "verifying" ? "Verificando..."  : "Guardar y verificar"}
          </button>
          {config?.is_configured && status === "idle" && (
            <span className="text-xs text-green-600 font-medium">● Configurado</span>
          )}
        </div>
      </form>
    </section>
  )
}

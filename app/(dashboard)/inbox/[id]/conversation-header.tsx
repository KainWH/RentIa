"use client"

import { useState } from "react"
import { ArrowLeft, Bot, PauseCircle, Info } from "lucide-react"
import Link from "next/link"

type Props = {
  conversationId: string
  displayName:    string
  phone:          string
  status:         string
  aiPaused:       boolean
  avatarColor:    string
  onInfoClick?:   () => void
}

export default function ConversationHeader({ conversationId, displayName, phone, status, aiPaused: initialAiPaused, avatarColor, onInfoClick }: Props) {
  const [aiPaused, setAiPaused] = useState(initialAiPaused)
  const [loading, setLoading]   = useState(false)
  const initials = displayName.slice(0, 2).toUpperCase()

  async function toggleBot() {
    setLoading(true)
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ai_paused: !aiPaused }),
    })
    if (res.ok) setAiPaused(!aiPaused)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 shrink-0">

      {/* Botón volver — mobile */}
      <Link
        href="/inbox"
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-all lg:hidden shrink-0"
      >
        <ArrowLeft size={16} />
      </Link>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white shadow-md"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>

      {/* Nombre y teléfono */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 leading-tight truncate">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          <p className="text-xs text-slate-500 truncate">{phone}</p>
        </div>
      </div>

      {/* Estado conversación — solo desktop */}
      <span className={`hidden md:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
        status === "open"
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-slate-700/50 text-slate-400 border-slate-700"
      }`}>
        {status === "open" ? "Activa" : "Cerrada"}
      </span>

      {/* Toggle Bot — icono + texto en desktop, solo icono en mobile */}
      <button
        onClick={toggleBot}
        disabled={loading}
        title={aiPaused ? "Bot pausado" : "IA activa"}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium border transition-all shrink-0 ${
          aiPaused
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
        } disabled:opacity-50`}
      >
        {aiPaused ? <PauseCircle size={13} /> : <Bot size={13} />}
        <span className="hidden md:inline">{aiPaused ? "Bot pausado" : "IA activa"}</span>
      </button>

      {/* Botón info / panel — solo mobile */}
      {onInfoClick && (
        <button
          onClick={onInfoClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-all shrink-0"
          title="Ver detalles"
        >
          <Info size={16} />
        </button>
      )}
    </div>
  )
}

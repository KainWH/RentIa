"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ConversationHeader from "./conversation-header"

type Props = {
  conversationId: string
  displayName:    string
  phone:          string
  status:         string
  aiPaused:       boolean
  avatarColor:    string
  leadDetails:    React.ReactNode
  children:       React.ReactNode
}

export default function ConversationShell({
  conversationId,
  displayName,
  phone,
  status,
  aiPaused,
  avatarColor,
  leadDetails,
  children,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <>
      {/* Panel central — Chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        <ConversationHeader
          conversationId={conversationId}
          displayName={displayName}
          phone={phone}
          status={status}
          aiPaused={aiPaused}
          avatarColor={avatarColor}
          onInfoClick={() => setPanelOpen(true)}
        />
        {children}
      </div>

      {/* Panel derecho — desktop (siempre visible en lg+) */}
      <div className="hidden lg:contents">
        {leadDetails}
      </div>

      {/* Panel derecho — mobile drawer */}
      {panelOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setPanelOpen(false)}
        />
      )}
      <div className={`
        lg:hidden fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw]
        transition-transform duration-300 ease-in-out
        ${panelOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Botón cerrar */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => setPanelOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/90 text-slate-400 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {leadDetails}
      </div>
    </>
  )
}

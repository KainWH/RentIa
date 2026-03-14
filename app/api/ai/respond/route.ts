// API Route: /api/ai/respond
// Recibe un mensaje y devuelve una respuesta generada por Gemini

import { NextRequest, NextResponse } from "next/server"
import { generateReply } from "@/lib/ai"

export async function POST(request: NextRequest) {
  const { message, systemPrompt, conversationHistory } = await request.json()

  if (!message) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 })
  }

  const prompt = systemPrompt ||
    "Eres un asistente de bienes raíces amable y profesional. Responde en español de forma concisa."

  const reply = await generateReply({
    userMessage: message,
    systemPrompt: prompt,
    conversationHistory: conversationHistory ?? [],
  })

  return NextResponse.json({ reply }, { status: 200 })
}

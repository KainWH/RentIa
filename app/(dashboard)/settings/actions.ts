"use server"
// Server Actions — se ejecutan en el servidor, no en el navegador
// Las llamamos directamente desde los formularios sin necesidad de crear API routes

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ── Guardar configuración de WhatsApp ──
export async function saveWhatsappConfig(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Obtener el tenant del usuario
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return { error: "No se encontró tu cuenta" }

  const phoneNumberId = formData.get("phone_number_id") as string
  const accessToken   = formData.get("access_token") as string
  const phoneDisplay  = formData.get("phone_display") as string

  const { error } = await supabase
    .from("whatsapp_configs")
    .update({
      phone_number_id: phoneNumberId,
      access_token:    accessToken,
      phone_display:   phoneDisplay,
      is_configured:   true,
    })
    .eq("tenant_id", tenant.id)

  if (error) return { error: error.message }

  // revalidatePath limpia el caché de Next.js para que la página muestre datos frescos
  revalidatePath("/settings")
  return { success: true }
}

// ── Guardar configuración de IA ──
export async function saveAiConfig(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!tenant) return { error: "No se encontró tu cuenta" }

  const systemPrompt = formData.get("system_prompt") as string
  // Los checkboxes envían "on" si están marcados, null si no
  const enabled = formData.get("enabled") === "on"

  const { error } = await supabase
    .from("ai_configs")
    .update({
      system_prompt: systemPrompt,
      enabled:       enabled,
    })
    .eq("tenant_id", tenant.id)

  if (error) return { error: error.message }

  revalidatePath("/settings")
  return { success: true }
}

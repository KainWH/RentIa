import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const { name, business_hours } = body

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })

  const update: { name: string; business_hours?: string | null } = { name: name.trim() }
  if (business_hours !== undefined) {
    const trimmed = typeof business_hours === "string" ? business_hours.trim() : ""
    update.business_hours = trimmed || null
  }

  const { error } = await supabase
    .from("tenants")
    .update(update)
    .eq("owner_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

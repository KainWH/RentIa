"use client"

// Botón de cerrar sesión — necesita ser "use client" porque
// llama a Supabase desde el navegador y luego redirige

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-red-500 transition text-left"
    >
      Cerrar sesión
    </button>
  )
}

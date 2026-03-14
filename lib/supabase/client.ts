// Cliente de Supabase para el NAVEGADOR (componentes del lado del cliente)
// Usa "use client" components o hooks de React

import { createBrowserClient } from "@supabase/ssr"

// Esta función crea una instancia del cliente cada vez que la llamas
// Las variables NEXT_PUBLIC_ son seguras de exponer al navegador
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

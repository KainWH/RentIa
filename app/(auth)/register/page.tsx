"use client"
// "use client" → este componente corre en el NAVEGADOR, no en el servidor
// Necesario cuando usamos: useState, eventos (onClick, onChange), etc.

// Página de registro — ruta: /register

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  // Estado del formulario
  // useState = variable que cuando cambia, React re-renderiza la pantalla
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")

  // Estado de la UI
  const [loading, setLoading] = useState(false)  // Para mostrar "Cargando..."
  const [error,   setError]   = useState("")     // Para mostrar errores

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()  // Evita que el navegador recargue la página (comportamiento por defecto de <form>)
    setLoading(true)
    setError("")

    // Llamada a Supabase Auth para crear el usuario
    // El campo "data: { name }" guarda el nombre en raw_user_meta_data
    // (nuestro trigger lo usa para nombrar el tenant)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      // Traducir errores comunes al español
      if (error.message.includes("already registered")) {
        setError("Este email ya está registrado. ¿Quieres iniciar sesión?")
      } else if (error.message.includes("Password")) {
        setError("La contraseña debe tener al menos 6 caracteres.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Si todo salió bien, redirigir al dashboard
    // El trigger de Supabase ya creó el tenant automáticamente
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h1>
        <p className="text-gray-500 mb-6 text-sm">14 días gratis, sin tarjeta de crédito</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-green-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}

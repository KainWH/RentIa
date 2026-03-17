"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, ArrowRight, Zap } from "lucide-react"

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message.includes("Invalid login")
        ? "Email o contraseña incorrectos."
        : error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-[#008060] flex items-center justify-center shadow-lg shadow-green-200">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta de SomosKaino</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm shadow-gray-100 p-7 flex flex-col gap-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-[#008060] hover:bg-[#006b51] active:translate-y-px text-white font-semibold text-sm py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : (<>Ingresar <ArrowRight size={14} /></>)}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-[#008060] font-semibold hover:text-[#006b51] transition-colors">
            Regístrate gratis
          </a>
        </p>

      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import { login } from '../../../lib/panel'

/**
 * Pantalla de acceso al panel del barbero (Supabase Auth).
 * El registro está cerrado: la cuenta de Adrián se crea manualmente.
 */
export default function LoginPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError('')
    const res = await login(email.trim(), password)
    setEnviando(false)
    if (!res.ok) setError(res.error)
    // Si va bien, useAuth detecta la sesión y el panel cambia solo.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tinta px-5 text-hueso">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoAdriComponent className="h-16 w-16" />
          <div>
            <p className="text-xs tracking-kicker text-acento">Panel del barbero</p>
            <h1 className="mt-1 font-display text-2xl font-bold">Acceso</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-sm text-hueso/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-tinta-700 bg-tinta-800 px-4 py-3 text-hueso outline-none transition-colors placeholder:text-hueso/30 focus:border-acento"
              placeholder="tu@email.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-hueso/70">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-tinta-700 bg-tinta-800 px-4 py-3 text-hueso outline-none transition-colors placeholder:text-hueso/30 focus:border-acento"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-acento py-3.5 font-semibold text-tinta transition-colors hover:bg-acento-claro disabled:opacity-60"
          >
            {enviando ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            Entrar
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-hueso/50 transition-colors hover:text-acento"
        >
          <ArrowLeft size={15} />
          Volver a la web
        </Link>
      </div>
    </div>
  )
}

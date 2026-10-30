// #region Imports
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { Lock, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { AuthenticationService } from '../../../../services/AuthenticationService'
// #endregion

const claseCampo =
  'w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-hueso outline-none transition-all placeholder:text-hueso/25 focus:border-acento focus:bg-white/[0.07] focus:ring-4 focus:ring-acento/15'

/**
 * Pantalla de acceso al panel del barbero (Supabase Auth).
 * El registro está cerrado: la cuenta de Adrián se crea manualmente.
 *
 * En escritorio, el sello a la izquierda y el formulario a la derecha; en el
 * móvil, el sello arriba y el formulario debajo.
 */
const LoginComponent = () => {
  // #region Declaraciones, variables y hooks
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (enviando) return
    if (!email.trim() || !password) {
      setError('Escribe tu email y tu contraseña.')
      setIntento((n) => n + 1)
      return
    }
    setEnviando(true)
    setError('')
    const res = await AuthenticationService.login(email.trim(), password)
    setEnviando(false)
    if (!res.ok) {
      setError(res.error)
      setIntento((n) => n + 1)
    }
    // Si va bien, useAuth detecta la sesión y el panel cambia solo.
  }
  // #endregion

  // #region Renderizado
  return (
    <div className="grain relative flex min-h-svh items-center justify-center overflow-hidden bg-tinta-900 px-5 py-10 text-hueso">
      {/* Halo dorado y sello gigante girando de fondo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(40rem 30rem at 30% 40%, rgba(196,160,90,0.14), transparent 70%)' }}
      />
      <img
        src="/logo-sello.webp"
        alt=""
        aria-hidden="true"
        className="gira-lento pointer-events-none absolute -bottom-40 -left-40 w-[36rem] opacity-[0.05]"
      />

      <div className="relative grid w-full max-w-4xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Marca. */}
        <m.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_SMOOTH }}
        >
          <img
            src="/logo-sello.webp"
            alt="A.S Peluquería y Barbería"
            className="sello-entra w-36 drop-shadow-2xl sm:w-44 lg:w-64"
          />
          <p className="mt-6 text-xs tracking-kicker text-acento">Panel del barbero</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Hola, <span className="italic text-acento">Adrián</span>
          </h1>
          <p className="mt-3 hidden max-w-xs text-hueso/55 lg:block">
            Tu agenda, tu horario y tus precios, en un sitio. Entra para ver qué toca hoy.
          </p>
        </m.div>

        {/* Formulario (tiembla si hay error). */}
        <m.form
          key={intento}
          onSubmit={onSubmit}
          noValidate
          className="mx-auto w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm sm:p-8"
          initial={intento ? { x: 0 } : { opacity: 0, y: 24 }}
          animate={intento ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
          transition={intento ? { duration: 0.4 } : { duration: 0.8, delay: 0.15, ease: EASE_SMOOTH }}
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-hueso/50">Email</span>
            <span className="relative block">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-hueso/35" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                inputMode="email"
                className={claseCampo}
                placeholder="tu@email.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-hueso/50">Contraseña</span>
            <span className="relative block">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-hueso/35" />
              <input
                type={verClave ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`${claseCampo} pr-12`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-hueso/40 transition-colors hover:text-acento"
              >
                {verClave ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <PrimaryButtonComponent type="submit" cargando={enviando} className="w-full">
            {!enviando && <Lock size={17} />}
            {enviando ? 'Entrando…' : 'Entrar'}
          </PrimaryButtonComponent>

          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 pt-2 text-sm text-hueso/45 transition-colors hover:text-acento"
          >
            <ArrowLeft size={15} />
            Volver a la web
          </Link>
        </m.form>
      </div>
    </div>
  )
  // #endregion
}

export default LoginComponent

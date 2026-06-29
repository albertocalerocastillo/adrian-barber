import { useState } from 'react'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { crearCita } from '../../../lib/citas'
import { sumarMin } from '../../../utils/disponibilidad'
import { fechaLarga, hora as fmtHora } from '../../../utils/fechas'

/** Móvil español: 9 dígitos empezando por 6, 7, 8 o 9 (ignorando espacios). */
function movilValido(v) {
  return /^[6789]\d{8}$/.test(v.replace(/\s+/g, ''))
}
function emailValido(v) {
  return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

/**
 * Paso 4: datos del cliente y confirmación final.
 * Al confirmar, guarda la cita (Supabase o localStorage). Si el hueco se
 * acaba de ocupar, avisa para que elija otra hora.
 */
export default function PasoDatos({ servicio, fecha, hora, onConfirmado, onAtras }) {
  const [nombre, setNombre] = useState('')
  const [movil, setMovil] = useState('')
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [tocado, setTocado] = useState(false)

  const fin = sumarMin(hora, servicio.duracion)
  const nombreOk = nombre.trim().length >= 2
  const movilOk = movilValido(movil)
  const emailOk = emailValido(email)
  const formOk = nombreOk && movilOk && emailOk

  async function onSubmit(e) {
    e.preventDefault()
    setTocado(true)
    if (!formOk || enviando) return

    setEnviando(true)
    setError('')
    const res = await crearCita({
      servicioId: servicio.id,
      servicioNombre: servicio.nombre,
      clienteNombre: nombre.trim(),
      clienteMovil: movil.replace(/\s+/g, ''),
      clienteEmail: email.trim(),
      inicio: hora,
      fin,
    })
    setEnviando(false)

    if (res.ok) onConfirmado()
    else setError(res.error)
  }

  return (
    <div>
      {/* Resumen de la cita */}
      <div className="mb-6 rounded-2xl bg-tinta p-5 text-hueso">
        <p className="text-xs tracking-kicker text-acento">Tu cita</p>
        <p className="mt-2 font-display text-xl font-semibold capitalize">
          {fechaLarga(fecha)}
        </p>
        <p className="text-hueso/80">
          {fmtHora(hora)} – {fmtHora(fin)} h
        </p>
        <p className="mt-2 text-sm text-hueso/60">
          {servicio.nombre} · {servicio.duracion} min · {servicio.precio} €
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Campo
          label="Nombre"
          value={nombre}
          onChange={setNombre}
          placeholder="Tu nombre"
          error={tocado && !nombreOk ? 'Dinos tu nombre' : ''}
        />
        <Campo
          label="Móvil"
          value={movil}
          onChange={setMovil}
          type="tel"
          placeholder="600 00 00 00"
          error={tocado && !movilOk ? 'Móvil no válido (9 dígitos)' : ''}
        />
        <Campo
          label="Email (opcional)"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="tucorreo@email.com"
          error={tocado && !emailOk ? 'Email no válido' : ''}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-acento py-4 font-semibold text-tinta transition-colors hover:bg-acento-claro disabled:opacity-60"
        >
          {enviando ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Confirmando…
            </>
          ) : (
            'Confirmar cita'
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={onAtras}
        className="mt-6 flex items-center gap-1.5 text-sm text-tinta/60 transition-colors hover:text-tinta"
      >
        <ArrowLeft size={16} />
        Cambiar hora
      </button>
    </div>
  )
}

function Campo({ label, value, onChange, error, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-tinta/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-tinta outline-none transition-colors placeholder:text-tinta/30 focus:border-acento ${
          error ? 'border-red-300' : 'border-hueso-200'
        }`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

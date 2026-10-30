// #region Imports
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, User, Phone, ShieldCheck } from 'lucide-react'
import { addMinutes } from '../../../../utils/availability'
import { limpiarMovil } from '../bookingRules'
import { BookingService } from '../../../../services/BookingService'
// #endregion

const claseCampo =
  'w-full rounded-2xl border bg-white py-4 pl-12 pr-4 text-base text-tinta outline-none transition-all placeholder:text-tinta/30 focus:border-acento focus:ring-4 focus:ring-acento/15'

/**
 * Paso 4: nombre y móvil, y confirmar.
 * Solo se pide lo imprescindible (nada de email: no se usaba para nada).
 * Si la base de datos rechaza la hora (alguien la ha cogido justo antes, o se
 * ha cerrado ese rato), se vuelve a la elección de hora con el aviso.
 */
const DetailsStepComponent = ({ servicio, hora, onConfirmado, onHoraPerdida }) => {
  // #region Declaraciones, variables y hooks
  const [nombre, setNombre] = useState('')
  const [movil, setMovil] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [tocado, setTocado] = useState(false)

  const nombreOk = nombre.trim().length >= 2
  const movilLimpio = limpiarMovil(movil)
  const formOk = nombreOk && !!movilLimpio

  const onSubmit = async (e) => {
    e.preventDefault()
    setTocado(true)
    if (!formOk || enviando) return

    setEnviando(true)
    setError('')
    const datos = {
      servicioId: servicio.id,
      servicioNombre: servicio.nombre,
      clienteNombre: nombre.trim().replace(/\s+/g, ' '),
      clienteMovil: movilLimpio,
      inicio: hora,
      fin: addMinutes(hora, servicio.duracion),
    }
    const res = await BookingService.crearCita(datos)
    setEnviando(false)

    if (res.ok) onConfirmado(datos)
    else if (res.volverAHoras) onHoraPerdida(res.error)
    else setError(res.error)
  }
  // #endregion

  // #region Renderizado
  return (
    <div>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold sm:text-3xl">¿A nombre de quién?</h2>

      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4" noValidate>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-tinta/50">Nombre</span>
          <span className="relative block">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tinta/30" />
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="given-name"
              maxLength={60}
              placeholder="Tu nombre"
              aria-invalid={tocado && !nombreOk}
              className={`${claseCampo} ${tocado && !nombreOk ? 'border-red-300' : 'border-hueso-200'}`}
            />
          </span>
          {tocado && !nombreOk && <span className="mt-1.5 block text-xs text-red-600">Dinos tu nombre</span>}
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-tinta/50">Móvil</span>
          <span className="relative block">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tinta/30" />
            <input
              value={movil}
              onChange={(e) => setMovil(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              placeholder="600 00 00 00"
              aria-invalid={tocado && !movilLimpio}
              className={`${claseCampo} ${tocado && !movilLimpio ? 'border-red-300' : 'border-hueso-200'}`}
            />
          </span>
          <span className={`mt-1.5 block text-xs ${tocado && !movilLimpio ? 'text-red-600' : 'text-tinta/45'}`}>
            {tocado && !movilLimpio
              ? 'Pon un móvil español de 9 cifras'
              : 'Por si hay que avisarte de algún cambio. No te vamos a escribir para nada más.'}
          </span>
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-acento py-4 text-base font-semibold text-tinta shadow-lg shadow-acento/30 transition-all hover:bg-acento-claro active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Reservando…
            </>
          ) : (
            'Confirmar cita'
          )}
        </button>

        <p className="flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-tinta/45">
          <ShieldCheck size={15} className="mt-px shrink-0 text-acento-oscuro" />
          <span>
            Tu nombre y tu móvil solo los ve Adrián, para gestionar esta cita.{' '}
            <Link to="/privacidad" target="_blank" className="underline hover:text-acento-oscuro">
              Política de privacidad
            </Link>
          </span>
        </p>
      </form>
    </div>
  )
  // #endregion
}

export default DetailsStepComponent

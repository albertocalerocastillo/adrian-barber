// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { Check, Phone } from 'lucide-react'
import WhatsAppIconComponent from '../../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { formatTime as fmtHora } from '../../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { formatoEuros, minutos } from '../agendaUtils'
import type { INextAppointmentProps } from './INextAppointmentProps'
// #endregion

// #region Constantes
// Enlace de WhatsApp con el prefijo de España.
const URL_WHATSAPP = 'https://wa.me/34'

// Espacios del móvil, que se quitan para los enlaces.
const PATRON_ESPACIOS = /\s+/g

// Minutos de una hora.
const MINUTOS_HORA = 60
// #endregion

/** "Ahora", "En 20 min" o "A las 17:30". */
const cuandoTexto = (inicio: Date, ahora: Date): string => {
  const min = minutos(ahora, inicio)
  const result = min <= 0 ? 'Ahora' : min < MINUTOS_HORA ? `En ${min} min` : `A las ${fmtHora(inicio)}`
  return result
}

/** La siguiente cita de hoy, bien a la vista, con sus botones. */
const NextAppointmentComponent: FunctionComponent<INextAppointmentProps> = ({ citas, ahora, precios, onEstado }) => {
  // #region Declaraciones, variables y hooks
  const siguiente = citas
    .filter((c) => c.estado === EstadoCitaEnum.Pendiente && new Date(c.fin) > ahora)
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())[0]

  if (!siguiente) return null

  const ini = new Date(siguiente.inicio)
  const fin = new Date(siguiente.fin)
  const enCurso = ini <= ahora
  const movil = (siguiente.clienteMovil || '').replace(PATRON_ESPACIOS, '')
  const precio = precios.get(siguiente.servicioNombre)
  // #endregion

  // #region Renderizado
  return (
    <m.section
      key={siguiente.id}
      aria-label="Siguiente cita"
      className="grain relative mb-6 overflow-hidden rounded-3xl bg-tinta p-5 text-hueso shadow-xl shadow-tinta/20 sm:p-7"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_SMOOTH }}
    >
      <img
        src="/logo-sello.webp"
        alt=""
        aria-hidden="true"
        className="gira-lento pointer-events-none absolute -right-16 -top-16 w-56 opacity-[0.07] sm:w-72"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs tracking-kicker text-acento">
            {enCurso && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acento opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-acento" />
              </span>
            )}
            {enCurso ? 'Ahora en la silla' : `Siguiente · ${cuandoTexto(ini, ahora)}`}
          </p>
          <p className="mt-2 truncate font-display text-3xl font-bold sm:text-4xl">{siguiente.clienteNombre}</p>
          <p className="mt-1 text-sm text-hueso/65">
            {fmtHora(ini)} – {fmtHora(fin)} · {siguiente.servicioNombre}
            {precio !== undefined && ` · ${formatoEuros(precio)} €`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {movil && (
            <>
              <a
                href={`tel:${movil}`}
                aria-label={`Llamar a ${siguiente.clienteNombre}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Phone size={19} />
              </a>
              <a
                href={`${URL_WHATSAPP}${movil}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp a ${siguiente.clienteNombre}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
              >
                <WhatsAppIconComponent size={20} />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => onEstado(siguiente, EstadoCitaEnum.Atendida, `${siguiente.clienteNombre.split(' ')[0]}, atendido`)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-acento px-6 font-semibold text-tinta transition-all hover:bg-acento-claro active:scale-[0.97] sm:flex-none"
          >
            <Check size={18} /> Atendido
          </button>
        </div>
      </div>
    </m.section>
  )
  // #endregion
}

export default NextAppointmentComponent

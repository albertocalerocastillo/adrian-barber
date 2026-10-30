// #region Imports
import type { FunctionComponent } from 'react'
import { CalendarClock, Check, Clock, Phone, RotateCcw, X } from 'lucide-react'
import WhatsAppIconComponent from '../../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { formatTime as fmtHora } from '../../../../../utils/dates'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { OrigenCitaEnum } from '../../../../../services/enums/OrigenCitaEnum'
import { formatoEuros } from '../agendaUtils'
import type { IAppointmentCardProps } from './IAppointmentCardProps'
// #endregion

// #region Constantes
// Enlace de WhatsApp con el prefijo de España.
const URL_WHATSAPP = 'https://wa.me/34'

// Espacios del móvil, que se quitan para los enlaces.
const PATRON_ESPACIOS = /\s+/g
// #endregion

/** Tarjeta de una cita en la vista día, con llamar, WhatsApp, cambiar, cancelar y atendido. */
const AppointmentCardComponent: FunctionComponent<IAppointmentCardProps> = ({ cita, ahora, precios, onEstado, onMover }) => {
  // #region Declaraciones, variables y hooks
  const ini = new Date(cita.inicio)
  const fin = new Date(cita.fin)
  const atendida = cita.estado === EstadoCitaEnum.Atendida
  const enCurso = !atendida && ini <= ahora && ahora < fin
  const movil = (cita.clienteMovil || '').replace(PATRON_ESPACIOS, '')
  const precio = precios.get(cita.servicioNombre)
  const nombre = cita.clienteNombre.split(' ')[0]
  // #endregion

  // #region Renderizado
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5 ${
        atendida ? 'border-green-200/80 bg-green-50/40' : enCurso ? 'border-acento ring-2 ring-acento/25' : 'border-hueso-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 font-display text-sm font-bold tabular-nums text-acento-oscuro sm:hidden">
            {fmtHora(ini)} – {fmtHora(fin)}
          </p>
          <p className={`flex items-center gap-2 font-display text-lg font-bold sm:text-xl ${atendida ? 'text-tinta/55' : ''}`}>
            <span className="truncate">{cita.clienteNombre}</span>
            {/* Reservada por el cliente desde la web (no metida a mano). */}
            {cita.origen === OrigenCitaEnum.Web && (
              <span title="Reservada desde la web" className="shrink-0 rounded-full bg-tinta px-2 py-0.5 font-body text-[0.6rem] font-semibold uppercase tracking-wider text-acento">
                Web
              </span>
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-tinta/55">
            <span>{cita.servicioNombre}</span>
            <span className="hidden items-center gap-1 sm:flex">
              <span className="text-tinta/25">·</span>
              <Clock size={13} /> {fmtHora(ini)}–{fmtHora(fin)}
            </span>
            {precio !== undefined && (
              <>
                <span className="text-tinta/25">·</span>
                <span className="font-semibold text-tinta/70">{formatoEuros(precio)} €</span>
              </>
            )}
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
            atendida
              ? 'bg-green-100 text-green-700'
              : enCurso
                ? 'bg-acento text-tinta'
                : 'bg-acento/15 text-acento-oscuro'
          }`}
        >
          {atendida ? <Check size={12} strokeWidth={3} /> : <span className={`h-1.5 w-1.5 rounded-full ${enCurso ? 'animate-pulse bg-tinta' : 'bg-acento-oscuro'}`} />}
          {atendida ? 'Atendido' : enCurso ? 'Ahora' : 'Pendiente'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {movil && (
          <>
            <a
              href={`tel:${movil}`}
              aria-label={`Llamar a ${nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-tinta/70 transition-colors hover:border-acento hover:text-acento-oscuro"
            >
              <Phone size={16} />
            </a>
            <a
              href={`${URL_WHATSAPP}${movil}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp a ${nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-[#128C4B] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
            >
              <WhatsAppIconComponent size={16} />
            </a>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {atendida ? (
            <button
              type="button"
              onClick={() => onEstado(cita, EstadoCitaEnum.Pendiente, 'Vuelve a pendiente')}
              className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
            >
              <RotateCcw size={15} /> Deshacer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onMover(cita)}
                aria-label={`Cambiar la hora de ${nombre}`}
                title="Cambiar día u hora"
                className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
              >
                <CalendarClock size={17} />
                <span className="hidden min-[400px]:inline">Cambiar</span>
              </button>
              <button
                type="button"
                onClick={() => onEstado(cita, EstadoCitaEnum.Cancelada, `Cita de ${nombre} cancelada`)}
                aria-label={`Cancelar la cita de ${nombre}`}
                title="Cancelar cita"
                className="flex h-10 w-10 items-center justify-center rounded-full text-tinta/35 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEstado(cita, EstadoCitaEnum.Atendida, `${nombre}, atendido`)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-sm shadow-green-600/25 transition-all hover:bg-green-700 active:scale-[0.97]"
              >
                <Check size={16} /> Atendido
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
  // #endregion
}

export default AppointmentCardComponent

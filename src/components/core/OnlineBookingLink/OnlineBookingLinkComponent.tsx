// #region Imports
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, ArrowRight } from 'lucide-react'
import { RESERVAS_ONLINE, reservaEmpezada, inicioReservas } from '../../../data/features'
import type { IOnlineBookingLinkProps } from './IOnlineBookingLinkProps'
// #endregion

// #region Constantes
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
// #endregion

/**
 * Píldora "NUEVO · Reserva online desde el 1 de enero" mientras aún no ha
 * empezado: el botón principal sigue siendo WhatsApp (para quien quiere cita
 * ya), y esto, bien visible, deja coger hueco online para enero en adelante. Cuando empieza la reserva, el
 * botón principal ya lleva a /reserva y este enlace desaparece solo.
 */
const OnlineBookingLinkComponent: FunctionComponent<IOnlineBookingLinkProps> = ({ light = false, className = '' }) => {
  // #region Declaraciones, variables y hooks
  if (!RESERVAS_ONLINE || reservaEmpezada()) return null

  const mes = MESES[inicioReservas().getMonth()]
  // #endregion

  // #region Renderizado
  return (
    <Link
      to="/reserva"
      className={`group inline-flex max-w-full items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-all hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${
        light
          ? 'border-acento/40 bg-acento/10 text-hueso shadow-lg shadow-acento/10 hover:border-acento hover:bg-acento/20'
          : 'border-acento/50 bg-white text-tinta shadow-md shadow-acento/15 hover:border-acento'
      } ${className}`}
    >
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-acento px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-tinta">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tinta opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tinta" />
        </span>
        Nuevo
      </span>
      <span className="min-w-0 truncate">
        Reserva online <span className="hidden sm:inline">desde el 1 de {mes}</span>
        <span className="sm:hidden">desde {mes}</span>
      </span>
      <CalendarCheck size={16} className="hidden shrink-0 text-acento sm:block" />
      <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
  // #endregion
}

export default OnlineBookingLinkComponent

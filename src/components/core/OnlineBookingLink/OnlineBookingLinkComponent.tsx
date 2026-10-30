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
 * Enlace secundario a la reserva online mientras aún no ha empezado: el botón
 * principal sigue siendo WhatsApp (para quien quiere cita ya), y esto deja
 * coger hueco online para enero en adelante. Cuando empieza la reserva, el
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
      className={`group inline-flex items-center gap-2 text-sm transition-colors ${
        light ? 'text-hueso/70 hover:text-acento' : 'text-tinta/60 hover:text-acento-oscuro'
      } ${className}`}
    >
      <CalendarCheck size={16} className="text-acento" />
      <span>
        ¿Para {mes} o después? <span className="font-semibold underline decoration-acento/50 underline-offset-4">Resérvalo online</span>
      </span>
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
  // #endregion
}

export default OnlineBookingLinkComponent

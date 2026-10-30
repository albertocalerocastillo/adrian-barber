// #region Imports
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Scissors, CalendarDays, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatLongDate, formatTimeInZone } from '../../../../utils/dates'
import { RESERVA } from '../../../../data/features'
import { EASE_SMOOTH } from '../../../../theme/animation'
import type { IBookingSummaryProps } from './IBookingSummaryProps'
// #endregion

/** Cada cosa elegida que se enseña en el resumen. */
interface PiezaResumen {
  /** Icono de la pieza. */
  Icono: LucideIcon;
  /** Texto de la pieza. */
  texto: string;
}

/** Lo elegido hasta ahora, siempre a la vista. */
const BookingSummaryComponent: FunctionComponent<IBookingSummaryProps> = ({ servicio, fecha, hora }) => {
  // #region Renderizado
  if (!servicio) return null
  const piezas: PiezaResumen[] = [
    { Icono: Scissors, texto: `${servicio.nombre} · ${servicio.precio} €` },
    ...(fecha ? [{ Icono: CalendarDays, texto: formatLongDate(fecha) }] : []),
    ...(hora ? [{ Icono: Clock, texto: formatTimeInZone(hora, RESERVA.zona) }] : []),
  ]

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      <AnimatePresence initial={false}>
        {piezas.map(({ Icono, texto }) => (
          <m.span
            key={texto}
            className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 ring-hueso-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
          >
            <Icono size={14} className="text-acento-oscuro" />
            {texto}
          </m.span>
        ))}
      </AnimatePresence>
    </div>
  )
  // #endregion
}

export default BookingSummaryComponent

// #region Imports
import type { FunctionComponent } from 'react'
import { CalendarPlus } from 'lucide-react'
import { formatTime as fmtHora } from '../../../../../utils/dates'
import { minutos } from '../agendaUtils'
import type { IFreeSlotProps } from './IFreeSlotProps'
// #endregion

// #region Constantes
// Minutos de una hora.
const MINUTOS_HORA = 60
// #endregion

/** "45 min", "1 h" o "1 h 30 min". */
const duracionTexto = (min: number): string => {
  const horas = Math.floor(min / MINUTOS_HORA)
  const resto = min % MINUTOS_HORA
  const result = min < MINUTOS_HORA ? `${min} min` : resto ? `${horas} h ${resto} min` : `${horas} h`
  return result
}

/** Hueco libre del horario en la vista día, con botón para meter una cita justo ahí. */
const FreeSlotComponent: FunctionComponent<IFreeSlotProps> = ({ hueco, onNueva }) => {
  // #region Renderizado
  return (
    <button
      type="button"
      onClick={onNueva}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-tinta/15 px-4 py-3.5 text-left transition-all hover:border-acento hover:bg-acento/5 sm:px-5"
    >
      <span className="text-sm text-tinta/50">
        <span className="font-medium text-tinta/70">Libre</span> · {fmtHora(hueco.inicio)}–{fmtHora(hueco.fin)}
        <span className="hidden text-tinta/35 sm:inline"> · {duracionTexto(minutos(hueco.inicio, hueco.fin))}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-tinta/5 px-3 py-1.5 text-xs font-semibold text-tinta/60 transition-colors group-hover:bg-acento group-hover:text-tinta">
        <CalendarPlus size={14} /> Cita aquí
      </span>
    </button>
  )
  // #endregion
}

export default FreeSlotComponent

// #region Imports
import type { FunctionComponent } from 'react'
import { formatLongDate, formatShortDate, isSameDay, diaAbierto } from '../../../../../utils/dates'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { capital, diasDeLaSemana } from '../agendaUtils'
import type { IDayStripProps } from './IDayStripProps'
// #endregion

// #region Constantes
// Puntitos de cita que se pintan como mucho en cada día.
const MAXIMO_PUNTOS = 4
// #endregion

/**
 * Tira con los 7 días de la semana (con puntitos de cuántas citas hay) para
 * saltar de un día a otro de un toque.
 */
const DayStripComponent: FunctionComponent<IDayStripProps> = ({ inicio, dia, ahora, citas, horario, onElegir }) => {
  // #region Declaraciones, variables y hooks
  const dias = diasDeLaSemana(inicio)
  // #endregion

  // #region Renderizado
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {dias.map((d) => {
        const n = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada && isSameDay(new Date(c.inicio), d)).length
        const elegido = isSameDay(d, dia)
        const hoy = isSameDay(d, ahora)
        const cerrado = horario && !diaAbierto(d, horario)
        const { diaSemana, dia: num } = formatShortDate(d)
        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onElegir(d)}
            aria-pressed={elegido}
            aria-label={`${capital(formatLongDate(d))}, ${n} citas`}
            className={`relative flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-all duration-300 active:scale-95 sm:py-3 ${
              elegido
                ? 'bg-tinta text-hueso shadow-lg shadow-tinta/20'
                : hoy
                  ? 'bg-acento/10 text-tinta ring-1 ring-acento/40'
                  : 'text-tinta hover:bg-tinta/5'
            } ${cerrado && !elegido ? 'opacity-45' : ''}`}
          >
            <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${elegido ? 'text-acento' : 'text-tinta/45'}`}>
              {diaSemana}
            </span>
            <span className="font-display text-lg font-bold leading-none sm:text-xl">{num}</span>
            {/* Un puntito por cita (máx. 4). */}
            <span className="flex h-1.5 items-center gap-0.5">
              {Array.from({ length: Math.min(n, MAXIMO_PUNTOS) }, (_, i) => (
                <span key={i} className={`h-1 w-1 rounded-full ${elegido ? 'bg-acento' : 'bg-acento-oscuro'}`} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
  // #endregion
}

export default DayStripComponent

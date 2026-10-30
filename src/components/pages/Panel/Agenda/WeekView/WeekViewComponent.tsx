// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { formatShortDate, formatTime as fmtHora, isSameDay, diaAbierto } from '../../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { bloqueoEnDia, diasDeLaSemana } from '../agendaUtils'
import type { IWeekViewProps } from './IWeekViewProps'
// #endregion

// #region Constantes
// Retraso de la animación de entrada entre un día y el siguiente, en segundos.
const RETRASO_DIA_S = 0.04
// #endregion

/** Vista SEMANA: los 7 días de un vistazo; tocar un día lleva a ese día. */
const WeekViewComponent: FunctionComponent<IWeekViewProps> = ({ inicio, citas, bloqueos, horario, ahora, onDia }) => {
  // #region Declaraciones, variables y hooks
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const dias = diasDeLaSemana(inicio)
  // #endregion

  // #region Renderizado
  return (
    <div className="grid gap-3 md:grid-cols-7 md:gap-2">
      {dias.map((d, i) => {
        const delDia = activas
          .filter((c) => isSameDay(new Date(c.inicio), d))
          .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
        const bloqueado = bloqueos.some((b) => bloqueoEnDia(b, d))
        const cerrado = !diaAbierto(d, horario)
        const { diaSemana, dia: num } = formatShortDate(d)
        const hoy = isSameDay(d, ahora)

        return (
          <m.button
            key={d.toISOString()}
            type="button"
            onClick={() => onDia(d)}
            className={`flex items-start gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-acento hover:shadow-md md:min-h-56 md:flex-col md:gap-3 md:p-3 ${
              hoy ? 'border-acento ring-2 ring-acento/20' : 'border-hueso-200'
            } ${cerrado && delDia.length === 0 ? 'opacity-50' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * RETRASO_DIA_S, ease: EASE_SMOOTH }}
          >
            <div className="w-10 shrink-0 text-center md:flex md:w-full md:items-baseline md:justify-between md:text-left">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-tinta/45">{diaSemana}</p>
              <p className="font-display text-2xl font-bold leading-tight">{num}</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 md:w-full md:flex-col md:flex-nowrap">
              {delDia.length === 0 && !bloqueado && (
                <p className="pt-1 text-sm text-tinta/35">{cerrado ? 'Cerrado' : 'Sin citas'}</p>
              )}
              {bloqueado && (
                <span className="rounded-lg bg-tinta/10 px-2 py-1 text-xs text-tinta/60">Cerrado un rato</span>
              )}
              {delDia.map((c) => (
                <span
                  key={c.id}
                  className={`truncate rounded-lg px-2 py-1 text-xs font-medium ${
                    c.estado === EstadoCitaEnum.Atendida ? 'bg-green-100 text-green-800' : 'bg-acento/15 text-tinta'
                  }`}
                >
                  <span className="tabular-nums">{fmtHora(new Date(c.inicio))}</span> {c.clienteNombre.split(' ')[0]}
                </span>
              ))}
            </div>
          </m.button>
        )
      })}
    </div>
  )
  // #endregion
}

export default WeekViewComponent

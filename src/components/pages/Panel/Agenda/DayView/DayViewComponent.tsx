// #region Imports
import { useState } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Coffee, Moon, Plus, RotateCcw } from 'lucide-react'
import AppointmentCardComponent from '../AppointmentCard/AppointmentCardComponent'
import BlockCardComponent from '../BlockCard/BlockCardComponent'
import FreeSlotComponent from '../FreeSlot/FreeSlotComponent'
import { formatTime as fmtHora, startOfDay, diaAbierto } from '../../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { TipoEntradaDiaEnum } from '../../../../../services/enums/TipoEntradaDiaEnum'
import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { BloqueoDTO } from '../../../../../services/dtos/BloqueoDTO'
import { huecosLibres } from '../agendaUtils'
import type { HuecoLibre } from '../agendaUtils'
import type { IDayViewProps } from './IDayViewProps'
// #endregion

// #region Constantes
// Retraso de la animación de entrada entre una entrada y la siguiente, en segundos.
const RETRASO_ENTRADA_S = 0.04

// A partir de esta entrada ya no se suma más retraso.
const MAXIMO_ENTRADAS_CON_RETRASO = 8
// #endregion

/** Una entrada de la línea de tiempo del día: una cita, un rato cerrado o un hueco libre. */
interface EntradaDia {
  /** Qué es la entrada. */
  tipo: TipoEntradaDiaEnum;
  /** Hora a la que se coloca en la línea de tiempo. */
  inicio: Date;
  /** La cita, si es una cita. */
  cita?: CitaDTO;
  /** El rato cerrado, si es un bloqueo. */
  bloqueo?: BloqueoDTO;
  /** El hueco, si es un rato libre. */
  hueco?: HuecoLibre;
}

/**
 * Vista DÍA: línea de tiempo con las citas, los ratos cerrados y los HUECOS
 * LIBRES (con botón para meter una cita justo ahí). Las canceladas van aparte,
 * plegadas, por si hay que recuperar alguna.
 */
const DayViewComponent: FunctionComponent<IDayViewProps> = ({
  dia, ahora, horario, citas, bloqueos, precios, onEstado, onMover, onQuitarBloqueo, onNuevaEn,
}) => {
  // #region Declaraciones, variables y hooks
  const [verCanceladas, setVerCanceladas] = useState<boolean>(false)
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const canceladas = citas.filter((c) => c.estado === EstadoCitaEnum.Cancelada)
  const abierto = diaAbierto(dia, horario)
  const pasado = startOfDay(dia) < startOfDay(ahora)

  const libres = pasado ? [] : huecosLibres(dia, horario, [...activas, ...bloqueos], ahora)

  const entradas: EntradaDia[] = [
    ...activas.map((c) => ({ tipo: TipoEntradaDiaEnum.Cita, inicio: new Date(c.inicio), cita: c })),
    ...bloqueos.map((b) => ({
      tipo: TipoEntradaDiaEnum.Bloqueo,
      inicio: new Date(Math.max(new Date(b.inicio).getTime(), dia.getTime())),
      bloqueo: b,
    })),
    ...libres.map((l) => ({ tipo: TipoEntradaDiaEnum.Libre, inicio: l.inicio, hueco: l })),
  ].sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
  // #endregion

  // #region Renderizado
  if (entradas.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-tinta/15 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tinta/5 text-tinta/40">
          {abierto ? <Coffee size={24} /> : <Moon size={24} />}
        </span>
        <p className="mt-4 font-display text-xl font-semibold">{abierto ? 'Sin citas' : 'Día cerrado'}</p>
        <p className="mt-1 max-w-xs text-sm text-tinta/50">
          {pasado
            ? 'Este día ya pasó y no tuvo citas.'
            : abierto
              ? 'No queda hueco libre en el horario de hoy.'
              : 'Según tu horario, este día no se trabaja. Puedes meter una cita igualmente.'}
        </p>
        {!pasado && (
          <button
            type="button"
            onClick={() => onNuevaEn()}
            className="mt-5 flex items-center gap-2 rounded-full bg-acento px-5 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-acento-claro"
          >
            <Plus size={17} /> Añadir cita
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <ol className="relative space-y-3">
        {/* Hilo vertical de la línea de tiempo. */}
        <span aria-hidden="true" className="absolute bottom-3 left-[4.25rem] top-3 hidden w-px bg-hueso-200 sm:block" />

        {entradas.map((e, i) => (
          <m.li
            key={`${e.tipo}-${e.cita?.id ?? e.bloqueo?.id ?? e.inicio.getTime()}`}
            className="relative flex gap-3 sm:gap-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, MAXIMO_ENTRADAS_CON_RETRASO) * RETRASO_ENTRADA_S, ease: EASE_SMOOTH }}
          >
            {/* En el móvil la hora va dentro de cada tarjeta: así cabe el nombre entero. */}
            <div className="hidden w-14 shrink-0 pt-4 text-right sm:block">
              <p className={`font-display text-sm font-bold tabular-nums sm:text-base ${e.tipo === TipoEntradaDiaEnum.Libre ? 'text-tinta/35' : ''}`}>
                {fmtHora(e.inicio)}
              </p>
            </div>
            <span
              aria-hidden="true"
              className={`relative z-10 mt-5 hidden h-3 w-3 shrink-0 rounded-full ring-4 ring-hueso sm:block ${
                e.tipo === TipoEntradaDiaEnum.Libre
                  ? 'border-2 border-tinta/20 bg-hueso'
                  : e.tipo === TipoEntradaDiaEnum.Bloqueo
                    ? 'bg-tinta/30'
                    : e.cita?.estado === EstadoCitaEnum.Atendida
                      ? 'bg-green-500'
                      : 'bg-acento'
              }`}
            />
            <div className="min-w-0 flex-1">
              {e.cita && <AppointmentCardComponent cita={e.cita} ahora={ahora} precios={precios} onEstado={onEstado} onMover={onMover} />}
              {e.bloqueo && <BlockCardComponent bloqueo={e.bloqueo} onQuitar={onQuitarBloqueo} />}
              {e.hueco && <FreeSlotComponent hueco={e.hueco} onNueva={() => onNuevaEn(fmtHora(e.inicio))} />}
            </div>
          </m.li>
        ))}
      </ol>

      {canceladas.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setVerCanceladas((v) => !v)}
            className="text-xs font-semibold uppercase tracking-widest text-tinta/40 transition-colors hover:text-tinta"
          >
            {verCanceladas ? 'Ocultar' : 'Ver'} canceladas ({canceladas.length})
          </button>
          <AnimatePresence>
            {verCanceladas && (
              <m.ul
                className="mt-3 space-y-2 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_SMOOTH }}
              >
                {canceladas.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-tinta/5 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate text-tinta/45 line-through">
                      {fmtHora(new Date(c.inicio))} · {c.clienteNombre} · {c.servicioNombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEstado(c, EstadoCitaEnum.Pendiente, 'Cita recuperada')}
                      className="flex shrink-0 items-center gap-1 text-xs font-semibold text-acento-oscuro hover:underline"
                    >
                      <RotateCcw size={13} /> Recuperar
                    </button>
                  </li>
                ))}
              </m.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
  // #endregion
}

export default DayViewComponent

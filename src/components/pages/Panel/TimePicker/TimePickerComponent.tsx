// #region Imports
import type { FunctionComponent } from 'react'
import { Loader2, CalendarX } from 'lucide-react'
import { formatTime } from '../../../../utils/dates'
import type { HuecoDTO } from '../../../../services/dtos/HuecoDTO'
import type { ITimePickerProps } from './ITimePickerProps'
// #endregion

// #region Constantes
// La tarde empieza tras la comida (14:00–14:30).
const AFTERNOON_START_HOUR = 14
// #endregion

/** Grupo de horas de la rejilla (mañana o tarde). */
interface ISlotGroup {
  /** Título del grupo. */
  title: string;
  /** Horas del grupo. */
  slots: HuecoDTO[];
}

/**
 * Rejilla de horas libres, partida en mañana y tarde para encontrar la hora
 * antes. `slots` null = cargando. `value` es el ISO de la hora elegida.
 */
const TimePickerComponent: FunctionComponent<ITimePickerProps> = ({ slots, value, onChange }) => {
  // #region Declaraciones, variables y hooks
  if (slots === null) {
    return (
      <p className="flex items-center gap-2 py-3 text-sm text-tinta/50">
        <Loader2 size={16} className="animate-spin" /> Buscando huecos libres…
      </p>
    )
  }
  if (slots.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-tinta/5 px-4 py-4 text-sm text-tinta/60">
        <CalendarX size={18} /> No hay huecos libres ese día. Prueba otro.
      </p>
    )
  }

  const groups: ISlotGroup[] = [
    { title: 'Mañana', slots: slots.filter((slot) => slot.inicio.getHours() < AFTERNOON_START_HOUR) },
    { title: 'Tarde', slots: slots.filter((slot) => slot.inicio.getHours() >= AFTERNOON_START_HOUR) },
  ]
  // #endregion

  // #region Renderizado
  return (
    <div className="space-y-3">
      {groups.map(
        (group) =>
          group.slots.length > 0 && (
            <div key={group.title}>
              <p className="mb-1.5 text-xs text-tinta/40">{group.title}</p>
              <div className="grid grid-cols-4 gap-1.5 min-[400px]:grid-cols-5 sm:grid-cols-6">
                {group.slots.map((slot) => {
                  const iso = slot.inicio.toISOString()
                  const selected = iso === value
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => onChange(iso)}
                      aria-pressed={selected}
                      className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition-all active:scale-95 ${
                        selected ? 'bg-acento text-tinta shadow-md shadow-acento/30' : 'bg-white ring-1 ring-hueso-200 hover:ring-acento'
                      }`}
                    >
                      {formatTime(slot.inicio)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
      )}
    </div>
  )
  // #endregion
}

export default TimePickerComponent

// #region Imports
import type { FunctionComponent } from 'react'
import { startOfDay, toInputDate } from '../../../../../utils/dates'
import type { IDateShortcutsProps } from './IDateShortcutsProps'
// #endregion

/** Atajo de fecha: texto del botón y fecha a la que lleva. */
interface IDateShortcut {
  /** Texto del botón. */
  text: string;
  /** Fecha en formato "AAAA-MM-DD". */
  value: string;
}

/** Atajos de fecha (Hoy, Mañana, Pasado) para no tener que abrir el calendario. */
const DateShortcutsComponent: FunctionComponent<IDateShortcutsProps> = ({ value, onChange }) => {
  // #region Declaraciones, variables y hooks
  const today = startOfDay(new Date())
  const shortcuts = ['Hoy', 'Mañana', 'Pasado'].map((text, i): IDateShortcut => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return { text, value: toInputDate(date) }
  })
  // #endregion

  // #region Renderizado
  return (
    <div className="flex flex-wrap gap-2">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.text}
          type="button"
          onClick={() => onChange(shortcut.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            value === shortcut.value ? 'bg-tinta text-hueso' : 'bg-white text-tinta/70 ring-1 ring-hueso-200 hover:ring-tinta/30'
          }`}
        >
          {shortcut.text}
        </button>
      ))}
      <input
        type="date"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label="Otra fecha"
        className="w-full rounded-full sm:w-auto sm:min-w-0 sm:flex-1 bg-white px-4 py-2 text-sm text-tinta ring-1 ring-hueso-200 outline-none focus:ring-acento"
      />
    </div>
  )
  // #endregion
}

export default DateShortcutsComponent

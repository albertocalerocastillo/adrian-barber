// #region Imports
import { startOfDay, toInputDate } from '../../../../../utils/dates'
// #endregion

/** Atajos de fecha (Hoy, Mañana, Pasado) para no tener que abrir el calendario. */
const DateShortcutsComponent = ({ valor, onCambio }) => {
  const hoy = startOfDay(new Date())
  const atajos = ['Hoy', 'Mañana', 'Pasado'].map((texto, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return { texto, valor: toInputDate(d) }
  })
  return (
    <div className="flex flex-wrap gap-2">
      {atajos.map((a) => (
        <button
          key={a.texto}
          type="button"
          onClick={() => onCambio(a.valor)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            valor === a.valor ? 'bg-tinta text-hueso' : 'bg-white text-tinta/70 ring-1 ring-hueso-200 hover:ring-tinta/30'
          }`}
        >
          {a.texto}
        </button>
      ))}
      <input
        type="date"
        value={valor}
        onChange={(e) => e.target.value && onCambio(e.target.value)}
        aria-label="Otra fecha"
        className="w-full rounded-full sm:w-auto sm:min-w-0 sm:flex-1 bg-white px-4 py-2 text-sm text-tinta ring-1 ring-hueso-200 outline-none focus:ring-acento"
      />
    </div>
  )
}

export default DateShortcutsComponent

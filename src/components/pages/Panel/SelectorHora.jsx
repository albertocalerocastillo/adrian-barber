import { Loader2, CalendarX } from 'lucide-react'
import { hora as fmtHora } from '../../../utils/fechas'

/**
 * Rejilla de horas libres, partida en mañana y tarde para encontrar la hora
 * antes. `rejilla` null = cargando. `valor` es el ISO de la hora elegida.
 */
export default function SelectorHora({ rejilla, valor, onCambio }) {
  if (rejilla === null) {
    return (
      <p className="flex items-center gap-2 py-3 text-sm text-tinta/50">
        <Loader2 size={16} className="animate-spin" /> Buscando huecos libres…
      </p>
    )
  }
  if (rejilla.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-tinta/5 px-4 py-4 text-sm text-tinta/60">
        <CalendarX size={18} /> No hay huecos libres ese día. Prueba otro.
      </p>
    )
  }

  // La tarde empieza tras la comida (14:00–14:30).
  const grupos = [
    ['Mañana', rejilla.filter((s) => s.inicio.getHours() < 14)],
    ['Tarde', rejilla.filter((s) => s.inicio.getHours() >= 14)],
  ]

  return (
    <div className="space-y-3">
      {grupos.map(
        ([titulo, horas]) =>
          horas.length > 0 && (
            <div key={titulo}>
              <p className="mb-1.5 text-xs text-tinta/40">{titulo}</p>
              <div className="grid grid-cols-4 gap-1.5 min-[400px]:grid-cols-5 sm:grid-cols-6">
                {horas.map((s) => {
                  const iso = s.inicio.toISOString()
                  const elegida = iso === valor
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => onCambio(iso)}
                      aria-pressed={elegida}
                      className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition-all active:scale-95 ${
                        elegida ? 'bg-acento text-tinta shadow-md shadow-acento/30' : 'bg-white ring-1 ring-hueso-200 hover:ring-acento'
                      }`}
                    >
                      {fmtHora(s.inicio)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
      )}
    </div>
  )
}

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { aHora, sumarMin } from '../../../utils/disponibilidad'
import { inicioDia } from '../../../utils/fechas'
import { crearBloqueo } from '../../../lib/panel'

function aInputDate(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Crea un bloqueo: un día entero o una franja horaria. Esos ratos desaparecen
 * de los huecos de la web automáticamente. Para vacaciones/descansos.
 */
export default function BloquearModal({ fechaInicial, onClose, onCreado }) {
  const [fechaStr, setFechaStr] = useState(aInputDate(fechaInicial || new Date()))
  const [todoElDia, setTodoElDia] = useState(true)
  const [desde, setDesde] = useState('10:00')
  const [hasta, setHasta] = useState('14:00')
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function onGuardar(e) {
    e.preventDefault()
    if (guardando) return
    const fecha = new Date(`${fechaStr}T00:00:00`)
    let ini, fin
    if (todoElDia) {
      ini = inicioDia(fecha)
      fin = sumarMin(ini, 24 * 60)
    } else {
      ini = aHora(fecha, desde)
      fin = aHora(fecha, hasta)
      if (fin <= ini) {
        setError('La hora de fin debe ser posterior a la de inicio.')
        return
      }
    }
    setGuardando(true)
    setError('')
    const res = await crearBloqueo({ inicio: ini, fin, motivo })
    setGuardando(false)
    if (res.ok) {
      onCreado()
      onClose()
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-hueso p-6 text-tinta sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Bloquear</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-tinta/50 hover:text-tinta">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onGuardar} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-tinta/70">Fecha</span>
            <input
              type="date"
              value={fechaStr}
              onChange={(e) => setFechaStr(e.target.value)}
              className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
            />
          </label>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={todoElDia}
              onChange={(e) => setTodoElDia(e.target.checked)}
              className="h-4 w-4 accent-acento"
            />
            <span className="text-sm font-medium text-tinta/80">Todo el día</span>
          </label>

          {!todoElDia && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-tinta/70">Desde</span>
                <input
                  type="time"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-tinta/70">Hasta</span>
                <input
                  type="time"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
                />
              </label>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-tinta/70">Motivo (opcional)</span>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
              placeholder="Vacaciones, descanso…"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={guardando}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-tinta py-3 font-semibold text-hueso transition-colors hover:bg-tinta-800 disabled:opacity-60"
          >
            {guardando && <Loader2 size={17} className="animate-spin" />}
            Bloquear
          </button>
        </form>
      </div>
    </div>
  )
}

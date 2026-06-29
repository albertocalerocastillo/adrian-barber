import { Clock, ChevronRight } from 'lucide-react'
import { SERVICIOS } from '../../../data/servicios'
import { ICONOS } from '../../../theme/icons'

/**
 * Paso 1: elegir servicio. Muestra los servicios activos con duración y precio.
 */
export default function PasoServicio({ servicio, onElegir }) {
  const activos = SERVICIOS.filter((s) => s.activo !== false)

  return (
    <div>
      <h2 className="mb-5 text-center font-display text-xl font-semibold">
        ¿Qué te quieres hacer?
      </h2>

      <div className="space-y-3">
        {activos.map((s) => {
          const Icono = ICONOS[s.icono] || ICONOS.Scissors
          const sel = servicio?.id === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onElegir(s)}
              className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tinta/5 ${
                sel ? 'border-acento' : 'border-hueso-200'
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tinta text-acento">
                <Icono size={22} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">{s.nombre}</p>
                <p className="flex items-center gap-1.5 text-xs text-tinta/50">
                  <Clock size={13} />
                  {s.duracion} min
                </p>
              </div>
              <span className="font-display text-xl font-bold">{s.precio} €</span>
              <ChevronRight
                size={20}
                className="text-tinta/30 transition-transform group-hover:translate-x-0.5 group-hover:text-acento"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

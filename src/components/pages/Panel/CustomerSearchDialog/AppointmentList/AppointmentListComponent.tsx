// #region Imports
import type { FunctionComponent } from 'react'
import { ChevronRight } from 'lucide-react'
import { formatTime as fmtHora, formatShortDate } from '../../../../../utils/dates'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import type { IAppointmentListProps } from './IAppointmentListProps'
// #endregion

/** Cómo se pinta la etiqueta de cada estado de la cita. */
interface EtiquetaEstado {
  /** Texto de la etiqueta. */
  texto: string;
  /** Clases de Tailwind de la etiqueta. */
  clase: string;
}

// #region Constantes
// Etiqueta de cada estado de la cita.
const ESTADOS: Record<EstadoCitaEnum, EtiquetaEstado> = {
  [EstadoCitaEnum.Pendiente]: { texto: 'Pendiente', clase: 'bg-acento/15 text-acento-oscuro' },
  [EstadoCitaEnum.Atendida]: { texto: 'Atendido', clase: 'bg-green-100 text-green-700' },
  [EstadoCitaEnum.Cancelada]: { texto: 'Cancelada', clase: 'bg-tinta/5 text-tinta/40 line-through' },
}

// Cifras del año que se quitan al ponerlo corto ("2025" → "25").
const CIFRAS_SIGLO = 2
// #endregion

/** Lista de citas de un cliente en la búsqueda; tocar una lleva a ese día. */
const AppointmentListComponent: FunctionComponent<IAppointmentListProps> = ({ titulo, citas, onIrA, destacar = false }) => {
  // #region Renderizado
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-tinta/40">{titulo}</p>
      <ul className="space-y-1.5">
        {citas.map((c) => {
          const ini = new Date(c.inicio)
          const { diaSemana, dia, mes } = formatShortDate(ini)
          const estado = ESTADOS[c.estado] ?? ESTADOS[EstadoCitaEnum.Pendiente]
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onIrA(ini)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                  destacar ? 'bg-acento/10 hover:bg-acento/20' : 'bg-hueso/60 hover:bg-hueso'
                }`}
              >
                <span className="w-12 shrink-0 text-center leading-none">
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-wider text-tinta/45">{diaSemana}</span>
                  <span className="font-display text-lg font-bold">{dia}</span>
                  <span className="block text-[0.6rem] text-tinta/45">
                    {mes}
                    {ini.getFullYear() !== new Date().getFullYear() && ` ${String(ini.getFullYear()).slice(CIFRAS_SIGLO)}`}
                  </span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-semibold tabular-nums">{fmtHora(ini)}</span>
                  <span className="block truncate text-tinta/55">{c.servicioNombre}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${estado.clase}`}>{estado.texto}</span>
                <ChevronRight size={16} className="shrink-0 text-tinta/25 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
  // #endregion
}

export default AppointmentListComponent

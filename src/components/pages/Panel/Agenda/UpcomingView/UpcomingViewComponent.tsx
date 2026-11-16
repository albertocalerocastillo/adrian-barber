// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { CalendarCheck, ChevronRight } from 'lucide-react'
import SkeletonComponent from '../../Controls/Skeleton/SkeletonComponent'
import { addMinutes, MINUTES_PER_DAY } from '../../../../../utils/availability'
import { formatTime as fmtHora, formatLongDate, startOfDay, isSameDay } from '../../../../../utils/dates'
import { AgendaService } from '../../../../../services/AgendaService'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { OrigenCitaEnum } from '../../../../../services/enums/OrigenCitaEnum'
import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import { capital } from '../agendaUtils'
import type { IUpcomingViewProps } from './IUpcomingViewProps'
// #endregion

/** Citas de un mismo día. */
interface DiaConCitas {
  /** Medianoche del día. */
  dia: Date;
  /** Sus citas, por hora. */
  citas: CitaDTO[];
}

// #region Constantes
// Días hacia delante que se miran (la web deja reservar a 60; se deja margen para las del panel).
const DIAS_PROXIMAS = 120

// Bloques del esqueleto mientras carga.
const FILAS_ESQUELETO = 3
// #endregion

/** Junta las citas por día, en orden. */
const agruparPorDia = (citas: CitaDTO[]): DiaConCitas[] => {
  const result: DiaConCitas[] = []
  for (const c of citas) {
    const dia = startOfDay(new Date(c.inicio))
    const grupo = result.find((g) => isSameDay(g.dia, dia))
    if (grupo) grupo.citas.push(c)
    else result.push({ dia, citas: [c] })
  }
  return result
}

/** "Hoy", "Mañana" o "Martes 15 de enero". */
const rotuloDia = (dia: Date, ahora: Date): string => {
  if (isSameDay(dia, ahora)) return 'Hoy'
  if (isSameDay(dia, addMinutes(startOfDay(ahora), MINUTES_PER_DAY))) return 'Mañana'
  return capital(formatLongDate(dia))
}

/**
 * Vista PRÓXIMAS: todas las citas que vienen, de hoy en adelante, agrupadas
 * por día. Es la forma rápida de ver "qué tengo reservado" sin ir semana a
 * semana (por ejemplo, una reserva de la web para dentro de dos meses).
 * Tocar una cita lleva a ese día.
 */
const UpcomingViewComponent: FunctionComponent<IUpcomingViewProps> = ({ ahora, recarga, onDia }) => {
  // #region Declaraciones, variables y hooks
  const [citas, setCitas] = useState<CitaDTO[] | null>(null)
  const [error, setError] = useState<boolean>(false)
  const hoy = startOfDay(ahora).getTime()

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const desde = new Date(hoy)
      const result = await AgendaService.listarCitas(desde, addMinutes(desde, DIAS_PROXIMAS * MINUTES_PER_DAY)).catch(() => null)
      if (!vivo) return
      setError(result === null)
      setCitas(result)
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [hoy, recarga])

  const dias = citas
    ? agruparPorDia(citas.filter((c) => c.estado === EstadoCitaEnum.Pendiente && new Date(c.fin) > ahora))
    : null
  // #endregion

  // #region Renderizado
  if (error) {
    return (
      <p role="alert" className="rounded-3xl bg-red-50 p-8 text-center text-sm text-red-800">
        No se pudieron cargar las próximas citas. Revisa la conexión.
      </p>
    )
  }
  if (!dias) return <SkeletonComponent rows={FILAS_ESQUELETO} height="h-24" />

  if (dias.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-hueso-200 py-14 text-center text-sm text-tinta/50">
        <CalendarCheck size={28} className="text-tinta/25" />
        No tienes citas pendientes en los próximos {DIAS_PROXIMAS} días.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {dias.map(({ dia, citas: delDia }) => (
        <section key={dia.getTime()}>
          <button
            type="button"
            onClick={() => onDia(dia)}
            className="mb-2 flex w-full items-baseline justify-between px-1 text-left"
          >
            <span className="font-display text-lg font-bold">{rotuloDia(dia, ahora)}</span>
            <span className="text-xs text-tinta/45">{delDia.length === 1 ? '1 cita' : `${delDia.length} citas`}</span>
          </button>
          <ul className="space-y-2">
            {delDia.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onDia(dia)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-hueso-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-acento/50"
                >
                  <span className="w-14 shrink-0 font-display text-lg font-bold tabular-nums">{fmtHora(new Date(c.inicio))}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{c.clienteNombre}</span>
                      {c.origen === OrigenCitaEnum.Web && (
                        <span title="Reservada desde la web" className="shrink-0 rounded-full bg-tinta px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-acento">
                          Web
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-sm text-tinta/55">{c.servicioNombre}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-tinta/25 transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
  // #endregion
}

export default UpcomingViewComponent

// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { CalendarX, RefreshCw, Sun, Sunset } from 'lucide-react'
import { formatTimeInZone } from '../../../../utils/dates'
import { RESERVA } from '../../../../data/features'
import { horasDelDia, rangoConsulta } from '../bookingRules'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { BookingService } from '../../../../services/BookingService'
import { EstadoHuecoEnum } from '../../../../services/enums/EstadoHuecoEnum'
import type { HuecoDTO } from '../../../../services/dtos/HuecoDTO'
import type { ITimeStepProps } from './ITimeStepProps'
// #endregion

// #region Constantes
// Hora (de la barbería) a partir de la cual las horas van en "Tarde".
const HORA_TARDE = 14
// Cifras de la hora en "HH:MM".
const CIFRAS_HORA = 2
// Huecos grises que se enseñan mientras se buscan las horas.
const HORAS_CARGANDO = 10
// Retraso entre huecos grises al cargar, en milisegundos.
const RETRASO_HUECO_CARGANDO_MS = 60
// Retraso entre la entrada de una hora y la siguiente, en segundos (con tope de horas).
const RETRASO_HORA = 0.015
const TOPE_HORAS_CON_RETRASO = 20
// #endregion

/** Horas de una parte del día (mañana o tarde). */
interface FranjaHoras {
  /** Nombre de la franja. */
  titulo: string;
  /** Icono de la franja. */
  Icono: LucideIcon;
  /** Horas de la franja. */
  huecos: HuecoDTO[];
}

/**
 * Paso 3: elegir hora. Vuelve a pedir lo ocupado de ese día (por si alguien
 * ha reservado mientras tanto) y monta la rejilla con la duración del
 * servicio. Las horas libres se pulsan; las ocupadas salen tachadas.
 * Las horas son SIEMPRE las de la barbería (hora de España).
 */
const TimeStepComponent: FunctionComponent<ITimeStepProps> = ({ servicio, fecha, horario, hora, aviso, onElegir }) => {
  // #region Declaraciones, variables y hooks
  const [rejilla, setRejilla] = useState<HuecoDTO[] | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [intento, setIntento] = useState<number>(0)
  // #endregion

  // #region Carga de las horas
  useEffect(() => {
    let vivo = true
    const { desde, hasta } = rangoConsulta(fecha, fecha)
    const cargar = async () => {
      // Si no se puede leer la agenda, se avisa y se ofrece reintentar.
      try {
        const ocupados = await BookingService.getCitas(desde, hasta)
        if (!vivo) return
        setError(false)
        setRejilla(horasDelDia({ fecha, servicio, horario, ocupados }))
      } catch {
        if (vivo) setError(true)
      }
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [servicio, fecha, horario, intento])
  // #endregion

  // #region Mañana y tarde
  // Hora en punto en la zona de la barbería (no la del navegador).
  const horaDe = (instante: Date): number => {
    const result = Number(formatTimeInZone(instante, RESERVA.zona).slice(0, CIFRAS_HORA))
    return result
  }
  const manana = rejilla?.filter((s) => horaDe(s.inicio) < HORA_TARDE) ?? []
  const tarde = rejilla?.filter((s) => horaDe(s.inicio) >= HORA_TARDE) ?? []
  const hayLibres = rejilla?.some((s) => s.estado === EstadoHuecoEnum.Libre)
  const franjas: FranjaHoras[] = [
    { titulo: 'Mañana', Icono: Sun, huecos: manana },
    { titulo: 'Tarde', Icono: Sunset, huecos: tarde },
  ]
  // #endregion

  // #region Renderizado
  return (
    <div>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold sm:text-3xl">¿A qué hora?</h2>

      {aviso && (
        <p role="alert" className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {aviso}
        </p>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-hueso-200 bg-white py-12 text-center">
          <p className="text-sm text-tinta/60">No se pudieron cargar las horas. Revisa la conexión.</p>
          <button
            type="button"
            onClick={() => setIntento((n) => n + 1)}
            className="flex items-center gap-2 rounded-full bg-tinta px-5 py-2.5 text-sm font-semibold text-hueso"
          >
            <RefreshCw size={15} /> Reintentar
          </button>
        </div>
      ) : rejilla === null ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5" aria-label="Buscando horas libres">
          {Array.from({ length: HORAS_CARGANDO }, (_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-tinta/[0.06]" style={{ animationDelay: `${i * RETRASO_HUECO_CARGANDO_MS}ms` }} />
          ))}
        </div>
      ) : !hayLibres ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-hueso-200 bg-white px-6 py-12 text-center">
          <CalendarX size={32} className="text-tinta/30" />
          <p className="font-display text-lg font-semibold">Ese día ya no queda hueco</p>
          <p className="max-w-xs text-sm text-tinta/50">Se acaba de llenar. Elige otro día, suele haber sitio.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {franjas.map(
            ({ titulo, Icono, huecos: slots }) =>
              slots.length > 0 && (
                <div key={titulo}>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-tinta/45">
                    <Icono size={15} className="text-acento-oscuro" />
                    {titulo}
                    <span className="font-normal normal-case tracking-normal text-tinta/35">
                      · {slots.filter((s) => s.estado === EstadoHuecoEnum.Libre).length} libres
                    </span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 min-[400px]:grid-cols-4 sm:grid-cols-5 sm:gap-2.5">
                    {slots.map((s, i) => {
                      const texto = formatTimeInZone(s.inicio, RESERVA.zona)
                      const elegida = hora !== null && hora.getTime() === s.inicio.getTime()
                      return s.estado === EstadoHuecoEnum.Libre ? (
                        <m.button
                          key={s.inicio.toISOString()}
                          type="button"
                          onClick={() => onElegir(s.inicio)}
                          aria-pressed={elegida}
                          className={`rounded-xl border py-3 text-center font-semibold tabular-nums transition-all active:scale-95 ${
                            elegida
                              ? 'border-tinta bg-tinta text-hueso shadow-lg'
                              : 'border-hueso-200 bg-white hover:-translate-y-0.5 hover:border-acento hover:bg-acento/10 hover:shadow-md'
                          }`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: Math.min(i, TOPE_HORAS_CON_RETRASO) * RETRASO_HORA, ease: EASE_SMOOTH }}
                        >
                          {texto}
                        </m.button>
                      ) : (
                        <span
                          key={s.inicio.toISOString()}
                          aria-hidden="true"
                          className="rounded-xl border border-transparent bg-tinta/[0.04] py-3 text-center font-medium tabular-nums text-tinta/25 line-through"
                        >
                          {texto}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
          )}
          <p className="text-center text-xs text-tinta/40">Horas de la barbería (hora peninsular).</p>
        </div>
      )}
    </div>
  )
  // #endregion
}

export default TimeStepComponent

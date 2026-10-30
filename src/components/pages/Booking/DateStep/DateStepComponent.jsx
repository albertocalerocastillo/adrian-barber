// #region Imports
import { useEffect, useMemo, useState } from 'react'
import { m } from 'motion/react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getCitas } from '../../../../services/BookingService'
import { isSameDay, startOfDay } from '../../../../utils/dates'
import { ventanaReserva, rangoConsulta, libresDelDia } from '../bookingRules'
import { EASE_SMOOTH } from '../../../../theme/animation'
// #endregion

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/**
 * Paso 2: elegir día en un calendario de mes.
 * Cada día dice de un vistazo si se puede: con hueco (pulsable, con puntito),
 * completo, cerrado o fuera de la ventana de reserva. Así el cliente no entra
 * en un día para descubrir que no hay nada.
 */
const DateStepComponent = ({ servicio, fecha, horario, onElegir }) => {
  // #region Declaraciones, variables y hooks
  const { primero, ultimo } = useMemo(() => ventanaReserva(), [])
  const [mes, setMes] = useState(() => {
    const base = fecha ?? primero
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [ocupados, setOcupados] = useState(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  // Días que pinta la rejilla (semanas completas, empezando en lunes).
  const dias = useMemo(() => {
    const inicio = new Date(mes)
    inicio.setDate(1 - ((mes.getDay() + 6) % 7))
    const fin = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
    fin.setDate(fin.getDate() + (6 - ((fin.getDay() + 6) % 7)))
    const result = []
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) result.push(new Date(d))
    return result
  }, [mes])

  const mesMs = mes.getTime()
  useEffect(() => {
    let vivo = true
    const { desde, hasta } = rangoConsulta(dias[0], dias[dias.length - 1])
    const cargar = async () => {
      // Si no se puede leer la agenda, se avisa y se ofrece reintentar.
      try {
        const o = await getCitas(desde, hasta)
        if (!vivo) return
        setError(false)
        setOcupados(o)
      } catch {
        if (vivo) setError(true)
      }
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [mesMs, dias, intento])

  const cambiarMes = (n) => {
    setOcupados(null)
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))
  }

  const hayAnterior = new Date(mes.getFullYear(), mes.getMonth(), 0) >= primero
  const haySiguiente = new Date(mes.getFullYear(), mes.getMonth() + 1, 1) <= ultimo
  const ahora = new Date()
  // #endregion

  // #region Renderizado
  return (
    <div>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold sm:text-3xl">¿Qué día te viene bien?</h2>

      <div className="rounded-3xl border border-hueso-200 bg-white p-3 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => cambiarMes(-1)}
            disabled={!hayAnterior}
            aria-label="Mes anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full text-tinta/60 transition-colors hover:bg-tinta/5 disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="font-display text-xl font-bold">
            {MESES[mes.getMonth()]} <span className="text-tinta/40">{mes.getFullYear()}</span>
          </p>
          <button
            type="button"
            onClick={() => cambiarMes(1)}
            disabled={!haySiguiente}
            aria-label="Mes siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full text-tinta/60 transition-colors hover:bg-tinta/5 disabled:opacity-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-[0.7rem] font-semibold text-tinta/35">
          {SEMANA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-tinta/60">No se pudo cargar la agenda. Revisa la conexión.</p>
            <button
              type="button"
              onClick={() => setIntento((n) => n + 1)}
              className="flex items-center gap-2 rounded-full bg-tinta px-5 py-2.5 text-sm font-semibold text-hueso"
            >
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        ) : (
          <m.div
            key={mesMs}
            className="grid grid-cols-7 gap-1 sm:gap-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE_SMOOTH }}
          >
            {dias.map((d) => {
              const delMes = d.getMonth() === mes.getMonth()
              const enVentana = d >= primero && d <= ultimo
              const abierto = !!horario.find((h) => h.dia === d.getDay())?.tramos?.length
              const libres =
                ocupados && enVentana && abierto ? libresDelDia({ fecha: d, servicio, horario, ocupados, ahora }) : 0
              const elegible = enVentana && abierto && libres > 0
              const sel = fecha && isSameDay(fecha, d)
              const hoy = isSameDay(d, ahora)

              let nota = ''
              if (enVentana && delMes) nota = !abierto ? 'Cerrado' : ocupados === null ? '' : libres === 0 ? 'Completo' : ''

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={!elegible}
                  onClick={() => onElegir(startOfDay(d))}
                  aria-pressed={!!sel}
                  aria-label={`${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}${elegible ? `, ${libres} horas libres` : nota ? `, ${nota.toLowerCase()}` : ', no disponible'}`}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all sm:aspect-auto sm:h-16 sm:rounded-2xl ${
                    !delMes ? 'invisible' : ''
                  } ${
                    sel
                      ? 'bg-tinta font-bold text-hueso shadow-lg shadow-tinta/25'
                      : elegible
                        ? 'font-semibold text-tinta hover:bg-acento/15 active:scale-95'
                        : 'cursor-default text-tinta/20'
                  } ${hoy && !sel ? 'ring-1 ring-tinta/20' : ''}`}
                >
                  <span className="font-display text-base sm:text-lg">{d.getDate()}</span>
                  {elegible && !sel && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-acento sm:bottom-2" />}
                  {nota && <span className="hidden text-[0.6rem] font-normal sm:block">{nota}</span>}
                  {ocupados === null && enVentana && abierto && delMes && (
                    <span className="absolute inset-1 animate-pulse rounded-lg bg-tinta/[0.04]" />
                  )}
                </button>
              )
            })}
          </m.div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-hueso-200 pt-4 text-xs text-tinta/45">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-acento" /> Con hueco
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-tinta/20">12</span> Completo o cerrado
          </span>
        </div>
      </div>
    </div>
  )
  // #endregion
}

export default DateStepComponent

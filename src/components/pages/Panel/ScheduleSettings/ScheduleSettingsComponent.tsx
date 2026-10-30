// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Plus, X, Copy, Info } from 'lucide-react'
import { useToast } from '../Toast/ToastContext'
import { ToastTypeEnum } from '../../../../services/enums/ToastTypeEnum'
import SectionHeaderComponent from '../Controls/SectionHeader/SectionHeaderComponent'
import SwitchComponent from '../Controls/Switch/SwitchComponent'
import SaveBarComponent from '../Controls/SaveBar/SaveBarComponent'
import SkeletonComponent from '../Controls/Skeleton/SkeletonComponent'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ConfigurationService } from '../../../../services/ConfigurationService'
import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
import type { IScheduleSettingsProps } from './IScheduleSettingsProps'
// #endregion

// #region Constantes
// Tramo con el que se abre un día cerrado.
const TRAMO_INICIAL: [string, string] = ['10:00', '14:00']

// Si el día no tiene tramos, el nuevo se calcula como si el último acabara a esta hora (por la tarde).
const FIN_POR_DEFECTO = '16:00'

// El tramo nuevo empieza una hora después del último y dura tres.
const HORAS_HASTA_NUEVO_TRAMO = 1
const HORAS_HASTA_FIN_NUEVO_TRAMO = 4

// Horas máximas de inicio y fin de un tramo nuevo.
const HORA_MAXIMA_INICIO = 22
const HORA_MAXIMA_FIN = 23

// Separador de horas y minutos, y minutos en punto.
const SEPARADOR_HORA = ':'
const MINUTOS_EN_PUNTO = '00'

// Cifras de la hora ("09").
const CIFRAS_HORA = 2

// Posición del inicio y del fin dentro de un tramo.
const POSICION_INICIO = 0
const POSICION_FIN = 1
// #endregion

/** Copia profunda del horario (los tramos son arrays: no se comparten con el estado). */
const copia = (dias: HorarioDiaDTO[]): HorarioDiaDTO[] => {
  const result = dias.map((d) => ({ ...d, tramos: d.tramos.map((t): [string, string] => [t[0], t[1]]) }))
  return result
}

/** Hora en punto ("09:00"). */
const enPunto = (hora: number): string => {
  const result = `${String(hora).padStart(CIFRAS_HORA, '0')}${SEPARADOR_HORA}${MINUTOS_EN_PUNTO}`
  return result
}

/**
 * HORARIO de trabajo de cada semana (días y tramos). Los días o ratos sueltos
 * (vacaciones, médico) van con "Día libre" en la agenda. Al guardar, la web
 * recalcula los huecos y el "Abierto ahora" con este horario.
 */
const ScheduleSettingsComponent: FunctionComponent<IScheduleSettingsProps> = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useToast()
  const [dias, setDias] = useState<HorarioDiaDTO[] | null>(null)
  const [original, setOriginal] = useState<HorarioDiaDTO[] | null>(null)
  const [guardando, setGuardando] = useState<boolean>(false)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const h = await ConfigurationService.getHorario()
      if (!vivo) return
      setDias(copia(h))
      setOriginal(copia(h))
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  const cambiado = dias && original && JSON.stringify(dias) !== JSON.stringify(original)
  const tramoMalo = dias?.some((d) => d.tramos.some(([a, b]) => !a || !b || b <= a))

  const setTramos = (dia: number, tramos: [string, string][]) =>
    setDias((ds) => ds && ds.map((d) => (d.dia === dia ? { ...d, tramos } : d)))
  const toggleDia = (dia: number, abierto: boolean) => setTramos(dia, abierto ? [[...TRAMO_INICIAL]] : [])
  const addTramo = (dia: number, actuales: [string, string][]) => {
    // El nuevo tramo empieza donde acabó el último (o por la tarde).
    const ultimo = actuales[actuales.length - 1]?.[1] ?? FIN_POR_DEFECTO
    const [h] = ultimo.split(SEPARADOR_HORA).map(Number)
    const ini = enPunto(Math.min(h + HORAS_HASTA_NUEVO_TRAMO, HORA_MAXIMA_INICIO))
    const fin = enPunto(Math.min(h + HORAS_HASTA_FIN_NUEVO_TRAMO, HORA_MAXIMA_FIN))
    setTramos(dia, [...actuales, [ini, fin]])
  }
  const editTramo = (dia: number, i: number, pos: number, val: string) =>
    setDias((ds) =>
      ds &&
      ds.map((d) =>
        d.dia !== dia
          ? d
          : { ...d, tramos: d.tramos.map((t, j): [string, string] => (j === i ? (pos === POSICION_INICIO ? [val, t[1]] : [t[0], val]) : t)) }
      )
    )
  const removeTramo = (dia: number, i: number) =>
    setDias((ds) => ds && ds.map((d) => (d.dia === dia ? { ...d, tramos: d.tramos.filter((_, j) => j !== i) } : d)))

  // Copia el horario de un día a todos los que están abiertos.
  const copiarATodos = (origen: HorarioDiaDTO) => {
    setDias(
      (ds) =>
        ds &&
        ds.map((d) => (d.tramos.length && d.dia !== origen.dia ? { ...d, tramos: origen.tramos.map((t): [string, string] => [t[0], t[1]]) } : d))
    )
    avisar({ text: `Horario del ${origen.nombre.toLowerCase()} copiado a los días abiertos. Falta guardar.` })
  }

  const onGuardar = async () => {
    if (guardando || !dias) return
    if (tramoMalo) {
      avisar({ text: 'Hay un tramo que acaba antes de empezar. Revísalo.', type: ToastTypeEnum.Error })
      return
    }
    setGuardando(true)
    const res = await ConfigurationService.guardarHorario(dias)
    setGuardando(false)
    if (res.ok) {
      setOriginal(copia(dias))
      avisar({ text: 'Horario guardado. La web ya lo muestra.' })
    } else {
      avisar({ text: res.error || 'No se pudo guardar.', type: ToastTypeEnum.Error })
    }
  }
  // #endregion

  // #region Renderizado
  return (
    <>
      <SectionHeaderComponent
        kicker="Ajustes"
        title="Horario"
        help="Los días y horas que trabajas cada semana. La web los usa para el «Abierto ahora» y para los huecos libres."
      />

      <p className="mb-6 flex gap-3 rounded-2xl bg-acento/10 px-4 py-3.5 text-sm leading-relaxed text-tinta/75">
        <Info size={18} className="mt-0.5 shrink-0 text-acento-oscuro" />
        <span>
          ¿Vacaciones o un día suelto? No toques esto: usa <strong>Día libre</strong> en la agenda.
        </span>
      </p>

      {dias === null ? (
        <SkeletonComponent rows={7} height="h-20" />
      ) : (
        <ul className="space-y-3 pb-24 md:pb-20">
          {dias.map((d, i) => {
            const abierto = d.tramos.length > 0
            return (
              <m.li
                key={d.dia}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors sm:p-5 ${abierto ? 'border-hueso-200' : 'border-transparent bg-white/60'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE_SMOOTH }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex items-center justify-between sm:w-44 sm:shrink-0 sm:pt-2">
                    <div>
                      <p className={`font-display text-lg font-semibold ${abierto ? '' : 'text-tinta/40'}`}>{d.nombre}</p>
                      <p className={`text-xs ${abierto ? 'text-green-700' : 'text-tinta/35'}`}>{abierto ? 'Abierto' : 'Cerrado'}</p>
                    </div>
                    <SwitchComponent active={abierto} onChange={(v) => toggleDia(d.dia, v)} label={`${d.nombre} abierto`} />
                  </div>

                  <AnimatePresence initial={false}>
                    {abierto && (
                      <m.div
                        className="min-w-0 flex-1 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                      >
                        {d.tramos.map((t, j) => {
                          const malo = !t[0] || !t[1] || t[1] <= t[0]
                          return (
                            <div key={j} className="flex items-center gap-2">
                              <input
                                type="time"
                                value={t[0]}
                                onChange={(e) => editTramo(d.dia, j, POSICION_INICIO, e.target.value)}
                                aria-label={`${d.nombre}, desde`}
                                className={`min-w-0 flex-1 rounded-xl border bg-hueso/50 px-3 py-2.5 text-center font-semibold tabular-nums outline-none focus:border-acento sm:flex-none ${malo ? 'border-red-300' : 'border-hueso-200'}`}
                              />
                              <span className="text-tinta/30">a</span>
                              <input
                                type="time"
                                value={t[1]}
                                onChange={(e) => editTramo(d.dia, j, POSICION_FIN, e.target.value)}
                                aria-label={`${d.nombre}, hasta`}
                                className={`min-w-0 flex-1 rounded-xl border bg-hueso/50 px-3 py-2.5 text-center font-semibold tabular-nums outline-none focus:border-acento sm:flex-none ${malo ? 'border-red-300' : 'border-hueso-200'}`}
                              />
                              <button
                                type="button"
                                onClick={() => (d.tramos.length === 1 ? toggleDia(d.dia, false) : removeTramo(d.dia, j))}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tinta/35 transition-colors hover:bg-red-50 hover:text-red-600"
                                aria-label="Quitar este tramo"
                              >
                                <X size={17} />
                              </button>
                            </div>
                          )
                        })}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <button
                            type="button"
                            onClick={() => addTramo(d.dia, d.tramos)}
                            className="flex items-center gap-1.5 py-1 text-sm font-medium text-acento-oscuro hover:underline"
                          >
                            <Plus size={15} /> Partir jornada
                          </button>
                          <button
                            type="button"
                            onClick={() => copiarATodos(d)}
                            className="flex items-center gap-1.5 py-1 text-sm text-tinta/45 hover:text-tinta"
                          >
                            <Copy size={14} /> Copiar a los demás días
                          </button>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </m.li>
            )
          })}
        </ul>
      )}

      <SaveBarComponent
        visible={activa && !!cambiado}
        saving={guardando}
        onSave={onGuardar}
        onDiscard={() => setDias(original && copia(original))}
        text="Has cambiado el horario"
      />
    </>
  )
  // #endregion
}

export default ScheduleSettingsComponent

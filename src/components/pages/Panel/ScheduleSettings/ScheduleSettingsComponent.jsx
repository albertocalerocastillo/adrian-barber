// #region Imports
import { useState, useEffect } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Plus, X, Copy, Info } from 'lucide-react'
import { useToast } from '../Toast/ToastContext'
import { SectionHeaderComponent, SwitchComponent, SaveBarComponent, SkeletonComponent } from '../Controls/ControlsComponent'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ConfigurationService } from '../../../../services/ConfigurationService'
// #endregion

const copia = (dias) => dias.map((d) => ({ ...d, tramos: d.tramos.map((t) => [...t]) }))

/**
 * HORARIO de trabajo de cada semana (días y tramos). Los días o ratos sueltos
 * (vacaciones, médico) van con "Día libre" en la agenda. Al guardar, la web
 * recalcula los huecos y el "Abierto ahora" con este horario.
 */
const ScheduleSettingsComponent = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useToast()
  const [dias, setDias] = useState(null)
  const [original, setOriginal] = useState(null)
  const [guardando, setGuardando] = useState(false)

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

  const setTramos = (dia, tramos) => setDias((ds) => ds.map((d) => (d.dia === dia ? { ...d, tramos } : d)))
  const toggleDia = (dia, abierto) => setTramos(dia, abierto ? [['10:00', '14:00']] : [])
  const addTramo = (dia, actuales) => {
    // El nuevo tramo empieza donde acabó el último (o por la tarde).
    const ultimo = actuales[actuales.length - 1]?.[1] ?? '16:00'
    const [h] = ultimo.split(':').map(Number)
    const ini = `${String(Math.min(h + 1, 22)).padStart(2, '0')}:00`
    const fin = `${String(Math.min(h + 4, 23)).padStart(2, '0')}:00`
    setTramos(dia, [...actuales, [ini, fin]])
  }
  const editTramo = (dia, i, pos, val) =>
    setDias((ds) =>
      ds.map((d) =>
        d.dia !== dia ? d : { ...d, tramos: d.tramos.map((t, j) => (j === i ? (pos === 0 ? [val, t[1]] : [t[0], val]) : t)) }
      )
    )
  const removeTramo = (dia, i) =>
    setDias((ds) => ds.map((d) => (d.dia === dia ? { ...d, tramos: d.tramos.filter((_, j) => j !== i) } : d)))

  // Copia el horario de un día a todos los que están abiertos.
  const copiarATodos = (origen) => {
    setDias((ds) => ds.map((d) => (d.tramos.length && d.dia !== origen.dia ? { ...d, tramos: origen.tramos.map((t) => [...t]) } : d)))
    avisar({ texto: `Horario del ${origen.nombre.toLowerCase()} copiado a los días abiertos. Falta guardar.` })
  }

  const onGuardar = async () => {
    if (guardando || !dias) return
    if (tramoMalo) {
      avisar({ texto: 'Hay un tramo que acaba antes de empezar. Revísalo.', tipo: 'error' })
      return
    }
    setGuardando(true)
    const res = await ConfigurationService.guardarHorario(dias)
    setGuardando(false)
    if (res.ok) {
      setOriginal(copia(dias))
      avisar({ texto: 'Horario guardado. La web ya lo muestra.' })
    } else {
      avisar({ texto: res.error || 'No se pudo guardar.', tipo: 'error' })
    }
  }
  // #endregion

  // #region Renderizado
  return (
    <>
      <SectionHeaderComponent
        kicker="Ajustes"
        titulo="Horario"
        ayuda="Los días y horas que trabajas cada semana. La web los usa para el «Abierto ahora» y para los huecos libres."
      />

      <p className="mb-6 flex gap-3 rounded-2xl bg-acento/10 px-4 py-3.5 text-sm leading-relaxed text-tinta/75">
        <Info size={18} className="mt-0.5 shrink-0 text-acento-oscuro" />
        <span>
          ¿Vacaciones o un día suelto? No toques esto: usa <strong>Día libre</strong> en la agenda.
        </span>
      </p>

      {dias === null ? (
        <SkeletonComponent filas={7} alto="h-20" />
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
                    <SwitchComponent activo={abierto} onCambio={(v) => toggleDia(d.dia, v)} etiqueta={`${d.nombre} abierto`} />
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
                                onChange={(e) => editTramo(d.dia, j, 0, e.target.value)}
                                aria-label={`${d.nombre}, desde`}
                                className={`min-w-0 flex-1 rounded-xl border bg-hueso/50 px-3 py-2.5 text-center font-semibold tabular-nums outline-none focus:border-acento sm:flex-none ${malo ? 'border-red-300' : 'border-hueso-200'}`}
                              />
                              <span className="text-tinta/30">a</span>
                              <input
                                type="time"
                                value={t[1]}
                                onChange={(e) => editTramo(d.dia, j, 1, e.target.value)}
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
        guardando={guardando}
        onGuardar={onGuardar}
        onDescartar={() => setDias(copia(original))}
        texto="Has cambiado el horario"
      />
    </>
  )
  // #endregion
}

export default ScheduleSettingsComponent

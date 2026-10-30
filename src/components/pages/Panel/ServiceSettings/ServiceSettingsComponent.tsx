// #region Imports
import { useState, useEffect, useRef } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Plus, Trash2, EyeOff, Sparkles, MessageCircle } from 'lucide-react'
import { useToast } from '../Toast/ToastContext'
import { ToastTypeEnum } from '../../../../services/enums/ToastTypeEnum'
import SectionHeaderComponent from '../Controls/SectionHeader/SectionHeaderComponent'
import SwitchComponent from '../Controls/Switch/SwitchComponent'
import StepperComponent from '../Controls/Stepper/StepperComponent'
import SaveBarComponent from '../Controls/SaveBar/SaveBarComponent'
import SkeletonComponent from '../Controls/Skeleton/SkeletonComponent'
import { ICONS } from '../../../../theme/icons'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ConfigurationService } from '../../../../services/ConfigurationService'
import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'
import type { IServiceSettingsProps } from './IServiceSettingsProps'
// #endregion

/** Servicio tal como se edita en la pantalla: con una clave local estable para el render. */
interface ServicioEditable extends ServicioDTO {
  /** Clave local de la tarjeta (los ids de Supabase se regeneran al guardar). */
  _key: number;
}

// #region Constantes
// Nombre de la clave local, que no cuenta al comparar si hay cambios.
const CLAVE_LOCAL = '_key'

// Icono que se usa si el servicio no tiene uno conocido.
const ICONO_POR_DEFECTO = 'Scissors'

// Servicio que se añade con "Añadir servicio". Va con el id vacío: guardarServicios
// no lo usa (borra y vuelve a escribir todas las filas).
const SERVICIO_NUEVO: ServicioDTO = {
  id: '',
  nombre: '',
  descripcion: '',
  duracion: 30,
  precio: 10,
  icono: ICONO_POR_DEFECTO,
  destacado: false,
  activo: true,
  online: true,
}

// Pasos de los contadores de precio (euros) y duración (minutos), y duración mínima.
const PASO_PRECIO = 1
const PASO_DURACION = 5
const DURACION_MINIMA = 5
// #endregion

/** Para comparar si hay cambios, sin la clave interna de cada tarjeta. */
const huella = (lista: ServicioDTO[]): string => {
  const result = JSON.stringify(lista, (clave: string, valor: unknown) => (clave === CLAVE_LOCAL ? undefined : valor))
  return result
}

/**
 * SERVICIOS y PRECIOS (nombre, descripción, duración, precio y si se ve en la
 * web). Se editan en local y se guardan de golpe con la barra de abajo, igual
 * que el horario. El icono y el "destacado" se fijan en el código/seed.
 */
const ServiceSettingsComponent: FunctionComponent<IServiceSettingsProps> = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useToast()
  const [servicios, setServicios] = useState<ServicioEditable[] | null>(null)
  const [original, setOriginal] = useState<string>('')
  const [guardando, setGuardando] = useState<boolean>(false)
  const nextKey = useRef<number>(0)

  // Cada servicio lleva una `_key` estable en local para el render (los ids de
  // Supabase se regeneran al guardar, y los nuevos aún no tienen id).
  const conKey = (s: ServicioDTO): ServicioEditable => {
    const result = { ...s, _key: nextKey.current }
    nextKey.current += 1
    return result
  }

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const lista = await ConfigurationService.getServicios()
      if (!vivo) return
      setServicios(lista.map(conKey))
      setOriginal(huella(lista))
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  const cambiado = servicios && huella(servicios) !== original

  const editar = <K extends keyof ServicioDTO>(key: number, campo: K, valor: ServicioDTO[K]) =>
    setServicios((ss) => ss && ss.map((s) => (s._key === key ? { ...s, [campo]: valor } : s)))

  const borrar = (s: ServicioEditable) => {
    const posicion = servicios ? servicios.indexOf(s) : -1
    setServicios((ss) => ss && ss.filter((x) => x._key !== s._key))
    avisar({
      text: `«${s.nombre || 'Servicio'}» quitado. Falta guardar.`,
      onUndo: () =>
        setServicios((ss) => {
          if (!ss) return ss
          const result = [...ss]
          result.splice(posicion, 0, s)
          return result
        }),
    })
  }

  const anadir = () => setServicios((ss) => ss && [...ss, conKey(SERVICIO_NUEVO)])

  const onGuardar = async () => {
    if (guardando || !servicios) return
    if (servicios.some((s) => !s.nombre.trim())) {
      avisar({ text: 'Hay un servicio sin nombre. Pónselo o quítalo.', type: ToastTypeEnum.Error })
      return
    }
    setGuardando(true)
    const res = await ConfigurationService.guardarServicios(servicios)
    setGuardando(false)
    if (res.ok) {
      setOriginal(huella(servicios))
      avisar({ text: 'Servicios guardados. La web ya muestra los precios nuevos.' })
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
        title="Servicios y precios"
        help="Lo que ve el cliente en la web. Apaga uno para ocultarlo sin borrarlo. La duración sirve para calcular los huecos libres."
      >
        <button
          type="button"
          onClick={anadir}
          className="hidden items-center gap-2 rounded-full border border-tinta/15 bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-tinta hover:bg-tinta hover:text-hueso md:flex"
        >
          <Plus size={17} /> Añadir servicio
        </button>
      </SectionHeaderComponent>

      {servicios === null ? (
        <SkeletonComponent rows={3} height="h-48" />
      ) : (
        <div className="grid gap-4 pb-24 md:pb-20 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {servicios.map((s) => {
              const Icono = ICONS[s.icono] || ICONS[ICONO_POR_DEFECTO]
              const visible = s.activo !== false
              return (
                <m.article
                  key={s._key}
                  className={`relative flex flex-col rounded-3xl border bg-white p-5 shadow-sm transition-colors sm:p-6 ${
                    visible ? 'border-hueso-200' : 'border-dashed border-tinta/20 bg-white/50'
                  }`}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                        visible ? 'bg-tinta text-acento' : 'bg-tinta/5 text-tinta/30'
                      }`}
                    >
                      <Icono size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={s.nombre}
                        onChange={(e) => editar(s._key, 'nombre', e.target.value)}
                        placeholder="Nombre del servicio"
                        aria-label="Nombre del servicio"
                        className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -ml-2 font-display text-xl font-bold outline-none transition-colors placeholder:text-tinta/25 hover:border-hueso-200 focus:border-acento focus:bg-white"
                      />
                      <p className="flex items-center gap-1.5 text-xs text-tinta/45">
                        {s.destacado && (
                          <span className="flex items-center gap-1 text-acento-oscuro">
                            <Sparkles size={12} /> Destacado ·
                          </span>
                        )}
                        {visible ? 'Se ve en la web' : (
                          <span className="flex items-center gap-1">
                            <EyeOff size={12} /> Oculto en la web
                          </span>
                        )}
                      </p>
                    </div>
                    <SwitchComponent active={visible} onChange={(v) => editar(s._key, 'activo', v)} label={`Mostrar ${s.nombre} en la web`} />
                  </div>

                  <textarea
                    value={s.descripcion || ''}
                    onChange={(e) => editar(s._key, 'descripcion', e.target.value)}
                    placeholder="Descripción corta (sale en la web)"
                    aria-label="Descripción"
                    rows={2}
                    className="mt-4 w-full resize-none rounded-xl border border-hueso-200 bg-hueso/40 px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-acento focus:bg-white"
                  />

                  <div className="mt-4 grid gap-3 min-[400px]:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-tinta/45">Precio</p>
                      <StepperComponent
                        value={Number(s.precio) || 0}
                        onChange={(v) => editar(s._key, 'precio', v)}
                        step={PASO_PRECIO}
                        suffix="€"
                        label="precio"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-tinta/45">Duración</p>
                      <StepperComponent
                        value={Number(s.duracion) || 0}
                        onChange={(v) => editar(s._key, 'duracion', v)}
                        step={PASO_DURACION}
                        min={DURACION_MINIMA}
                        suffix="min"
                        label="duración"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-hueso/60 px-4 py-3">
                    <MessageCircle size={18} className="shrink-0 text-tinta/40" />
                    <p className="min-w-0 flex-1 text-sm leading-snug">
                      <span className="font-semibold">{s.online !== false ? 'Se reserva online' : 'Solo por WhatsApp'}</span>
                      <span className="block text-xs text-tinta/45">
                        {s.online !== false
                          ? 'El cliente lo elige y coge hora en la web.'
                          : 'Sale en la web, pero para pedirlo te escriben.'}
                      </span>
                    </p>
                    <SwitchComponent
                      active={s.online !== false}
                      onChange={(v) => editar(s._key, 'online', v)}
                      label={`Reservar ${s.nombre} online`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => borrar(s)}
                    className="mt-4 flex items-center gap-1.5 self-end rounded-full px-3 py-2 text-xs font-medium text-tinta/40 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} /> Quitar servicio
                  </button>
                </m.article>
              )
            })}
          </AnimatePresence>

          <button
            type="button"
            onClick={anadir}
            className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-tinta/15 p-6 text-tinta/45 transition-all hover:border-acento hover:bg-acento/5 hover:text-acento-oscuro"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tinta/5">
              <Plus size={22} />
            </span>
            <span className="text-sm font-semibold">Añadir servicio</span>
          </button>
        </div>
      )}

      <SaveBarComponent
        visible={activa && !!cambiado}
        saving={guardando}
        onSave={onGuardar}
        onDiscard={() => {
          setServicios((JSON.parse(original) as ServicioDTO[]).map(conKey))
        }}
        text="Has cambiado los servicios"
      />
    </>
  )
  // #endregion
}

export default ServiceSettingsComponent

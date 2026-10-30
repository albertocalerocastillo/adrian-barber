// #region Imports
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Plus, Trash2, EyeOff, Sparkles, MessageCircle } from 'lucide-react'
import { useAviso } from './avisoContexto'
import { CabeceraSeccion, Interruptor, Contador, BarraGuardar, Esqueleto } from './Controles'
import { getServicios, guardarServicios } from '../../../lib/config'
import { ICONOS } from '../../../theme/icons'
import { EASE_SUAVE } from '../../../theme/animacion'
// #endregion

// Para comparar si hay cambios, sin la clave interna de cada tarjeta.
const huella = (lista) =>
  JSON.stringify(
    lista.map((s) => {
      const result = { ...s }
      delete result._key
      return result
    })
  )

/**
 * SERVICIOS y PRECIOS (nombre, descripción, duración, precio y si se ve en la
 * web). Se editan en local y se guardan de golpe con la barra de abajo, igual
 * que el horario. El icono y el "destacado" se fijan en el código/seed.
 */
const AjustesServicios = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useAviso()
  const [servicios, setServicios] = useState(null)
  const [original, setOriginal] = useState('')
  const [guardando, setGuardando] = useState(false)
  const nextKey = useRef(0)

  // Cada servicio lleva una `_key` estable en local para el render (los ids de
  // Supabase se regeneran al guardar, y los nuevos aún no tienen id).
  const conKey = (s) => ({ ...s, _key: nextKey.current++ })

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const lista = await getServicios()
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

  const editar = (key, campo, valor) =>
    setServicios((ss) => ss.map((s) => (s._key === key ? { ...s, [campo]: valor } : s)))

  const borrar = (s) => {
    const posicion = servicios.indexOf(s)
    setServicios((ss) => ss.filter((x) => x._key !== s._key))
    avisar({
      texto: `«${s.nombre || 'Servicio'}» quitado. Falta guardar.`,
      deshacer: () =>
        setServicios((ss) => {
          const result = [...ss]
          result.splice(posicion, 0, s)
          return result
        }),
    })
  }

  const anadir = () =>
    setServicios((ss) => [
      ...ss,
      conKey({ nombre: '', descripcion: '', duracion: 30, precio: 10, icono: 'Scissors', destacado: false, activo: true, online: true }),
    ])

  const onGuardar = async () => {
    if (guardando || !servicios) return
    if (servicios.some((s) => !s.nombre.trim())) {
      avisar({ texto: 'Hay un servicio sin nombre. Pónselo o quítalo.', tipo: 'error' })
      return
    }
    setGuardando(true)
    const res = await guardarServicios(servicios)
    setGuardando(false)
    if (res.ok) {
      setOriginal(huella(servicios))
      avisar({ texto: 'Servicios guardados. La web ya muestra los precios nuevos.' })
    } else {
      avisar({ texto: res.error || 'No se pudo guardar.', tipo: 'error' })
    }
  }
  // #endregion

  // #region Renderizado
  return (
    <>
      <CabeceraSeccion
        kicker="Ajustes"
        titulo="Servicios y precios"
        ayuda="Lo que ve el cliente en la web. Apaga uno para ocultarlo sin borrarlo. La duración sirve para calcular los huecos libres."
      >
        <button
          type="button"
          onClick={anadir}
          className="hidden items-center gap-2 rounded-full border border-tinta/15 bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-tinta hover:bg-tinta hover:text-hueso md:flex"
        >
          <Plus size={17} /> Añadir servicio
        </button>
      </CabeceraSeccion>

      {servicios === null ? (
        <Esqueleto filas={3} alto="h-48" />
      ) : (
        <div className="grid gap-4 pb-24 md:pb-20 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {servicios.map((s) => {
              const Icono = ICONOS[s.icono] || ICONOS.Scissors
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
                  transition={{ duration: 0.35, ease: EASE_SUAVE }}
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
                    <Interruptor activo={visible} onCambio={(v) => editar(s._key, 'activo', v)} etiqueta={`Mostrar ${s.nombre} en la web`} />
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
                      <Contador
                        valor={Number(s.precio) || 0}
                        onCambio={(v) => editar(s._key, 'precio', v)}
                        paso={1}
                        sufijo="€"
                        etiqueta="precio"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-tinta/45">Duración</p>
                      <Contador
                        valor={Number(s.duracion) || 0}
                        onCambio={(v) => editar(s._key, 'duracion', v)}
                        paso={5}
                        min={5}
                        sufijo="min"
                        etiqueta="duración"
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
                    <Interruptor
                      activo={s.online !== false}
                      onCambio={(v) => editar(s._key, 'online', v)}
                      etiqueta={`Reservar ${s.nombre} online`}
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

      <BarraGuardar
        visible={activa && !!cambiado}
        guardando={guardando}
        onGuardar={onGuardar}
        onDescartar={() => {
          setServicios(JSON.parse(original).map(conKey))
        }}
        texto="Has cambiado los servicios"
      />
    </>
  )
  // #endregion
}

export default AjustesServicios

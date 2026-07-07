import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, LogOut, Plus, Trash2, Loader2, Check, Save } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import { getServicios, guardarServicios } from '../../../lib/config'
import { logout } from '../../../lib/panel'

/**
 * Ajuste de los SERVICIOS (nombre, descripción, duración, precio y activo). Se
 * editan en local y se guardan de golpe, igual que el horario. Al guardar, la
 * reserva, el panel y la home leen la nueva lista. El icono y el "destacado" se
 * mantienen tal cual (se fijan en el código/seed, no se editan aquí).
 */
export default function AjustesServicios({ onVolver }) {
  const [servicios, setServicios] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')
  const nextKey = useRef(0)

  // Cada servicio lleva una `_key` estable en local para el render (los ids de
  // Supabase se regeneran al guardar, y los nuevos aún no tienen id).
  const conKey = (s) => ({ ...s, _key: nextKey.current++ })

  useEffect(() => {
    let vivo = true
    getServicios().then((lista) => {
      if (vivo) setServicios(lista.map(conKey))
    })
    return () => {
      vivo = false
    }
  }, [])

  const editar = (key, campo, valor) =>
    setServicios((ss) => ss.map((s) => (s._key === key ? { ...s, [campo]: valor } : s)))

  const borrar = (key) => setServicios((ss) => ss.filter((s) => s._key !== key))

  const anadir = () =>
    setServicios((ss) => [
      ...ss,
      conKey({
        nombre: '',
        descripcion: '',
        duracion: 30,
        precio: 0,
        icono: 'Scissors',
        destacado: false,
        activo: true,
      }),
    ])

  async function onGuardar() {
    if (guardando || !servicios) return
    setGuardando(true)
    setMsg('')
    const res = await guardarServicios(servicios)
    setGuardando(false)
    setMsg(res.ok ? 'guardado' : res.error || 'Error al guardar')
  }

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="pizarra sticky top-0 z-20 border-b border-acento/20 text-hueso">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onVolver}
            className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
          >
            <ArrowLeft size={16} /> Agenda
          </button>
          <div className="flex items-center gap-2.5">
            <LogoAdriComponent className="h-9 w-9" />
            <span className="text-sm tracking-kicker text-acento">Servicios</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <p className="mb-5 rounded-xl bg-tinta/5 px-4 py-3 text-sm text-tinta/70">
          Estos son los servicios que ve el cliente al reservar y en la web. Desactiva
          uno para <strong>ocultarlo</strong> sin borrarlo. La <strong>duración</strong> se
          usa para calcular los huecos libres.
        </p>

        {servicios === null ? (
          <div className="flex flex-col items-center gap-3 py-16 text-tinta/50">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-sm">Cargando servicios…</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {servicios.map((s) => (
                <div
                  key={s._key}
                  className={`rounded-2xl border bg-white p-4 ${
                    s.activo === false ? 'border-hueso-200 opacity-60' : 'border-hueso-200'
                  }`}
                >
                  {/* Nombre + activo */}
                  <div className="flex items-center gap-3">
                    <input
                      value={s.nombre}
                      onChange={(e) => editar(s._key, 'nombre', e.target.value)}
                      placeholder="Nombre del servicio"
                      className="min-w-0 flex-1 rounded-lg border border-hueso-200 bg-white px-3 py-2 font-display text-lg font-semibold outline-none focus:border-acento"
                    />
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                      <span className={s.activo !== false ? 'text-tinta' : 'text-tinta/40'}>
                        {s.activo !== false ? 'Activo' : 'Oculto'}
                      </span>
                      <input
                        type="checkbox"
                        checked={s.activo !== false}
                        onChange={(e) => editar(s._key, 'activo', e.target.checked)}
                        className="h-4 w-4 accent-acento"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => borrar(s._key)}
                      className="shrink-0 text-tinta/40 transition-colors hover:text-red-600"
                      aria-label="Borrar servicio"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Descripción */}
                  <textarea
                    value={s.descripcion || ''}
                    onChange={(e) => editar(s._key, 'descripcion', e.target.value)}
                    placeholder="Descripción (se muestra en la web)"
                    rows={2}
                    className="mt-3 w-full resize-none rounded-lg border border-hueso-200 bg-white px-3 py-2 text-sm outline-none focus:border-acento"
                  />

                  {/* Duración · precio */}
                  <div className="mt-3 flex flex-wrap items-end gap-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-tinta/60">Duración</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={s.duracion}
                          onChange={(e) => editar(s._key, 'duracion', Number(e.target.value))}
                          className="w-20 rounded-lg border border-hueso-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-acento"
                        />
                        <span className="text-sm text-tinta/50">min</span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-tinta/60">Precio</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          step="0.5"
                          value={s.precio}
                          onChange={(e) => editar(s._key, 'precio', Number(e.target.value))}
                          className="w-20 rounded-lg border border-hueso-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-acento"
                        />
                        <span className="text-sm text-tinta/50">€</span>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={anadir}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
            >
              <Plus size={16} /> Añadir servicio
            </button>

            {/* Guardar (barra fija abajo) */}
            <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-hueso/80 py-3 backdrop-blur">
              <button
                type="button"
                onClick={onGuardar}
                disabled={guardando}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-acento py-3.5 font-semibold text-tinta transition-colors hover:bg-acento-claro disabled:opacity-60"
              >
                {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar servicios
              </button>
              {msg === 'guardado' ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <Check size={16} /> Guardado
                </span>
              ) : msg ? (
                <span className="text-sm text-red-600">{msg}</span>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

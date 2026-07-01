import { useState, useEffect } from 'react'
import { ArrowLeft, LogOut, Plus, Trash2, Loader2, Check, Save } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import { getHorario, guardarHorario } from '../../../lib/config'
import { logout } from '../../../lib/panel'

/**
 * Ajuste del HORARIO de trabajo (días y tramos). Es el horario recurrente de
 * cada semana; los días/ratos sueltos (vacaciones) van con "Día libre" en la
 * agenda. Al guardar, la web recalcula los huecos con este horario.
 */
export default function AjustesHorario({ onVolver }) {
  const [dias, setDias] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let vivo = true
    getHorario().then((h) => {
      if (vivo) setDias(h.map((d) => ({ ...d, tramos: d.tramos.map((t) => [...t]) })))
    })
    return () => {
      vivo = false
    }
  }, [])

  const setTramos = (dia, tramos) =>
    setDias((ds) => ds.map((d) => (d.dia === dia ? { ...d, tramos } : d)))

  const toggleDia = (dia, abierto) =>
    setTramos(dia, abierto ? [['10:00', '14:00']] : [])

  const addTramo = (dia, actuales) => setTramos(dia, [...actuales, ['17:00', '20:00']])

  const editTramo = (dia, i, pos, val) =>
    setDias((ds) =>
      ds.map((d) => {
        if (d.dia !== dia) return d
        const tramos = d.tramos.map((t, j) =>
          j === i ? (pos === 0 ? [val, t[1]] : [t[0], val]) : t
        )
        return { ...d, tramos }
      })
    )

  const removeTramo = (dia, i) =>
    setDias((ds) =>
      ds.map((d) => (d.dia === dia ? { ...d, tramos: d.tramos.filter((_, j) => j !== i) } : d))
    )

  async function onGuardar() {
    if (guardando || !dias) return
    setGuardando(true)
    setMsg('')
    const res = await guardarHorario(dias)
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
            <span className="text-sm tracking-kicker text-acento">Horario</span>
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
          Estos son tus días y horas <strong>de cada semana</strong>. Para cerrar un día
          puntual o irte de vacaciones, usa <strong>"Día libre"</strong> en la agenda.
        </p>

        {dias === null ? (
          <div className="flex flex-col items-center gap-3 py-16 text-tinta/50">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-sm">Cargando horario…</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {dias.map((d) => {
                const abierto = d.tramos.length > 0
                return (
                  <div key={d.dia} className="rounded-2xl border border-hueso-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-semibold">{d.nombre}</span>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <span className={abierto ? 'text-tinta' : 'text-tinta/40'}>
                          {abierto ? 'Abierto' : 'Cerrado'}
                        </span>
                        <input
                          type="checkbox"
                          checked={abierto}
                          onChange={(e) => toggleDia(d.dia, e.target.checked)}
                          className="h-4 w-4 accent-acento"
                        />
                      </label>
                    </div>

                    {abierto && (
                      <div className="mt-3 space-y-2">
                        {d.tramos.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={t[0]}
                              onChange={(e) => editTramo(d.dia, i, 0, e.target.value)}
                              className="rounded-lg border border-hueso-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-acento"
                            />
                            <span className="text-tinta/40">–</span>
                            <input
                              type="time"
                              value={t[1]}
                              onChange={(e) => editTramo(d.dia, i, 1, e.target.value)}
                              className="rounded-lg border border-hueso-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-acento"
                            />
                            <button
                              type="button"
                              onClick={() => removeTramo(d.dia, i)}
                              className="ml-1 text-tinta/40 transition-colors hover:text-red-600"
                              aria-label="Quitar tramo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTramo(d.dia, d.tramos)}
                          className="flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
                        >
                          <Plus size={15} /> Añadir tramo
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Guardar (barra fija abajo) */}
            <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-hueso/80 py-3 backdrop-blur">
              <button
                type="button"
                onClick={onGuardar}
                disabled={guardando}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-acento py-3.5 font-semibold text-tinta transition-colors hover:bg-acento-claro disabled:opacity-60"
              >
                {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar horario
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

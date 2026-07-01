import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Ban, LogOut, Phone, Check, X,
  CalendarDays, Loader2, Trash2,
} from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import NuevaCitaModal from './NuevaCitaModal'
import BloquearModal from './BloquearModal'
import { sumarMin } from '../../../utils/disponibilidad'
import { fechaLarga, hora as fmtHora, inicioDia, mismoDia } from '../../../utils/fechas'
import {
  listarCitas, listarBloqueos, cambiarEstado, borrarBloqueo, logout,
} from '../../../lib/panel'

/**
 * Agenda del día del barbero: ve sus citas, marca atendida/cancela, añade
 * citas a mano y bloquea ratos. Navegación por días.
 */
export default function AgendaPanel() {
  const [dia, setDia] = useState(() => inicioDia(new Date()))
  const [datos, setDatos] = useState({ citas: [], bloqueos: [] })
  const [cargando, setCargando] = useState(true)
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState(null) // 'cita' | 'bloquear' | null

  useEffect(() => {
    let vivo = true
    const desde = dia
    const hasta = sumarMin(dia, 24 * 60)
    Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)]).then(
      ([citas, bloqueos]) => {
        if (!vivo) return
        setDatos({ citas, bloqueos })
        setCargando(false)
      }
    )
    return () => {
      vivo = false
    }
  }, [dia, tick])

  const recargar = () => setTick((t) => t + 1)
  const cambiarDia = (delta) => setDia((d) => sumarMin(d, delta * 24 * 60))
  const esHoy = mismoDia(dia, new Date())

  const activas = datos.citas.filter((c) => c.estado !== 'cancelada')
  const canceladas = datos.citas.filter((c) => c.estado === 'cancelada')

  async function accion(id, estado) {
    await cambiarEstado(id, estado)
    recargar()
  }
  async function quitarBloqueo(id) {
    await borrarBloqueo(id)
    recargar()
  }

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      {/* Cabecera */}
      <header className="pizarra sticky top-0 z-20 border-b border-acento/20 text-hueso">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <LogoAdriComponent className="h-9 w-9" />
            <span className="text-sm tracking-kicker text-acento">Agenda</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Navegación de día */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => cambiarDia(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 bg-white transition-colors hover:border-acento"
            aria-label="Día anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-display text-lg font-bold capitalize">{fechaLarga(dia)}</p>
            {!esHoy && (
              <button
                type="button"
                onClick={() => setDia(inicioDia(new Date()))}
                className="text-xs text-acento hover:underline"
              >
                Ir a hoy
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => cambiarDia(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 bg-white transition-colors hover:border-acento"
            aria-label="Día siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Acciones */}
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setModal('cita')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-acento py-3 text-sm font-semibold text-tinta transition-colors hover:bg-acento-claro"
          >
            <Plus size={18} /> Nueva cita
          </button>
          <button
            type="button"
            onClick={() => setModal('bloquear')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-tinta/20 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-tinta hover:text-hueso"
          >
            <Ban size={18} /> Bloquear
          </button>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center gap-3 py-16 text-tinta/50">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-sm">Cargando agenda…</p>
          </div>
        ) : (
          <>
            {/* Bloqueos del día */}
            {datos.bloqueos.map((b) => (
              <div
                key={`b${b.id}`}
                className="mb-3 flex items-center justify-between rounded-xl border border-dashed border-tinta/25 bg-tinta/5 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2 text-tinta/70">
                  <Ban size={16} />
                  Bloqueado {fmtHora(new Date(b.inicio))}–{fmtHora(new Date(b.fin))}
                  {b.motivo ? ` · ${b.motivo}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => quitarBloqueo(b.id)}
                  className="text-tinta/40 transition-colors hover:text-red-600"
                  aria-label="Quitar bloqueo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Citas activas */}
            {activas.length === 0 && datos.bloqueos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-hueso-200 bg-white py-16 text-center">
                <CalendarDays size={30} className="text-tinta/25" />
                <p className="font-medium">Sin citas este día</p>
                <p className="text-sm text-tinta/50">Disfruta o añade una a mano.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activas.map((c) => (
                  <CitaCard key={c.id} cita={c} onAccion={accion} />
                ))}
              </div>
            )}

            {/* Canceladas (plegadas al final) */}
            {canceladas.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs tracking-kicker text-tinta/40">Canceladas</p>
                <div className="space-y-2">
                  {canceladas.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl bg-tinta/5 px-4 py-2.5 text-sm text-tinta/40 line-through"
                    >
                      {fmtHora(new Date(c.inicio))} · {c.servicio_nombre} · {c.cliente_nombre}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {modal === 'cita' && (
        <NuevaCitaModal fechaInicial={dia} onClose={() => setModal(null)} onCreada={recargar} />
      )}
      {modal === 'bloquear' && (
        <BloquearModal fechaInicial={dia} onClose={() => setModal(null)} onCreado={recargar} />
      )}
    </div>
  )
}

function CitaCard({ cita, onAccion }) {
  const ini = new Date(cita.inicio)
  const fin = new Date(cita.fin)
  const atendida = cita.estado === 'atendida'
  const movil = (cita.cliente_movil || '').replace(/\s+/g, '')

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition-colors ${
        atendida ? 'border-green-200' : 'border-hueso-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">
            {fmtHora(ini)} <span className="text-tinta/40">– {fmtHora(fin)}</span>
          </p>
          <p className="text-sm text-tinta/60">{cita.servicio_nombre}</p>
          <p className="mt-1 truncate font-medium">{cita.cliente_nombre}</p>
        </div>
        {atendida && (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            Atendida
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {movil && (
          <>
            <a
              href={`tel:${movil}`}
              className="flex items-center gap-1.5 rounded-full border border-hueso-200 px-3 py-1.5 text-xs font-medium transition-colors hover:border-acento"
            >
              <Phone size={13} /> {cita.cliente_movil}
            </a>
            <a
              href={`https://wa.me/34${movil}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-hueso-200 px-3 py-1.5 text-xs font-medium text-[#128C4B] transition-colors hover:border-[#25D366]"
            >
              <WhatsAppIcon size={13} /> WhatsApp
            </a>
          </>
        )}
        <div className="ml-auto flex gap-2">
          {!atendida && (
            <button
              type="button"
              onClick={() => onAccion(cita.id, 'atendida')}
              className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
            >
              <Check size={14} /> Atendida
            </button>
          )}
          <button
            type="button"
            onClick={() => onAccion(cita.id, 'cancelada')}
            className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <X size={14} /> Cancelar
          </button>
        </div>
      </div>
    </article>
  )
}

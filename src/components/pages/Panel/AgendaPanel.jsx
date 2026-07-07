import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Ban, LogOut, Phone, Check, X,
  CalendarDays, Loader2, Trash2, RotateCcw, Clock, Scissors,
} from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import NuevaCitaModal from './NuevaCitaModal'
import BloquearModal from './BloquearModal'
import { sumarMin } from '../../../utils/disponibilidad'
import {
  fechaLarga, fechaCorta, hora as fmtHora, inicioDia, inicioSemana, mismoDia,
} from '../../../utils/fechas'
import {
  listarCitas, listarBloqueos, cambiarEstado, borrarBloqueo, logout,
} from '../../../lib/panel'

/**
 * Agenda del barbero con dos vistas: DÍA (detalle + acciones) y SEMANA
 * (resumen de los 7 días). Añadir cita a mano y bloquear ratos.
 */
export default function AgendaPanel({ onAbrirHorario, onAbrirServicios }) {
  const [vista, setVista] = useState('dia') // 'dia' | 'semana'
  const [dia, setDia] = useState(() => inicioDia(new Date()))
  const [datos, setDatos] = useState({ citas: [], bloqueos: [] })
  const [cargando, setCargando] = useState(true)
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState(null) // 'cita' | 'bloquear' | null

  // Rango para el render (etiquetas, navegación, vista semana).
  const desde = vista === 'semana' ? inicioSemana(dia) : dia
  const dias = vista === 'semana' ? 7 : 1

  // Carga de datos según la vista (deps primitivas para el linter).
  const diaMs = dia.getTime()
  useEffect(() => {
    const base = new Date(diaMs)
    const d = vista === 'semana' ? inicioSemana(base) : inicioDia(base)
    const cnt = vista === 'semana' ? 7 : 1
    const h = sumarMin(d, cnt * 24 * 60)
    let vivo = true
    Promise.all([listarCitas(d, h), listarBloqueos(d, h)]).then(([citas, bloqueos]) => {
      if (!vivo) return
      setDatos({ citas, bloqueos })
      setCargando(false)
    })
    return () => {
      vivo = false
    }
  }, [vista, diaMs, tick])

  const recargar = () => setTick((t) => t + 1)
  const mover = (signo) => setDia((d) => sumarMin(d, signo * dias * 24 * 60))
  const esHoy = mismoDia(dia, new Date())

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
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onAbrirServicios}
              className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
            >
              <Scissors size={16} />
              Servicios
            </button>
            <button
              type="button"
              onClick={onAbrirHorario}
              className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
            >
              <Clock size={16} />
              Horario
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {/* Conmutador Día / Semana */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex rounded-full border border-hueso-200 bg-white p-1">
            {['dia', 'semana'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVista(v)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors ${
                  vista === v ? 'bg-tinta text-hueso' : 'text-tinta/60'
                }`}
              >
                {v === 'dia' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => mover(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 bg-white transition-colors hover:border-acento"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-display text-lg font-bold capitalize">
              {vista === 'dia' ? fechaLarga(dia) : rotuloSemana(desde)}
            </p>
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
            onClick={() => mover(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 bg-white transition-colors hover:border-acento"
            aria-label="Siguiente"
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
            <Ban size={18} /> Día libre
          </button>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center gap-3 py-16 text-tinta/50">
            <Loader2 size={26} className="animate-spin" />
            <p className="text-sm">Cargando agenda…</p>
          </div>
        ) : vista === 'semana' ? (
          <VistaSemana
            inicio={desde}
            citas={datos.citas}
            bloqueos={datos.bloqueos}
            onDia={(d) => {
              setDia(inicioDia(d))
              setVista('dia')
            }}
          />
        ) : (
          <VistaDia
            citas={datos.citas}
            bloqueos={datos.bloqueos}
            onAccion={accion}
            onQuitarBloqueo={quitarBloqueo}
          />
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

function rotuloSemana(inicio) {
  const fin = new Date(inicio)
  fin.setDate(inicio.getDate() + 6)
  const a = fechaCorta(inicio)
  const b = fechaCorta(fin)
  return `${a.dia} ${a.mes} – ${b.dia} ${b.mes}`
}

// ─── Vista DÍA ──────────────────────────────────────────────
function VistaDia({ citas, bloqueos, onAccion, onQuitarBloqueo }) {
  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const canceladas = citas.filter((c) => c.estado === 'cancelada')

  return (
    <>
      {bloqueos.map((b) => (
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
            onClick={() => onQuitarBloqueo(b.id)}
            className="text-tinta/40 transition-colors hover:text-red-600"
            aria-label="Quitar bloqueo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {activas.length === 0 && bloqueos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-hueso-200 bg-white py-16 text-center">
          <CalendarDays size={30} className="text-tinta/25" />
          <p className="font-medium">Sin citas este día</p>
          <p className="text-sm text-tinta/50">Disfruta o añade una a mano.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activas.map((c) => (
            <CitaCard key={c.id} cita={c} onAccion={onAccion} />
          ))}
        </div>
      )}

      {canceladas.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs tracking-kicker text-tinta/40">Canceladas</p>
          <div className="space-y-2">
            {canceladas.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-tinta/5 px-4 py-2.5 text-sm text-tinta/40 line-through"
              >
                {fmtHora(new Date(c.inicio))} · {c.servicio_nombre} · {c.cliente_nombre}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Vista SEMANA ───────────────────────────────────────────
function VistaSemana({ inicio, citas, bloqueos, onDia }) {
  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })
  const hoy = new Date()

  return (
    <div className="space-y-3">
      {dias.map((d) => {
        const delDia = activas
          .filter((c) => mismoDia(new Date(c.inicio), d))
          .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
        const bloqueado = bloqueos.some((b) => mismoDia(new Date(b.inicio), d))
        const { diaSemana, dia: num } = fechaCorta(d)
        const esHoy = mismoDia(d, hoy)

        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onDia(d)}
            className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-colors hover:border-acento ${
              esHoy ? 'border-acento/60' : 'border-hueso-200'
            }`}
          >
            <div className="w-12 shrink-0 text-center">
              <p className="text-xs uppercase text-tinta/40">{diaSemana}</p>
              <p className="font-display text-2xl font-bold leading-tight">{num}</p>
            </div>
            <div className="min-w-0 flex-1">
              {delDia.length === 0 && !bloqueado ? (
                <p className="text-sm text-tinta/40">Sin citas</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {bloqueado && (
                    <span className="rounded-md bg-tinta/10 px-2 py-0.5 text-xs text-tinta/60">
                      Bloqueado
                    </span>
                  )}
                  {delDia.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md bg-acento/15 px-2 py-0.5 text-xs font-medium text-tinta"
                    >
                      {fmtHora(new Date(c.inicio))} {c.cliente_nombre.split(' ')[0]}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-tinta/50">
              {delDia.length || ''}
            </span>
          </button>
        )
      })}
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
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            atendida ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${atendida ? 'bg-green-500' : 'bg-amber-500'}`} />
          {atendida ? 'Atendida' : 'Pendiente'}
        </span>
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
          {atendida ? (
            <button
              type="button"
              onClick={() => onAccion(cita.id, 'pendiente')}
              className="flex items-center gap-1.5 rounded-full border border-hueso-200 px-3 py-1.5 text-xs font-semibold text-tinta/70 transition-colors hover:border-tinta/40"
            >
              <RotateCcw size={14} /> Deshacer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAccion(cita.id, 'atendida')}
                className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
              >
                <Check size={14} /> Marcar atendida
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Cancelar esta cita?')) onAccion(cita.id, 'cancelada')
                }}
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <X size={14} /> Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

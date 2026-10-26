import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import {
  ChevronLeft, ChevronRight, Plus, Ban, Phone, Check, X, CalendarDays,
  RotateCcw, Clock, Coffee, Moon, Wallet, Users, Hourglass, CalendarPlus,
} from 'lucide-react'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import NuevaCitaModal from './NuevaCitaModal'
import BloquearModal from './BloquearModal'
import { useAviso } from './avisoContexto'
import { CabeceraSeccion, Segmentado, Esqueleto } from './Controles'
import { aHora, sumarMin } from '../../../utils/disponibilidad'
import {
  fechaLarga, fechaCorta, hora as fmtHora, inicioDia, inicioSemana, mismoDia,
} from '../../../utils/fechas'
import {
  listarCitas, listarBloqueos, cambiarEstado, borrarBloqueo, crearBloqueo,
} from '../../../lib/panel'
import { getHorario, getServicios } from '../../../lib/config'
import { EASE_SUAVE } from '../../../theme/animacion'

// Huecos más cortos que esto no se ofrecen como "libre" (no cabe un corte).
const HUECO_MINIMO = 30

/**
 * Agenda del barbero.
 *  - Arriba, el resumen del día (citas, atendidas, pendientes, caja prevista)
 *    y, si es hoy, la SIGUIENTE cita bien grande con sus botones.
 *  - Una tira con los 7 días de la semana (con puntitos de cuántas citas hay)
 *    para saltar de un día a otro de un toque.
 *  - Vista DÍA: línea de tiempo con las citas, los ratos cerrados y los
 *    HUECOS LIBRES (con botón para meter una cita justo ahí).
 *  - Vista SEMANA: los 7 días de un vistazo.
 *
 * Marcar atendida o cancelar se hace al momento y se puede deshacer desde el
 * aviso de abajo, en vez de preguntar "¿seguro?" cada vez.
 */
export default function AgendaPanel({ activa = true }) {
  const avisar = useAviso()
  const [vista, setVista] = useState('dia')
  const [dia, setDia] = useState(() => inicioDia(new Date()))
  const [datos, setDatos] = useState(null) // { citas, bloqueos } de la semana
  const [horario, setHorario] = useState(null)
  const [servicios, setServicios] = useState([])
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState(null) // { tipo: 'cita'|'bloquear', hora? }
  const [ahora, setAhora] = useState(() => new Date())

  // El reloj avanza cada minuto ("en curso", "en 20 min").
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let vivo = true
    Promise.all([getHorario(), getServicios()]).then(([h, s]) => {
      if (!vivo) return
      setHorario(h)
      setServicios(s)
    })
    return () => {
      vivo = false
    }
  }, [])

  // Se carga la SEMANA entera: con eso salen la tira de días, la vista
  // semana y la del día sin pedir nada más al cambiar de día.
  const semana = inicioSemana(dia).getTime()
  useEffect(() => {
    const desde = new Date(semana)
    const hasta = sumarMin(desde, 7 * 24 * 60)
    let vivo = true
    Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)]).then(([citas, bloqueos]) => {
      if (vivo) setDatos({ citas, bloqueos })
    })
    return () => {
      vivo = false
    }
  }, [semana, tick])

  const recargar = () => setTick((t) => t + 1)
  const esHoy = mismoDia(dia, ahora)

  const precios = useMemo(() => new Map(servicios.map((s) => [s.nombre, Number(s.precio) || 0])), [servicios])

  const delDia = useMemo(() => {
    if (!datos) return null
    const citas = datos.citas.filter((c) => mismoDia(new Date(c.inicio), dia))
    const bloqueos = datos.bloqueos.filter((b) => new Date(b.inicio) < sumarMin(dia, 24 * 60) && new Date(b.fin) > dia)
    return { citas, bloqueos }
  }, [datos, dia])

  // ── Acciones (se aplican al momento y se pueden deshacer) ──
  const fijarEstadoLocal = (id, estado) =>
    setDatos((d) => d && { ...d, citas: d.citas.map((c) => (c.id === id ? { ...c, estado } : c)) })

  async function cambiar(cita, estado, texto) {
    const anterior = cita.estado
    fijarEstadoLocal(cita.id, estado)
    const res = await cambiarEstado(cita.id, estado)
    if (!res.ok) {
      fijarEstadoLocal(cita.id, anterior)
      avisar({ texto: 'No se pudo guardar. Revisa la conexión.', tipo: 'error' })
      return
    }
    avisar({
      texto,
      deshacer: async () => {
        fijarEstadoLocal(cita.id, anterior)
        await cambiarEstado(cita.id, anterior)
      },
    })
  }

  async function quitarBloqueo(b) {
    const res = await borrarBloqueo(b.id)
    if (!res.ok) return avisar({ texto: 'No se pudo quitar.', tipo: 'error' })
    recargar()
    avisar({
      texto: 'Vuelve a estar abierto',
      deshacer: async () => {
        await crearBloqueo({ inicio: new Date(b.inicio), fin: new Date(b.fin), motivo: b.motivo })
        recargar()
      },
    })
  }

  const moverSemana = (signo) => setDia((d) => sumarMin(d, signo * 7 * 24 * 60))

  return (
    <>
      <CabeceraSeccion
        kicker={saludo(ahora)}
        titulo={esHoy ? 'Hoy' : capital(fechaLarga(dia))}
        ayuda={esHoy ? capital(fechaLarga(dia)) : 'Toca una cita para llamar o escribir al cliente.'}
      >
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => setModal({ tipo: 'bloquear' })}
            className="flex items-center gap-2 rounded-full border border-tinta/15 bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-tinta hover:bg-tinta hover:text-hueso active:scale-[0.98]"
          >
            <Ban size={17} /> Día libre
          </button>
          <button
            type="button"
            onClick={() => setModal({ tipo: 'cita' })}
            className="flex items-center gap-2 rounded-full bg-acento px-5 py-3 text-sm font-semibold text-tinta shadow-lg shadow-acento/25 transition-all hover:bg-acento-claro active:scale-[0.98]"
          >
            <Plus size={18} /> Nueva cita
          </button>
        </div>
      </CabeceraSeccion>

      {/* Resumen del día */}
      {delDia ? (
        <Resumen citas={delDia.citas} precios={precios} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-tinta/[0.06]" />
          ))}
        </div>
      )}

      {/* La siguiente cita, bien a la vista (solo hoy) */}
      {esHoy && delDia && <Siguiente citas={delDia.citas} ahora={ahora} precios={precios} onEstado={cambiar} />}

      {/* Semana: navegación + tira de días */}
      <div className="mb-6 rounded-3xl border border-hueso-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1">
            <BotonRedondo onClick={() => moverSemana(-1)} etiqueta="Semana anterior">
              <ChevronLeft size={18} />
            </BotonRedondo>
            <BotonRedondo onClick={() => moverSemana(1)} etiqueta="Semana siguiente">
              <ChevronRight size={18} />
            </BotonRedondo>
            <p className="ml-1 font-display text-base font-bold sm:text-lg">{rotuloSemana(new Date(semana))}</p>
          </div>
          <div className="flex items-center gap-2">
            {!esHoy && (
              <button
                type="button"
                onClick={() => setDia(inicioDia(new Date()))}
                className="rounded-full bg-acento/15 px-3 py-1.5 text-xs font-semibold text-acento-oscuro transition-colors hover:bg-acento hover:text-tinta"
              >
                Hoy
              </button>
            )}
            <div className="hidden sm:block">
              <Segmentado
                opciones={[{ valor: 'dia', texto: 'Día' }, { valor: 'semana', texto: 'Semana' }]}
                valor={vista}
                onCambio={setVista}
              />
            </div>
          </div>
        </div>

        <TiraDias
          inicio={new Date(semana)}
          dia={dia}
          ahora={ahora}
          citas={datos?.citas ?? []}
          horario={horario}
          onElegir={(d) => {
            setDia(d)
            setVista('dia')
          }}
        />

        <div className="mt-3 flex justify-center sm:hidden">
          <Segmentado
            opciones={[{ valor: 'dia', texto: 'Día' }, { valor: 'semana', texto: 'Semana' }]}
            valor={vista}
            onCambio={setVista}
          />
        </div>
      </div>

      {/* Contenido */}
      {!delDia || !horario ? (
        <Esqueleto filas={4} alto="h-20" />
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key={`${vista}-${dia.getTime()}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_SUAVE }}
          >
            {vista === 'semana' ? (
              <VistaSemana
                inicio={new Date(semana)}
                citas={datos.citas}
                bloqueos={datos.bloqueos}
                horario={horario}
                ahora={ahora}
                onDia={(d) => {
                  setDia(d)
                  setVista('dia')
                }}
              />
            ) : (
              <VistaDia
                dia={dia}
                ahora={ahora}
                horario={horario}
                citas={delDia.citas}
                bloqueos={delDia.bloqueos}
                precios={precios}
                onEstado={cambiar}
                onQuitarBloqueo={quitarBloqueo}
                onNuevaEn={(hora) => setModal({ tipo: 'cita', hora })}
              />
            )}
          </m.div>
        </AnimatePresence>
      )}

      {/* Botón flotante (móvil): nueva cita o día libre. Solo con la agenda a
          la vista: va en un portal y no se esconde con la pantalla. */}
      {activa && (
        <BotonFlotante
          onCita={() => setModal({ tipo: 'cita' })}
          onBloquear={() => setModal({ tipo: 'bloquear' })}
        />
      )}

      <AnimatePresence>
        {modal?.tipo === 'cita' && (
          <NuevaCitaModal
            key="cita"
            fechaInicial={dia}
            horaInicial={modal.hora}
            onClose={() => setModal(null)}
            onCreada={(texto) => {
              recargar()
              avisar({ texto })
            }}
          />
        )}
        {modal?.tipo === 'bloquear' && (
          <BloquearModal
            key="bloquear"
            fechaInicial={dia}
            onClose={() => setModal(null)}
            onCreado={(texto) => {
              recargar()
              avisar({ texto })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Utilidades ─────────────────────────────────────────────

const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1)

function saludo(d) {
  const h = d.getHours()
  return h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'
}

function rotuloSemana(inicio) {
  const fin = new Date(inicio)
  fin.setDate(inicio.getDate() + 6)
  const a = fechaCorta(inicio)
  const b = fechaCorta(fin)
  return a.mes === b.mes ? `${a.dia} – ${b.dia} ${b.mes}` : `${a.dia} ${a.mes} – ${b.dia} ${b.mes}`
}

const minutos = (a, b) => Math.round((b - a) / 60000)

function duracionTexto(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

function cuandoTexto(inicio, ahora) {
  const min = minutos(ahora, inicio)
  if (min <= 0) return 'Ahora'
  if (min < 60) return `En ${min} min`
  return `A las ${fmtHora(inicio)}`
}

/** Tramos de trabajo del día menos citas y bloqueos = huecos libres. */
function huecosLibres(dia, horario, ocupados, ahora) {
  const def = horario.find((h) => h.dia === dia.getDay())
  if (!def?.tramos?.length) return []
  const ocup = ocupados
    .map((o) => ({ ini: new Date(o.inicio), fin: new Date(o.fin) }))
    .sort((a, b) => a.ini - b.ini)

  // Hoy, lo que ya ha pasado no cuenta como libre (redondeado al cuarto).
  let desdeAhora = null
  if (mismoDia(dia, ahora)) {
    desdeAhora = new Date(ahora)
    desdeAhora.setMinutes(Math.ceil(ahora.getMinutes() / 15) * 15, 0, 0)
  }

  const libres = []
  for (const [a, b] of def.tramos) {
    let cursor = aHora(dia, a)
    const finTramo = aHora(dia, b)
    if (desdeAhora && desdeAhora > cursor) cursor = desdeAhora
    for (const o of ocup) {
      if (o.fin <= cursor || o.ini >= finTramo) continue
      if (o.ini > cursor && minutos(cursor, o.ini) >= HUECO_MINIMO) libres.push({ inicio: cursor, fin: o.ini })
      if (o.fin > cursor) cursor = o.fin
    }
    if (minutos(cursor, finTramo) >= HUECO_MINIMO) libres.push({ inicio: cursor, fin: finTramo })
  }
  return libres
}

function BotonRedondo({ onClick, etiqueta, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="flex h-9 w-9 items-center justify-center rounded-full text-tinta/60 transition-colors hover:bg-tinta/5 hover:text-tinta active:scale-90"
    >
      {children}
    </button>
  )
}

// ─── Resumen ────────────────────────────────────────────────

function Resumen({ citas, precios }) {
  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const atendidas = activas.filter((c) => c.estado === 'atendida').length
  const pendientes = activas.length - atendidas
  const caja = activas.reduce((t, c) => t + (precios.get(c.servicio_nombre) ?? 0), 0)
  const hecho = activas.length ? atendidas / activas.length : 0

  const tarjetas = [
    { Icono: Users, etiqueta: 'Citas', valor: activas.length },
    { Icono: Check, etiqueta: 'Atendidas', valor: atendidas, progreso: hecho },
    { Icono: Hourglass, etiqueta: 'Pendientes', valor: pendientes },
    { Icono: Wallet, etiqueta: 'Caja prevista', valor: `${formatoEuros(caja)} €`, oscuro: true },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tarjetas.map((t, i) => (
        <m.div
          key={t.etiqueta}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${
            t.oscuro ? 'grain bg-tinta text-hueso' : 'border border-hueso-200 bg-white'
          }`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_SUAVE }}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium ${t.oscuro ? 'text-hueso/60' : 'text-tinta/50'}`}>{t.etiqueta}</p>
            <t.Icono size={16} className={t.oscuro ? 'text-acento' : 'text-acento-oscuro'} />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums sm:text-4xl">{t.valor}</p>
          {t.progreso !== undefined && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tinta/5">
              <m.div
                className="h-full origin-left rounded-full bg-green-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: t.progreso }}
                transition={{ duration: 0.8, ease: EASE_SUAVE }}
              />
            </div>
          )}
        </m.div>
      ))}
    </div>
  )
}

const formatoEuros = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','))

// ─── Siguiente cita ─────────────────────────────────────────

function Siguiente({ citas, ahora, precios, onEstado }) {
  const siguiente = citas
    .filter((c) => c.estado === 'pendiente' && new Date(c.fin) > ahora)
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))[0]

  if (!siguiente) return null

  const ini = new Date(siguiente.inicio)
  const fin = new Date(siguiente.fin)
  const enCurso = ini <= ahora
  const movil = (siguiente.cliente_movil || '').replace(/\s+/g, '')

  return (
    <m.section
      key={siguiente.id}
      aria-label="Siguiente cita"
      className="grain relative mb-6 overflow-hidden rounded-3xl bg-tinta p-5 text-hueso shadow-xl shadow-tinta/20 sm:p-7"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_SUAVE }}
    >
      <img
        src="/logo-sello.webp"
        alt=""
        aria-hidden="true"
        className="gira-lento pointer-events-none absolute -right-16 -top-16 w-56 opacity-[0.07] sm:w-72"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs tracking-kicker text-acento">
            {enCurso && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acento opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-acento" />
              </span>
            )}
            {enCurso ? 'Ahora en la silla' : `Siguiente · ${cuandoTexto(ini, ahora)}`}
          </p>
          <p className="mt-2 truncate font-display text-3xl font-bold sm:text-4xl">{siguiente.cliente_nombre}</p>
          <p className="mt-1 text-sm text-hueso/65">
            {fmtHora(ini)} – {fmtHora(fin)} · {siguiente.servicio_nombre}
            {precios.has(siguiente.servicio_nombre) && ` · ${formatoEuros(precios.get(siguiente.servicio_nombre))} €`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {movil && (
            <>
              <a
                href={`tel:${movil}`}
                aria-label={`Llamar a ${siguiente.cliente_nombre}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Phone size={19} />
              </a>
              <a
                href={`https://wa.me/34${movil}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp a ${siguiente.cliente_nombre}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
              >
                <WhatsAppIcon size={20} />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => onEstado(siguiente, 'atendida', `${siguiente.cliente_nombre.split(' ')[0]}, atendido`)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-acento px-6 font-semibold text-tinta transition-all hover:bg-acento-claro active:scale-[0.97] sm:flex-none"
          >
            <Check size={18} /> Atendido
          </button>
        </div>
      </div>
    </m.section>
  )
}

// ─── Tira de días ───────────────────────────────────────────

function TiraDias({ inicio, dia, ahora, citas, horario, onElegir }) {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {dias.map((d) => {
        const n = citas.filter((c) => c.estado !== 'cancelada' && mismoDia(new Date(c.inicio), d)).length
        const elegido = mismoDia(d, dia)
        const hoy = mismoDia(d, ahora)
        const cerrado = horario && !horario.find((h) => h.dia === d.getDay())?.tramos?.length
        const { diaSemana, dia: num } = fechaCorta(d)
        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onElegir(d)}
            aria-pressed={elegido}
            aria-label={`${capital(fechaLarga(d))}, ${n} citas`}
            className={`relative flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-all duration-300 active:scale-95 sm:py-3 ${
              elegido
                ? 'bg-tinta text-hueso shadow-lg shadow-tinta/20'
                : hoy
                  ? 'bg-acento/10 text-tinta ring-1 ring-acento/40'
                  : 'text-tinta hover:bg-tinta/5'
            } ${cerrado && !elegido ? 'opacity-45' : ''}`}
          >
            <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${elegido ? 'text-acento' : 'text-tinta/45'}`}>
              {diaSemana}
            </span>
            <span className="font-display text-lg font-bold leading-none sm:text-xl">{num}</span>
            {/* Un puntito por cita (máx. 4) */}
            <span className="flex h-1.5 items-center gap-0.5">
              {Array.from({ length: Math.min(n, 4) }, (_, i) => (
                <span key={i} className={`h-1 w-1 rounded-full ${elegido ? 'bg-acento' : 'bg-acento-oscuro'}`} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Vista DÍA ──────────────────────────────────────────────

function VistaDia({ dia, ahora, horario, citas, bloqueos, precios, onEstado, onQuitarBloqueo, onNuevaEn }) {
  const [verCanceladas, setVerCanceladas] = useState(false)
  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const canceladas = citas.filter((c) => c.estado === 'cancelada')
  const abierto = !!horario.find((h) => h.dia === dia.getDay())?.tramos?.length
  const pasado = inicioDia(dia) < inicioDia(ahora)

  const libres = pasado ? [] : huecosLibres(dia, horario, [...activas, ...bloqueos], ahora)

  const elementos = [
    ...activas.map((c) => ({ tipo: 'cita', inicio: new Date(c.inicio), dato: c })),
    ...bloqueos.map((b) => ({ tipo: 'bloqueo', inicio: new Date(Math.max(new Date(b.inicio), dia)), dato: b })),
    ...libres.map((l) => ({ tipo: 'libre', inicio: l.inicio, dato: l })),
  ].sort((a, b) => a.inicio - b.inicio)

  if (elementos.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-tinta/15 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tinta/5 text-tinta/40">
          {abierto ? <Coffee size={24} /> : <Moon size={24} />}
        </span>
        <p className="mt-4 font-display text-xl font-semibold">{abierto ? 'Sin citas' : 'Día cerrado'}</p>
        <p className="mt-1 max-w-xs text-sm text-tinta/50">
          {pasado
            ? 'Este día ya pasó y no tuvo citas.'
            : abierto
              ? 'No queda hueco libre en el horario de hoy.'
              : 'Según tu horario, este día no se trabaja. Puedes meter una cita igualmente.'}
        </p>
        {!pasado && (
          <button
            type="button"
            onClick={() => onNuevaEn()}
            className="mt-5 flex items-center gap-2 rounded-full bg-acento px-5 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-acento-claro"
          >
            <Plus size={17} /> Añadir cita
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <ol className="relative space-y-3">
        {/* Hilo vertical de la línea de tiempo */}
        <span aria-hidden="true" className="absolute bottom-3 left-[4.25rem] top-3 hidden w-px bg-hueso-200 sm:block" />

        {elementos.map((e, i) => (
          <m.li
            key={`${e.tipo}-${e.dato.id ?? e.inicio.getTime()}`}
            className="relative flex gap-3 sm:gap-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE_SUAVE }}
          >
            {/* En el móvil la hora va dentro de cada tarjeta: así cabe el nombre entero. */}
            <div className="hidden w-14 shrink-0 pt-4 text-right sm:block">
              <p className={`font-display text-sm font-bold tabular-nums sm:text-base ${e.tipo === 'libre' ? 'text-tinta/35' : ''}`}>
                {fmtHora(e.inicio)}
              </p>
            </div>
            <span
              aria-hidden="true"
              className={`relative z-10 mt-5 hidden h-3 w-3 shrink-0 rounded-full ring-4 ring-hueso sm:block ${
                e.tipo === 'libre'
                  ? 'border-2 border-tinta/20 bg-hueso'
                  : e.tipo === 'bloqueo'
                    ? 'bg-tinta/30'
                    : e.dato.estado === 'atendida'
                      ? 'bg-green-500'
                      : 'bg-acento'
              }`}
            />
            <div className="min-w-0 flex-1">
              {e.tipo === 'cita' && <CitaCard cita={e.dato} ahora={ahora} precios={precios} onEstado={onEstado} />}
              {e.tipo === 'bloqueo' && <BloqueoCard bloqueo={e.dato} onQuitar={onQuitarBloqueo} />}
              {e.tipo === 'libre' && <HuecoLibre hueco={e.dato} onNueva={() => onNuevaEn(fmtHora(e.dato.inicio))} />}
            </div>
          </m.li>
        ))}
      </ol>

      {canceladas.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setVerCanceladas((v) => !v)}
            className="text-xs font-semibold uppercase tracking-widest text-tinta/40 transition-colors hover:text-tinta"
          >
            {verCanceladas ? 'Ocultar' : 'Ver'} canceladas ({canceladas.length})
          </button>
          <AnimatePresence>
            {verCanceladas && (
              <m.ul
                className="mt-3 space-y-2 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_SUAVE }}
              >
                {canceladas.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-tinta/5 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate text-tinta/45 line-through">
                      {fmtHora(new Date(c.inicio))} · {c.cliente_nombre} · {c.servicio_nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEstado(c, 'pendiente', 'Cita recuperada')}
                      className="flex shrink-0 items-center gap-1 text-xs font-semibold text-acento-oscuro hover:underline"
                    >
                      <RotateCcw size={13} /> Recuperar
                    </button>
                  </li>
                ))}
              </m.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

function CitaCard({ cita, ahora, precios, onEstado }) {
  const ini = new Date(cita.inicio)
  const fin = new Date(cita.fin)
  const atendida = cita.estado === 'atendida'
  const enCurso = !atendida && ini <= ahora && ahora < fin
  const movil = (cita.cliente_movil || '').replace(/\s+/g, '')
  const precio = precios.get(cita.servicio_nombre)
  const nombre = cita.cliente_nombre.split(' ')[0]

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5 ${
        atendida ? 'border-green-200/80 bg-green-50/40' : enCurso ? 'border-acento ring-2 ring-acento/25' : 'border-hueso-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 font-display text-sm font-bold tabular-nums text-acento-oscuro sm:hidden">
            {fmtHora(ini)} – {fmtHora(fin)}
          </p>
          <p className={`truncate font-display text-lg font-bold sm:text-xl ${atendida ? 'text-tinta/55' : ''}`}>
            {cita.cliente_nombre}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-tinta/55">
            <span>{cita.servicio_nombre}</span>
            <span className="hidden items-center gap-1 sm:flex">
              <span className="text-tinta/25">·</span>
              <Clock size={13} /> {fmtHora(ini)}–{fmtHora(fin)}
            </span>
            {precio !== undefined && (
              <>
                <span className="text-tinta/25">·</span>
                <span className="font-semibold text-tinta/70">{formatoEuros(precio)} €</span>
              </>
            )}
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
            atendida
              ? 'bg-green-100 text-green-700'
              : enCurso
                ? 'bg-acento text-tinta'
                : 'bg-acento/15 text-acento-oscuro'
          }`}
        >
          {atendida ? <Check size={12} strokeWidth={3} /> : <span className={`h-1.5 w-1.5 rounded-full ${enCurso ? 'animate-pulse bg-tinta' : 'bg-acento-oscuro'}`} />}
          {atendida ? 'Atendido' : enCurso ? 'Ahora' : 'Pendiente'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {movil && (
          <>
            <a
              href={`tel:${movil}`}
              aria-label={`Llamar a ${nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-tinta/70 transition-colors hover:border-acento hover:text-acento-oscuro"
            >
              <Phone size={16} />
            </a>
            <a
              href={`https://wa.me/34${movil}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp a ${nombre}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-[#128C4B] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon size={16} />
            </a>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {atendida ? (
            <button
              type="button"
              onClick={() => onEstado(cita, 'pendiente', 'Vuelve a pendiente')}
              className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
            >
              <RotateCcw size={15} /> Deshacer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEstado(cita, 'cancelada', `Cita de ${nombre} cancelada`)}
                aria-label={`Cancelar la cita de ${nombre}`}
                title="Cancelar cita"
                className="flex h-10 w-10 items-center justify-center rounded-full text-tinta/35 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEstado(cita, 'atendida', `${nombre}, atendido`)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-sm shadow-green-600/25 transition-all hover:bg-green-700 active:scale-[0.97]"
              >
                <Check size={16} /> Atendido
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function BloqueoCard({ bloqueo, onQuitar }) {
  const ini = new Date(bloqueo.inicio)
  const fin = new Date(bloqueo.fin)
  const diaEntero = minutos(ini, fin) >= 24 * 60 - 1
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-tinta/10 bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,rgb(22_32_42/0.04)_8px,rgb(22_32_42/0.04)_16px)] px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tinta/10 text-tinta/60">
          <Ban size={16} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{bloqueo.motivo || 'Cerrado'}</p>
          <p className="text-sm text-tinta/50">{diaEntero ? 'Todo el día' : `${fmtHora(ini)} – ${fmtHora(fin)}`}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onQuitar(bloqueo)}
        className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-tinta/50 transition-colors hover:bg-tinta/5 hover:text-tinta"
      >
        Abrir
      </button>
    </div>
  )
}

function HuecoLibre({ hueco, onNueva }) {
  return (
    <button
      type="button"
      onClick={onNueva}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-tinta/15 px-4 py-3.5 text-left transition-all hover:border-acento hover:bg-acento/5 sm:px-5"
    >
      <span className="text-sm text-tinta/50">
        <span className="font-medium text-tinta/70">Libre</span> · {fmtHora(hueco.inicio)}–{fmtHora(hueco.fin)}
        <span className="hidden text-tinta/35 sm:inline"> · {duracionTexto(minutos(hueco.inicio, hueco.fin))}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-tinta/5 px-3 py-1.5 text-xs font-semibold text-tinta/60 transition-colors group-hover:bg-acento group-hover:text-tinta">
        <CalendarPlus size={14} /> Cita aquí
      </span>
    </button>
  )
}

// ─── Vista SEMANA ───────────────────────────────────────────

function VistaSemana({ inicio, citas, bloqueos, horario, ahora, onDia }) {
  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })

  return (
    <div className="grid gap-3 md:grid-cols-7 md:gap-2">
      {dias.map((d, i) => {
        const delDia = activas
          .filter((c) => mismoDia(new Date(c.inicio), d))
          .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
        const bloqueado = bloqueos.some((b) => new Date(b.inicio) < sumarMin(d, 24 * 60) && new Date(b.fin) > d)
        const cerrado = !horario.find((h) => h.dia === d.getDay())?.tramos?.length
        const { diaSemana, dia: num } = fechaCorta(d)
        const hoy = mismoDia(d, ahora)

        return (
          <m.button
            key={d.toISOString()}
            type="button"
            onClick={() => onDia(d)}
            className={`flex items-start gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-acento hover:shadow-md md:min-h-56 md:flex-col md:gap-3 md:p-3 ${
              hoy ? 'border-acento ring-2 ring-acento/20' : 'border-hueso-200'
            } ${cerrado && delDia.length === 0 ? 'opacity-50' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: EASE_SUAVE }}
          >
            <div className="w-10 shrink-0 text-center md:flex md:w-full md:items-baseline md:justify-between md:text-left">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-tinta/45">{diaSemana}</p>
              <p className="font-display text-2xl font-bold leading-tight">{num}</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 md:w-full md:flex-col md:flex-nowrap">
              {delDia.length === 0 && !bloqueado && (
                <p className="pt-1 text-sm text-tinta/35">{cerrado ? 'Cerrado' : 'Sin citas'}</p>
              )}
              {bloqueado && (
                <span className="rounded-lg bg-tinta/10 px-2 py-1 text-xs text-tinta/60">Cerrado un rato</span>
              )}
              {delDia.map((c) => (
                <span
                  key={c.id}
                  className={`truncate rounded-lg px-2 py-1 text-xs font-medium ${
                    c.estado === 'atendida' ? 'bg-green-100 text-green-800' : 'bg-acento/15 text-tinta'
                  }`}
                >
                  <span className="tabular-nums">{fmtHora(new Date(c.inicio))}</span> {c.cliente_nombre.split(' ')[0]}
                </span>
              ))}
            </div>
          </m.button>
        )
      })}
    </div>
  )
}

// ─── Botón flotante (móvil) ─────────────────────────────────

function BotonFlotante({ onCita, onBloquear }) {
  const [abierto, setAbierto] = useState(false)
  const opciones = [
    { texto: 'Día libre', Icono: Ban, accion: onBloquear },
    { texto: 'Nueva cita', Icono: CalendarDays, accion: onCita },
  ]

  return createPortal(
    <div className="md:hidden">
      <AnimatePresence>
        {abierto && (
          <m.div
            className="fixed inset-0 z-40 bg-tinta-900/40 backdrop-blur-[2px]"
            onClick={() => setAbierto(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {abierto &&
            opciones.map((o, i) => (
              <m.button
                key={o.texto}
                type="button"
                onClick={() => {
                  setAbierto(false)
                  o.accion()
                }}
                className="flex items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-semibold text-tinta shadow-xl"
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.25, delay: (opciones.length - 1 - i) * 0.05, ease: EASE_SUAVE }}
              >
                {o.texto}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tinta/5">
                  <o.Icono size={17} />
                </span>
              </m.button>
            ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar' : 'Añadir'}
          aria-expanded={abierto}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-acento text-tinta shadow-xl shadow-acento/40 transition-transform active:scale-90"
        >
          <Plus size={26} className={`transition-transform duration-300 ${abierto ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </div>,
    document.body
  )
}

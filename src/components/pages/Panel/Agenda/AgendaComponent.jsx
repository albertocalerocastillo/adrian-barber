// #region Imports
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import {
  ChevronLeft, ChevronRight, Plus, Ban, Phone, Check, X, CalendarDays,
  RotateCcw, Clock, Coffee, Moon, Wallet, Users, Hourglass, CalendarPlus,
  CalendarClock, ChevronDown, Search,
} from 'lucide-react'
import WhatsAppIconComponent from '../../../core/WhatsAppIcon/WhatsAppIconComponent'
import NewAppointmentDialogComponent from '../NewAppointmentDialog/NewAppointmentDialogComponent'
import BlockTimeDialogComponent from '../BlockTimeDialog/BlockTimeDialogComponent'
import RescheduleDialogComponent from '../RescheduleDialog/RescheduleDialogComponent'
import CustomerSearchDialogComponent from '../CustomerSearchDialog/CustomerSearchDialogComponent'
import MonthViewComponent from '../MonthView/MonthViewComponent'
import { useToast } from '../Toast/ToastContext'
import { SectionHeaderComponent, SegmentedControlComponent, SkeletonComponent } from '../Controls/ControlsComponent'
import { atTime, addMinutes, MINUTES_PER_DAY } from '../../../../utils/availability'
import {
  formatLongDate, formatShortDate, formatTime as fmtHora, startOfDay, startOfWeek, isSameDay, toInputDate,
} from '../../../../utils/dates'
import {
  listarCitas, listarBloqueos, cambiarEstado, borrarBloqueo, crearBloqueo, moverCita,
} from '../../../../services/AgendaService'
import { getHorario, getServicios } from '../../../../services/ConfigurationService'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { EstadoCitaEnum } from '../../../../services/enums/EstadoCitaEnum'
import { VistaAgendaEnum } from '../../../../services/enums/VistaAgendaEnum'
import { HojaAgendaEnum } from '../../../../services/enums/HojaAgendaEnum'
// #endregion

// #region Constantes
// Huecos más cortos que esto no se ofrecen como "libre" (no cabe un corte).
const HUECO_MINIMO = 30

const VISTAS = [
  { valor: VistaAgendaEnum.Dia, texto: 'Día' },
  { valor: VistaAgendaEnum.Semana, texto: 'Semana' },
  { valor: VistaAgendaEnum.Mes, texto: 'Mes' },
]
// #endregion

// #region Agenda
/**
 * Agenda del barbero.
 *  - Arriba, el resumen del día (citas, atendidas, pendientes, caja prevista)
 *    y, si es hoy, la SIGUIENTE cita bien grande con sus botones.
 *  - Una tira con los 7 días de la semana (con puntitos de cuántas citas hay)
 *    para saltar de un día a otro de un toque.
 *  - Vista DÍA: línea de tiempo con las citas, los ratos cerrados y los
 *    HUECOS LIBRES (con botón para meter una cita justo ahí).
 *  - Vista SEMANA: los 7 días de un vistazo.
 *  - Vista MES: el mes entero, con lo lleno que va cada día.
 *  - Tocando la fecha de arriba se salta a cualquier día; la lupa busca a un
 *    cliente; y cada cita se puede cambiar de hora (con WhatsApp ya escrito
 *    para avisarle).
 *
 * Marcar atendida o cancelar se hace al momento y se puede deshacer desde el
 * aviso de abajo, en vez de preguntar "¿seguro?" cada vez.
 */
const AgendaComponent = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useToast()
  const [vista, setVista] = useState(VistaAgendaEnum.Dia)
  const [dia, setDia] = useState(() => startOfDay(new Date()))
  // Citas y bloqueos de las semanas cargadas: { citas, bloqueos }.
  const [datos, setDatos] = useState(null)
  const [horario, setHorario] = useState(null)
  const [servicios, setServicios] = useState([])
  const [tick, setTick] = useState(0)
  // Hoja abierta: { tipo: HojaAgendaEnum, hora?, cita? }.
  const [modal, setModal] = useState(null)
  const [ahora, setAhora] = useState(() => new Date())

  // El reloj avanza cada minuto ("en curso", "en 20 min").
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const [h, s] = await Promise.all([getHorario(), getServicios()])
      if (!vivo) return
      setHorario(h)
      setServicios(s)
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  // Se cargan las 6 semanas que pinta el MES del día elegido: con eso salen
  // la tira de días y las vistas día, semana y mes sin pedir nada más al
  // moverse dentro del mes.
  const semana = startOfWeek(dia).getTime()
  const desdeCarga = startOfWeek(new Date(dia.getFullYear(), dia.getMonth(), 1)).getTime()
  useEffect(() => {
    const desde = new Date(desdeCarga)
    const hasta = addMinutes(desde, 42 * MINUTES_PER_DAY)
    let vivo = true
    const cargar = async () => {
      const [citas, bloqueos] = await Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)])
      if (vivo) setDatos({ citas, bloqueos })
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [desdeCarga, tick])

  const recargar = () => setTick((t) => t + 1)
  const esHoy = isSameDay(dia, ahora)

  const precios = useMemo(() => new Map(servicios.map((s) => [s.nombre, Number(s.precio) || 0])), [servicios])

  const delDia = useMemo(() => {
    if (!datos) return null
    const citas = datos.citas.filter((c) => isSameDay(new Date(c.inicio), dia))
    const bloqueos = datos.bloqueos.filter((b) => new Date(b.inicio) < addMinutes(dia, MINUTES_PER_DAY) && new Date(b.fin) > dia)
    return { citas, bloqueos }
  }, [datos, dia])

  // #endregion

  // #region Acciones (se aplican al momento y se pueden deshacer)
  const fijarEstadoLocal = (id, estado) =>
    setDatos((d) => d && { ...d, citas: d.citas.map((c) => (c.id === id ? { ...c, estado } : c)) })

  const cambiar = async (cita, estado, texto) => {
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

  const quitarBloqueo = async (b) => {
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

  const onMovida = async (cita, inicioAnterior, finAnterior) => {
    recargar()
    avisar({
      texto: `Cita de ${cita.cliente_nombre.split(' ')[0]} cambiada`,
      deshacer: async () => {
        await moverCita(cita.id, inicioAnterior, finAnterior)
        recargar()
      },
    })
  }

  // Las flechas mueven una semana, o un mes en la vista mes (al día 1, o a
  // hoy si es el mes en curso).
  const mover = (signo) => {
    if (vista !== VistaAgendaEnum.Mes) return setDia((d) => addMinutes(d, signo * 7 * MINUTES_PER_DAY))
    setDia((d) => {
      const primero = new Date(d.getFullYear(), d.getMonth() + signo, 1)
      return primero.getMonth() === ahora.getMonth() && primero.getFullYear() === ahora.getFullYear()
        ? startOfDay(ahora)
        : primero
    })
  }

  const irA = (d) => {
    setDia(startOfDay(d))
    setVista(VistaAgendaEnum.Dia)
  }
  // #endregion

  // #region Renderizado
  return (
    <>
      <SectionHeaderComponent
        kicker={saludo(ahora)}
        titulo={esHoy ? 'Hoy' : capital(formatLongDate(dia))}
        ayuda={esHoy ? capital(formatLongDate(dia)) : 'Toca una cita para llamar o escribir al cliente.'}
      >
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => setModal({ tipo: HojaAgendaEnum.Bloquear })}
            className="flex items-center gap-2 rounded-full border border-tinta/15 bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-tinta hover:bg-tinta hover:text-hueso active:scale-[0.98]"
          >
            <Ban size={17} /> Día libre
          </button>
          <button
            type="button"
            onClick={() => setModal({ tipo: HojaAgendaEnum.Cita })}
            className="flex items-center gap-2 rounded-full bg-acento px-5 py-3 text-sm font-semibold text-tinta shadow-lg shadow-acento/25 transition-all hover:bg-acento-claro active:scale-[0.98]"
          >
            <Plus size={18} /> Nueva cita
          </button>
        </div>
      </SectionHeaderComponent>

      {/* Resumen del día. */}
      {delDia ? (
        <Resumen citas={delDia.citas} precios={precios} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-tinta/[0.06]" />
          ))}
        </div>
      )}

      {/* La siguiente cita, bien a la vista (solo hoy). */}
      {esHoy && delDia && <Siguiente citas={delDia.citas} ahora={ahora} precios={precios} onEstado={cambiar} />}

      {/* Semana: navegación + tira de días. */}
      <div className="mb-6 rounded-3xl border border-hueso-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1">
            <BotonRedondo onClick={() => mover(-1)} etiqueta={vista === VistaAgendaEnum.Mes ? 'Mes anterior' : 'Semana anterior'}>
              <ChevronLeft size={18} />
            </BotonRedondo>
            <BotonRedondo onClick={() => mover(1)} etiqueta={vista === VistaAgendaEnum.Mes ? 'Mes siguiente' : 'Semana siguiente'}>
              <ChevronRight size={18} />
            </BotonRedondo>
            {/* Tocar la fecha abre el calendario del móvil para saltar a cualquier día. */}
            <label className="relative ml-0.5 flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 transition-colors hover:bg-tinta/5">
              <span className="font-display text-base font-bold sm:text-lg">
                {vista === VistaAgendaEnum.Mes ? (
                  <>
                    <span className="sm:hidden">{rotuloMes(dia, 'short')}</span>
                    <span className="hidden sm:inline">{rotuloMes(dia)}</span>
                  </>
                ) : (
                  rotuloSemana(new Date(semana))
                )}
              </span>
              <ChevronDown size={15} className="text-tinta/45" />
              <input
                type="date"
                value={toInputDate(dia)}
                onChange={(e) => e.target.value && setDia(new Date(`${e.target.value}T00:00:00`))}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.()
                  } catch {
                    // Algunos navegadores no lo dejan; entonces abre el suyo al tocar.
                  }
                }}
                aria-label="Ir a una fecha"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!esHoy && (
              <button
                type="button"
                onClick={() => setDia(startOfDay(new Date()))}
                className="rounded-full bg-acento/15 px-3 py-1.5 text-xs font-semibold text-acento-oscuro transition-colors hover:bg-acento hover:text-tinta"
              >
                Hoy
              </button>
            )}
            <button
              type="button"
              onClick={() => setModal({ tipo: HojaAgendaEnum.Buscar })}
              aria-label="Buscar cliente"
              className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-tinta/60 transition-colors hover:bg-tinta/5 hover:text-tinta"
            >
              <Search size={17} />
              <span className="hidden lg:inline">Buscar</span>
            </button>
            <div className="hidden sm:block">
              <SegmentedControlComponent
                opciones={VISTAS}
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
            setVista(VistaAgendaEnum.Dia)
          }}
        />

        <div className="mt-3 flex justify-center sm:hidden">
          <SegmentedControlComponent
            opciones={VISTAS}
            valor={vista}
            onCambio={setVista}
          />
        </div>
      </div>

      {/* Contenido. */}
      {!delDia || !horario ? (
        <SkeletonComponent filas={4} alto="h-20" />
      ) : (
        <AnimatePresence mode="wait">
          <m.div
            key={`${vista}-${dia.getTime()}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
          >
            {vista === VistaAgendaEnum.Mes ? (
              <MonthViewComponent
                mes={dia}
                dia={dia}
                ahora={ahora}
                citas={datos.citas}
                bloqueos={datos.bloqueos}
                horario={horario}
                onDia={irA}
              />
            ) : vista === VistaAgendaEnum.Semana ? (
              <VistaSemana
                inicio={new Date(semana)}
                citas={datos.citas}
                bloqueos={datos.bloqueos}
                horario={horario}
                ahora={ahora}
                onDia={irA}
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
                onMover={(cita) => setModal({ tipo: HojaAgendaEnum.Mover, cita })}
                onQuitarBloqueo={quitarBloqueo}
                onNuevaEn={(hora) => setModal({ tipo: HojaAgendaEnum.Cita, hora })}
              />
            )}
          </m.div>
        </AnimatePresence>
      )}

      {/* Botón flotante (móvil): nueva cita o día libre. Solo con la agenda a
          la vista: va en un portal y no se esconde con la pantalla. */}
      {activa && (
        <BotonFlotante
          onCita={() => setModal({ tipo: HojaAgendaEnum.Cita })}
          onBloquear={() => setModal({ tipo: HojaAgendaEnum.Bloquear })}
        />
      )}

      <AnimatePresence>
        {modal?.tipo === HojaAgendaEnum.Cita && (
          <NewAppointmentDialogComponent
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
        {modal?.tipo === HojaAgendaEnum.Mover && (
          <RescheduleDialogComponent key="mover" cita={modal.cita} onClose={() => setModal(null)} onMovida={onMovida} />
        )}
        {modal?.tipo === HojaAgendaEnum.Buscar && (
          <CustomerSearchDialogComponent
            key="buscar"
            onClose={() => setModal(null)}
            onIrA={(d) => {
              setModal(null)
              irA(d)
            }}
          />
        )}
        {modal?.tipo === HojaAgendaEnum.Bloquear && (
          <BlockTimeDialogComponent
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
  // #endregion
}
// #endregion

// #region Utilidades
const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1)

const saludo = (d) => {
  const h = d.getHours()
  return h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'
}

/** "Noviembre 2026" (o "Nov 2026" con `mes: 'short'`, para el móvil). */
const rotuloMes = (d, mes = 'long') => {
  const nombre = new Intl.DateTimeFormat('es-ES', { month: mes }).format(d).replace('.', '')
  return `${capital(nombre)} ${d.getFullYear()}`
}

const rotuloSemana = (inicio) => {
  const fin = new Date(inicio)
  fin.setDate(inicio.getDate() + 6)
  const a = formatShortDate(inicio)
  const b = formatShortDate(fin)
  return a.mes === b.mes ? `${a.dia} – ${b.dia} ${b.mes}` : `${a.dia} ${a.mes} – ${b.dia} ${b.mes}`
}

const minutos = (a, b) => Math.round((b - a) / 60000)

const duracionTexto = (min) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

const cuandoTexto = (inicio, ahora) => {
  const min = minutos(ahora, inicio)
  if (min <= 0) return 'Ahora'
  if (min < 60) return `En ${min} min`
  return `A las ${fmtHora(inicio)}`
}

/** Tramos de trabajo del día menos citas y bloqueos = huecos libres. */
const huecosLibres = (dia, horario, ocupados, ahora) => {
  const def = horario.find((h) => h.dia === dia.getDay())
  if (!def?.tramos?.length) return []
  const ocup = ocupados
    .map((o) => ({ ini: new Date(o.inicio), fin: new Date(o.fin) }))
    .sort((a, b) => a.ini - b.ini)

  // Hoy, lo que ya ha pasado no cuenta como libre (redondeado al cuarto).
  let desdeAhora = null
  if (isSameDay(dia, ahora)) {
    desdeAhora = new Date(ahora)
    desdeAhora.setMinutes(Math.ceil(ahora.getMinutes() / 15) * 15, 0, 0)
  }

  const result = []
  for (const [a, b] of def.tramos) {
    let cursor = atTime(dia, a)
    const finTramo = atTime(dia, b)
    if (desdeAhora && desdeAhora > cursor) cursor = desdeAhora
    for (const o of ocup) {
      if (o.fin <= cursor || o.ini >= finTramo) continue
      if (o.ini > cursor && minutos(cursor, o.ini) >= HUECO_MINIMO) result.push({ inicio: cursor, fin: o.ini })
      if (o.fin > cursor) cursor = o.fin
    }
    if (minutos(cursor, finTramo) >= HUECO_MINIMO) result.push({ inicio: cursor, fin: finTramo })
  }
  return result
}

const BotonRedondo = ({ onClick, etiqueta, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-tinta/60 transition-colors hover:bg-tinta/5 hover:text-tinta active:scale-90"
    >
      {children}
    </button>
  )
}
// #endregion

// #region Resumen
const Resumen = ({ citas, precios }) => {
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const atendidas = activas.filter((c) => c.estado === EstadoCitaEnum.Atendida).length
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
          transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_SMOOTH }}
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
                transition={{ duration: 0.8, ease: EASE_SMOOTH }}
              />
            </div>
          )}
        </m.div>
      ))}
    </div>
  )
}

const formatoEuros = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','))
// #endregion

// #region Siguiente cita
const Siguiente = ({ citas, ahora, precios, onEstado }) => {
  const siguiente = citas
    .filter((c) => c.estado === EstadoCitaEnum.Pendiente && new Date(c.fin) > ahora)
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
      transition={{ duration: 0.5, ease: EASE_SMOOTH }}
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
                <WhatsAppIconComponent size={20} />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => onEstado(siguiente, EstadoCitaEnum.Atendida, `${siguiente.cliente_nombre.split(' ')[0]}, atendido`)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-acento px-6 font-semibold text-tinta transition-all hover:bg-acento-claro active:scale-[0.97] sm:flex-none"
          >
            <Check size={18} /> Atendido
          </button>
        </div>
      </div>
    </m.section>
  )
}
// #endregion

// #region Tira de días
const TiraDias = ({ inicio, dia, ahora, citas, horario, onElegir }) => {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const result = new Date(inicio)
    result.setDate(inicio.getDate() + i)
    return result
  })

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {dias.map((d) => {
        const n = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada && isSameDay(new Date(c.inicio), d)).length
        const elegido = isSameDay(d, dia)
        const hoy = isSameDay(d, ahora)
        const cerrado = horario && !horario.find((h) => h.dia === d.getDay())?.tramos?.length
        const { diaSemana, dia: num } = formatShortDate(d)
        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onElegir(d)}
            aria-pressed={elegido}
            aria-label={`${capital(formatLongDate(d))}, ${n} citas`}
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
            {/* Un puntito por cita (máx. 4). */}
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
// #endregion

// #region Vista día
const VistaDia = ({ dia, ahora, horario, citas, bloqueos, precios, onEstado, onMover, onQuitarBloqueo, onNuevaEn }) => {
  const [verCanceladas, setVerCanceladas] = useState(false)
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const canceladas = citas.filter((c) => c.estado === EstadoCitaEnum.Cancelada)
  const abierto = !!horario.find((h) => h.dia === dia.getDay())?.tramos?.length
  const pasado = startOfDay(dia) < startOfDay(ahora)

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
        {/* Hilo vertical de la línea de tiempo. */}
        <span aria-hidden="true" className="absolute bottom-3 left-[4.25rem] top-3 hidden w-px bg-hueso-200 sm:block" />

        {elementos.map((e, i) => (
          <m.li
            key={`${e.tipo}-${e.dato.id ?? e.inicio.getTime()}`}
            className="relative flex gap-3 sm:gap-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE_SMOOTH }}
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
                    : e.dato.estado === EstadoCitaEnum.Atendida
                      ? 'bg-green-500'
                      : 'bg-acento'
              }`}
            />
            <div className="min-w-0 flex-1">
              {e.tipo === 'cita' && <CitaCard cita={e.dato} ahora={ahora} precios={precios} onEstado={onEstado} onMover={onMover} />}
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
                transition={{ duration: 0.35, ease: EASE_SMOOTH }}
              >
                {canceladas.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-tinta/5 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate text-tinta/45 line-through">
                      {fmtHora(new Date(c.inicio))} · {c.cliente_nombre} · {c.servicio_nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEstado(c, EstadoCitaEnum.Pendiente, 'Cita recuperada')}
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

const CitaCard = ({ cita, ahora, precios, onEstado, onMover }) => {
  const ini = new Date(cita.inicio)
  const fin = new Date(cita.fin)
  const atendida = cita.estado === EstadoCitaEnum.Atendida
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
          <p className={`flex items-center gap-2 font-display text-lg font-bold sm:text-xl ${atendida ? 'text-tinta/55' : ''}`}>
            <span className="truncate">{cita.cliente_nombre}</span>
            {/* Reservada por el cliente desde la web (no metida a mano). */}
            {cita.origen === 'web' && (
              <span title="Reservada desde la web" className="shrink-0 rounded-full bg-tinta px-2 py-0.5 font-body text-[0.6rem] font-semibold uppercase tracking-wider text-acento">
                Web
              </span>
            )}
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
              <WhatsAppIconComponent size={16} />
            </a>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {atendida ? (
            <button
              type="button"
              onClick={() => onEstado(cita, EstadoCitaEnum.Pendiente, 'Vuelve a pendiente')}
              className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
            >
              <RotateCcw size={15} /> Deshacer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onMover(cita)}
                aria-label={`Cambiar la hora de ${nombre}`}
                title="Cambiar día u hora"
                className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
              >
                <CalendarClock size={17} />
                <span className="hidden min-[400px]:inline">Cambiar</span>
              </button>
              <button
                type="button"
                onClick={() => onEstado(cita, EstadoCitaEnum.Cancelada, `Cita de ${nombre} cancelada`)}
                aria-label={`Cancelar la cita de ${nombre}`}
                title="Cancelar cita"
                className="flex h-10 w-10 items-center justify-center rounded-full text-tinta/35 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEstado(cita, EstadoCitaEnum.Atendida, `${nombre}, atendido`)}
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

const BloqueoCard = ({ bloqueo, onQuitar }) => {
  const ini = new Date(bloqueo.inicio)
  const fin = new Date(bloqueo.fin)
  const diaEntero = minutos(ini, fin) >= MINUTES_PER_DAY - 1
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

const HuecoLibre = ({ hueco, onNueva }) => {
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
// #endregion

// #region Vista semana
const VistaSemana = ({ inicio, citas, bloqueos, horario, ahora, onDia }) => {
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const result = new Date(inicio)
    result.setDate(inicio.getDate() + i)
    return result
  })

  return (
    <div className="grid gap-3 md:grid-cols-7 md:gap-2">
      {dias.map((d, i) => {
        const delDia = activas
          .filter((c) => isSameDay(new Date(c.inicio), d))
          .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
        const bloqueado = bloqueos.some((b) => new Date(b.inicio) < addMinutes(d, MINUTES_PER_DAY) && new Date(b.fin) > d)
        const cerrado = !horario.find((h) => h.dia === d.getDay())?.tramos?.length
        const { diaSemana, dia: num } = formatShortDate(d)
        const hoy = isSameDay(d, ahora)

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
            transition={{ duration: 0.4, delay: i * 0.04, ease: EASE_SMOOTH }}
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
                    c.estado === EstadoCitaEnum.Atendida ? 'bg-green-100 text-green-800' : 'bg-acento/15 text-tinta'
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
// #endregion

// #region Botón flotante (móvil)
const BotonFlotante = ({ onCita, onBloquear }) => {
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
                transition={{ duration: 0.25, delay: (opciones.length - 1 - i) * 0.05, ease: EASE_SMOOTH }}
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
// #endregion

export default AgendaComponent

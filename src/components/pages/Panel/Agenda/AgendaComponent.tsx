// #region Imports
import { useState, useEffect, useMemo } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ChevronLeft, ChevronRight, Plus, Ban, ChevronDown, Search } from 'lucide-react'
import NewAppointmentDialogComponent from '../NewAppointmentDialog/NewAppointmentDialogComponent'
import BlockTimeDialogComponent from '../BlockTimeDialog/BlockTimeDialogComponent'
import RescheduleDialogComponent from '../RescheduleDialog/RescheduleDialogComponent'
import CustomerSearchDialogComponent from '../CustomerSearchDialog/CustomerSearchDialogComponent'
import CancelDialogComponent from '../CancelDialog/CancelDialogComponent'
import MonthViewComponent from '../MonthView/MonthViewComponent'
import { useToast } from '../Toast/ToastContext'
import SectionHeaderComponent from '../Controls/SectionHeader/SectionHeaderComponent'
import SegmentedControlComponent from '../Controls/SegmentedControl/SegmentedControlComponent'
import type { ISegmentedControlOption } from '../Controls/SegmentedControl/ISegmentedControlProps'
import SkeletonComponent from '../Controls/Skeleton/SkeletonComponent'
import RoundButtonComponent from './RoundButton/RoundButtonComponent'
import SummaryComponent from './Summary/SummaryComponent'
import NextAppointmentComponent from './NextAppointment/NextAppointmentComponent'
import DayStripComponent from './DayStrip/DayStripComponent'
import DayViewComponent from './DayView/DayViewComponent'
import WeekViewComponent from './WeekView/WeekViewComponent'
import UpcomingViewComponent from './UpcomingView/UpcomingViewComponent'
import FloatingAddButtonComponent from './FloatingAddButton/FloatingAddButtonComponent'
import { addMinutes, MINUTES_PER_DAY } from '../../../../utils/availability'
import { formatLongDate, startOfDay, startOfWeek, isSameDay, toInputDate } from '../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ToastTypeEnum } from '../../../../services/enums/ToastTypeEnum'
import { EstadoCitaEnum } from '../../../../services/enums/EstadoCitaEnum'
import { VistaAgendaEnum } from '../../../../services/enums/VistaAgendaEnum'
import { HojaAgendaEnum } from '../../../../services/enums/HojaAgendaEnum'
import { AgendaService } from '../../../../services/AgendaService'
import { ConfigurationService } from '../../../../services/ConfigurationService'
import type { CitaDTO } from '../../../../services/dtos/CitaDTO'
import type { BloqueoDTO } from '../../../../services/dtos/BloqueoDTO'
import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'
import { bloqueoEnDia, capital, DIAS_SEMANA, rotuloMes, rotuloSemana, saludo } from './agendaUtils'
import type { IAgendaProps } from './IAgendaProps'
// #endregion

// #region Constantes
// Vistas que se eligen en el selector de la agenda.
const VISTAS: ISegmentedControlOption[] = [
  { value: VistaAgendaEnum.Dia, text: 'Día' },
  { value: VistaAgendaEnum.Semana, text: 'Semana' },
  { value: VistaAgendaEnum.Mes, text: 'Mes' },
  { value: VistaAgendaEnum.Proximas, text: 'Próximas' },
]

// Cada cuánto avanza el reloj de la agenda, en milisegundos (un minuto).
const INTERVALO_RELOJ_MS = 60_000

// Semanas que se cargan de una vez: las 6 que pinta la vista mes.
const SEMANAS_CARGADAS = 6

// Si deshacer no se puede guardar.
const ERROR_DESHACER = 'No se pudo deshacer. Revisa la conexión.'

// Placeholders del resumen mientras carga.
const TARJETAS_RESUMEN = 4

// Bloques del esqueleto del contenido mientras carga.
const FILAS_ESQUELETO = 4

// Parámetro de la URL con el día que abre la agenda (/admin?dia=2027-01-15), el
// que trae el enlace del aviso de WhatsApp.
const PARAMETRO_DIA = 'dia'
const PATRON_DIA = /^\d{4}-\d{2}-\d{2}$/
// #endregion

/** Día pedido en la URL (?dia=AAAA-MM-DD), o hoy si no hay ninguno válido. */
const diaInicial = (): Date => {
  const pedido = new URLSearchParams(window.location.search).get(PARAMETRO_DIA)
  const fecha = pedido && PATRON_DIA.test(pedido) ? new Date(`${pedido}T00:00:00`) : null
  const result = fecha && !Number.isNaN(fecha.getTime()) ? fecha : startOfDay(new Date())
  return result
}

/** Citas y bloqueos de las semanas cargadas. */
interface DatosAgenda {
  /** Citas de las semanas cargadas. */
  citas: CitaDTO[];
  /** Ratos cerrados de las semanas cargadas. */
  bloqueos: BloqueoDTO[];
}

/** Hoja (ventana) abierta desde la agenda. */
interface HojaAbierta {
  /** Qué hoja está abierta. */
  tipo: HojaAgendaEnum;
  /** Hora ("HH:MM") con la que se abre la nueva cita, si se toca un hueco. */
  hora?: string;
  /** Cita que se cambia de hora. */
  cita?: CitaDTO;
}

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
const AgendaComponent: FunctionComponent<IAgendaProps> = ({ activa = true }) => {
  // #region Declaraciones, variables y hooks
  const avisar = useToast()
  const [vista, setVista] = useState<VistaAgendaEnum>(VistaAgendaEnum.Dia)
  const [dia, setDia] = useState<Date>(diaInicial)
  const [datos, setDatos] = useState<DatosAgenda | null>(null)
  const [horario, setHorario] = useState<HorarioDiaDTO[] | null>(null)
  const [servicios, setServicios] = useState<ServicioDTO[]>([])
  const [tick, setTick] = useState<number>(0)
  const [modal, setModal] = useState<HojaAbierta | null>(null)
  const [ahora, setAhora] = useState<Date>(() => new Date())
  // La agenda no se ha podido leer (sin conexión): se dice, en vez de enseñar el día vacío.
  const [errorCarga, setErrorCarga] = useState<boolean>(false)

  // Una vez leído el día de la URL se quita, para que al recargar se vuelva a hoy.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(PARAMETRO_DIA)) return
    url.searchParams.delete(PARAMETRO_DIA)
    window.history.replaceState(window.history.state, '', url)
  }, [])

  // El reloj avanza cada minuto ("en curso", "en 20 min").
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), INTERVALO_RELOJ_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const [h, s] = await Promise.all([ConfigurationService.getHorario(), ConfigurationService.getServicios()])
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
    const hasta = addMinutes(desde, SEMANAS_CARGADAS * DIAS_SEMANA * MINUTES_PER_DAY)
    let vivo = true
    const cargar = async () => {
      try {
        const [citas, bloqueos] = await Promise.all([AgendaService.listarCitas(desde, hasta), AgendaService.listarBloqueos(desde, hasta)])
        if (!vivo) return
        setErrorCarga(false)
        setDatos({ citas, bloqueos })
      } catch {
        if (vivo) setErrorCarga(true)
      }
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [desdeCarga, tick])

  const recargar = () => setTick((t) => t + 1)
  const esHoy = isSameDay(dia, ahora)

  const precios = useMemo(() => new Map(servicios.map((s) => [s.nombre, Number(s.precio) || 0])), [servicios])

  const delDia = useMemo<DatosAgenda | null>(() => {
    if (!datos) return null
    const citas = datos.citas.filter((c) => isSameDay(new Date(c.inicio), dia))
    const bloqueos = datos.bloqueos.filter((b) => bloqueoEnDia(b, dia))
    const result = { citas, bloqueos }
    return result
  }, [datos, dia])
  // #endregion

  // #region Acciones (se aplican al momento y se pueden deshacer)
  const fijarEstadoLocal = (id: CitaDTO['id'], estado: EstadoCitaEnum) =>
    setDatos((d) => d && { ...d, citas: d.citas.map((c) => (c.id === id ? { ...c, estado } : c)) })

  const cambiar = async (cita: CitaDTO, estado: EstadoCitaEnum, texto: string) => {
    const anterior = cita.estado
    fijarEstadoLocal(cita.id, estado)
    const res = await AgendaService.cambiarEstado(cita.id, estado)
    if (!res.ok) {
      fijarEstadoLocal(cita.id, anterior)
      avisar({ text: 'No se pudo guardar. Revisa la conexión.', type: ToastTypeEnum.Error })
      return
    }
    avisar({
      text: texto,
      onUndo: async () => {
        fijarEstadoLocal(cita.id, anterior)
        const deshecho = await AgendaService.cambiarEstado(cita.id, anterior)
        if (deshecho.ok) return
        // P. ej. una cita cancelada cuyo hueco ya tiene otra: la pantalla vuelve a decir la verdad.
        fijarEstadoLocal(cita.id, estado)
        avisar({ text: deshecho.error ?? ERROR_DESHACER, type: ToastTypeEnum.Error })
      },
    })
  }

  // Cancelar pasa antes por una hoja que ofrece avisar al cliente por WhatsApp.
  const pedirEstado = (cita: CitaDTO, estado: EstadoCitaEnum, texto: string) => {
    if (estado === EstadoCitaEnum.Cancelada) setModal({ tipo: HojaAgendaEnum.Cancelar, cita })
    else cambiar(cita, estado, texto)
  }

  const quitarBloqueo = async (b: BloqueoDTO) => {
    const res = await AgendaService.borrarBloqueo(b.id)
    if (!res.ok) {
      avisar({ text: 'No se pudo quitar.', type: ToastTypeEnum.Error })
      return
    }
    recargar()
    avisar({
      text: 'Vuelve a estar abierto',
      onUndo: async () => {
        const deshecho = await AgendaService.crearBloqueo({ inicio: new Date(b.inicio), fin: new Date(b.fin), motivo: b.motivo })
        recargar()
        if (!deshecho.ok) avisar({ text: deshecho.error ?? ERROR_DESHACER, type: ToastTypeEnum.Error })
      },
    })
  }

  const onMovida = async (cita: CitaDTO, inicioAnterior: Date, finAnterior: Date) => {
    recargar()
    avisar({
      text: `Cita de ${cita.clienteNombre.split(' ')[0]} cambiada`,
      onUndo: async () => {
        const deshecho = await AgendaService.moverCita(cita.id, inicioAnterior, finAnterior)
        recargar()
        if (!deshecho.ok) avisar({ text: deshecho.error ?? ERROR_DESHACER, type: ToastTypeEnum.Error })
      },
    })
  }

  // Las flechas mueven una semana, o un mes en la vista mes (al día 1, o a
  // hoy si es el mes en curso).
  const mover = (signo: number) => {
    if (vista !== VistaAgendaEnum.Mes) {
      setDia((d) => addMinutes(d, signo * DIAS_SEMANA * MINUTES_PER_DAY))
      return
    }
    setDia((d) => {
      const primero = new Date(d.getFullYear(), d.getMonth() + signo, 1)
      const result = primero.getMonth() === ahora.getMonth() && primero.getFullYear() === ahora.getFullYear()
        ? startOfDay(ahora)
        : primero
      return result
    })
  }

  const irA = (d: Date) => {
    setDia(startOfDay(d))
    setVista(VistaAgendaEnum.Dia)
  }
  // #endregion

  // #region Renderizado
  return (
    <>
      <SectionHeaderComponent
        kicker={saludo(ahora)}
        title={esHoy ? 'Hoy' : capital(formatLongDate(dia))}
        help={esHoy ? capital(formatLongDate(dia)) : 'Toca una cita para llamar o escribir al cliente.'}
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
        <SummaryComponent citas={delDia.citas} precios={precios} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: TARJETAS_RESUMEN }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-tinta/[0.06]" />
          ))}
        </div>
      )}

      {/* La siguiente cita, bien a la vista (solo hoy). */}
      {esHoy && delDia && <NextAppointmentComponent citas={delDia.citas} ahora={ahora} precios={precios} onEstado={cambiar} />}

      {/* Semana: navegación + tira de días. */}
      <div className="mb-6 rounded-3xl border border-hueso-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          {vista === VistaAgendaEnum.Proximas ? (
            <span className="px-1 font-display text-base font-bold sm:text-lg">De hoy en adelante</span>
          ) : (
          <div className="flex items-center gap-1">
            <RoundButtonComponent onClick={() => mover(-1)} label={vista === VistaAgendaEnum.Mes ? 'Mes anterior' : 'Semana anterior'}>
              <ChevronLeft size={18} />
            </RoundButtonComponent>
            <RoundButtonComponent onClick={() => mover(1)} label={vista === VistaAgendaEnum.Mes ? 'Mes siguiente' : 'Semana siguiente'}>
              <ChevronRight size={18} />
            </RoundButtonComponent>
            {/* Tocar la fecha abre el calendario del móvil para saltar a cualquier día. */}
            <label className="relative ml-0.5 flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 transition-colors hover:bg-tinta/5">
              <span className="font-display text-base font-bold sm:text-lg">
                {vista === VistaAgendaEnum.Mes ? (
                  <>
                    <span className="sm:hidden">{rotuloMes(dia, true)}</span>
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
          )}
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
                options={VISTAS}
                value={vista}
                onChange={(v) => setVista(v as VistaAgendaEnum)}
              />
            </div>
          </div>
        </div>

        {vista !== VistaAgendaEnum.Proximas && (
        <DayStripComponent
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
        )}

        <div className="mt-3 flex justify-center sm:hidden">
          <SegmentedControlComponent
            options={VISTAS}
            value={vista}
            onChange={(v) => setVista(v as VistaAgendaEnum)}
          />
        </div>
      </div>

      {/* Contenido. */}
      {errorCarga ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-3xl bg-red-50 p-8 text-center text-sm text-red-800">
          No se pudo cargar la agenda. Revisa la conexión.
          <button
            type="button"
            onClick={recargar}
            className="rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      ) : vista === VistaAgendaEnum.Proximas ? (
        <UpcomingViewComponent ahora={ahora} recarga={tick} onDia={irA} />
      ) : !datos || !delDia || !horario ? (
        <SkeletonComponent rows={FILAS_ESQUELETO} height="h-20" />
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
              <WeekViewComponent
                inicio={new Date(semana)}
                citas={datos.citas}
                bloqueos={datos.bloqueos}
                horario={horario}
                ahora={ahora}
                onDia={irA}
              />
            ) : (
              <DayViewComponent
                dia={dia}
                ahora={ahora}
                horario={horario}
                citas={delDia.citas}
                bloqueos={delDia.bloqueos}
                precios={precios}
                onEstado={pedirEstado}
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
        <FloatingAddButtonComponent
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
            onCreada={(texto: string) => {
              recargar()
              avisar({ text: texto })
            }}
          />
        )}
        {modal?.tipo === HojaAgendaEnum.Mover && modal.cita && (
          <RescheduleDialogComponent key="mover" cita={modal.cita} onClose={() => setModal(null)} onMovida={onMovida} />
        )}
        {modal?.tipo === HojaAgendaEnum.Cancelar && modal.cita && (
          <CancelDialogComponent
            key="cancelar"
            cita={modal.cita}
            onClose={() => setModal(null)}
            onCancelar={() => modal.cita && cambiar(modal.cita, EstadoCitaEnum.Cancelada, `Cita de ${modal.cita.clienteNombre.split(' ')[0]} cancelada`)}
          />
        )}
        {modal?.tipo === HojaAgendaEnum.Buscar && (
          <CustomerSearchDialogComponent
            key="buscar"
            onClose={() => setModal(null)}
            onIrA={(d: Date) => {
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
            onCreado={(texto: string) => {
              recargar()
              avisar({ text: texto })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
  // #endregion
}

export default AgendaComponent

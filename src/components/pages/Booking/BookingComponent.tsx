// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { NavigateOptions } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, CalendarClock } from 'lucide-react'
import BrandLogoComponent from '../../core/BrandLogo/BrandLogoComponent'
import WhatsAppIconComponent from '../../core/WhatsAppIcon/WhatsAppIconComponent'
import ServiceStepComponent from './ServiceStep/ServiceStepComponent'
import DateStepComponent from './DateStep/DateStepComponent'
import TimeStepComponent from './TimeStep/TimeStepComponent'
import DetailsStepComponent from './DetailsStep/DetailsStepComponent'
import ConfirmationComponent from './Confirmation/ConfirmationComponent'
import StepIndicatorComponent from './StepIndicator/StepIndicatorComponent'
import BookingSummaryComponent from './BookingSummary/BookingSummaryComponent'
import { reservaEmpezada, inicioReservas } from '../../../data/features'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contact'
import { EASE_SMOOTH } from '../../../theme/animation'
import { ConfigurationService } from '../../../services/ConfigurationService'
import { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'
import { PasoReservaEnum } from '../../../services/enums/PasoReservaEnum'
import type { HorarioDiaDTO } from '../../../services/dtos/HorarioDiaDTO'
import type { ServicioDTO } from '../../../services/dtos/ServicioDTO'
import type { CitaReservadaDTO } from './CitaReservadaDTO'
// #endregion

// #region Constantes
// Parámetro de la URL con el paso (?paso=2).
const PARAMETRO_PASO = 'paso'
// Pasos que cuenta la barra de progreso (la confirmación no cuenta).
const PASOS_CON_PROGRESO = PasoReservaEnum.Datos
// Sentido de la animación al cambiar de paso.
const HACIA_ADELANTE = 1
const HACIA_ATRAS = -1
// Entrada del historial a la que vuelve el botón Atrás (la anterior).
const ENTRADA_ANTERIOR = -1
// Desplazamiento lateral de la animación entre pasos, en px.
const DESPLAZAMIENTO_PASO = 40
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
// #endregion

/**
 * Reserva online: 1 Servicio → 2 Día → 3 Hora → 4 Datos → ✓ Confirmación.
 *
 * El paso va en la URL (?paso=2): así el botón ATRÁS del móvil vuelve al paso
 * anterior en vez de sacar al cliente de la reserva (era lo que pasaba antes,
 * y perdía todo lo elegido). Si alguien entra a un paso sin haber elegido lo
 * de antes, se le lleva al primero que le falte.
 */
const BookingComponent: FunctionComponent = () => {
  // #region Declaraciones, variables y hooks
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [servicio, setServicio] = useState<ServicioDTO | null>(null)
  const [fecha, setFecha] = useState<Date | null>(null)
  const [hora, setHora] = useState<Date | null>(null)
  // Datos guardados al confirmar.
  const [cita, setCita] = useState<CitaReservadaDTO | null>(null)
  const [avisoHora, setAvisoHora] = useState<string>('')
  const [horario, setHorario] = useState<HorarioDiaDTO[] | null>(null)
  const [servicios, setServicios] = useState<ServicioDTO[] | null>(null)
  const [soloWhatsapp, setSoloWhatsapp] = useState<ServicioDTO[]>([])
  const [direccion, setDireccion] = useState<number>(HACIA_ADELANTE)
  // #endregion

  // #region Carga del horario y los servicios
  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const [horarioSemana, todosServicios] = await Promise.all([ConfigurationService.getHorario(), ConfigurationService.getServicios()])
      if (!vivo) return
      setHorario(horarioSemana)
      const activos = todosServicios.filter((s) => s.activo !== false)
      setServicios(activos.filter((s) => s.online !== false))
      setSoloWhatsapp(activos.filter((s) => s.online === false))
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])
  // #endregion

  // #region Paso actual y navegación
  // Paso pedido en la URL, recortado a lo que de verdad se puede ver.
  const pedido = Number(params.get(PARAMETRO_PASO)) || PasoReservaEnum.Servicio
  const maximo = !servicio
    ? PasoReservaEnum.Servicio
    : !fecha
      ? PasoReservaEnum.Dia
      : !hora
        ? PasoReservaEnum.Hora
        : PasoReservaEnum.Datos
  // Al confirmar se borra la hora elegida: si luego se vuelve atrás desde la
  // confirmación, se cae en "elige hora" (para reservar otra, p. ej. para un
  // amigo) y no en el formulario con la misma hora, que ya está cogida.
  const paso: PasoReservaEnum =
    cita && pedido === PasoReservaEnum.Confirmacion
      ? PasoReservaEnum.Confirmacion
      : Math.min(Math.max(pedido, PasoReservaEnum.Servicio), maximo)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paso])

  const irA = (destino: PasoReservaEnum, opciones?: NavigateOptions) => {
    setDireccion(destino > paso ? HACIA_ADELANTE : HACIA_ATRAS)
    setParams({ [PARAMETRO_PASO]: String(destino) }, opciones)
  }
  const atras = () => {
    setDireccion(HACIA_ATRAS)
    navigate(ENTRADA_ANTERIOR)
  }
  // #endregion

  // #region Aviso de inicio de la reserva
  const antesDeEmpezar = !reservaEmpezada()
  const inicio = inicioReservas()
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
  // #endregion

  // #region Renderizado
  return (
    <div className="flex min-h-screen flex-col bg-hueso text-tinta">
      {/* Cabecera. */}
      <header className="pizarra sticky top-0 z-30 border-b border-acento/15">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label="Volver al inicio">
            <BrandLogoComponent variant={BrandLogoVariantEnum.Monogram} className="h-9 w-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento">
            <ArrowLeft size={16} />
            Inicio
          </Link>
        </div>
        {/* Progreso. */}
        {paso < PasoReservaEnum.Confirmacion && (
          <m.div
            className="h-0.5 origin-left bg-acento"
            animate={{ scaleX: paso / PASOS_CON_PROGRESO }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
          />
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 sm:px-5 md:pt-12">
        {paso < PasoReservaEnum.Confirmacion && (
          <>
            <div className="mb-6 text-center">
              <p className="mb-2 text-xs tracking-kicker text-acento-oscuro">Reserva online</p>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Pide tu cita</h1>
            </div>

            {/* Aún no ha empezado: se avisa (solo al principio, para no empujar
                hacia abajo cada paso) y se da la salida por WhatsApp. */}
            {antesDeEmpezar && paso === PasoReservaEnum.Servicio && (
              <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-3 rounded-2xl bg-acento/10 p-4 text-center text-sm sm:flex-row sm:text-left">
                <CalendarClock size={22} className="shrink-0 text-acento-oscuro" />
                <p className="flex-1 text-tinta/75">
                  La reserva online es para citas desde el <strong>{inicio.getDate()} de {MESES[inicio.getMonth()]}</strong>.
                  ¿La necesitas antes?
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
                >
                  <WhatsAppIconComponent size={15} /> Escríbeme
                </a>
              </div>
            )}

            <StepIndicatorComponent paso={paso} onIr={(destino) => destino < paso && irA(destino)} />
            <BookingSummaryComponent
              servicio={servicio}
              fecha={paso > PasoReservaEnum.Dia ? fecha : null}
              hora={paso > PasoReservaEnum.Hora ? hora : null}
            />
          </>
        )}

        <AnimatePresence mode="wait" custom={direccion}>
          <m.section
            key={paso}
            custom={direccion}
            initial={{ opacity: 0, x: DESPLAZAMIENTO_PASO * direccion }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -DESPLAZAMIENTO_PASO * direccion }}
            transition={{ duration: 0.35, ease: EASE_SMOOTH }}
          >
            {paso === PasoReservaEnum.Servicio && (
              <ServiceStepComponent
                servicios={servicios}
                soloWhatsapp={soloWhatsapp}
                servicio={servicio}
                onElegir={(elegido) => {
                  if (elegido.id !== servicio?.id) setHora(null)
                  setServicio(elegido)
                  irA(PasoReservaEnum.Dia)
                }}
              />
            )}

            {paso === PasoReservaEnum.Dia && !horario && <div className="h-96 animate-pulse rounded-3xl bg-tinta/[0.06]" />}

            {paso === PasoReservaEnum.Dia && servicio && horario && (
              <DateStepComponent
                servicio={servicio}
                fecha={fecha}
                horario={horario}
                onElegir={(elegida) => {
                  setFecha(elegida)
                  setHora(null)
                  setAvisoHora('')
                  irA(PasoReservaEnum.Hora)
                }}
              />
            )}

            {paso === PasoReservaEnum.Hora && servicio && fecha && horario && (
              <TimeStepComponent
                key={`${servicio.id}-${fecha.getTime()}-${avisoHora}`}
                servicio={servicio}
                fecha={fecha}
                horario={horario}
                hora={hora}
                aviso={avisoHora}
                onElegir={(elegida) => {
                  setHora(elegida)
                  setAvisoHora('')
                  irA(PasoReservaEnum.Datos)
                }}
              />
            )}

            {paso === PasoReservaEnum.Datos && servicio && hora && (
              <DetailsStepComponent
                servicio={servicio}
                hora={hora}
                onConfirmado={(datos) => {
                  setCita({ ...datos, servicio })
                  setHora(null)
                  irA(PasoReservaEnum.Confirmacion, { replace: true })
                }}
                onHoraPerdida={(texto) => {
                  setHora(null)
                  setAvisoHora(texto)
                  irA(PasoReservaEnum.Hora, { replace: true })
                }}
              />
            )}

            {paso === PasoReservaEnum.Confirmacion && cita && <ConfirmationComponent servicio={cita.servicio} hora={cita.inicio} nombre={cita.clienteNombre} />}
          </m.section>
        </AnimatePresence>

        {paso > PasoReservaEnum.Servicio && paso < PasoReservaEnum.Confirmacion && (
          <button
            type="button"
            onClick={atras}
            className="mx-auto mt-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
          >
            <ArrowLeft size={16} />
            Atrás
          </button>
        )}
      </main>
    </div>
  )
  // #endregion
}

export default BookingComponent

// #region Imports
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, Check, CalendarClock, Scissors, CalendarDays, Clock } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import PasoServicio from './PasoServicio'
import PasoFecha from './PasoFecha'
import PasoHora from './PasoHora'
import PasoDatos from './PasoDatos'
import Confirmacion from './Confirmacion'
import { getHorario, getServicios } from '../../../lib/config'
import { fechaLarga, horaEn } from '../../../utils/fechas'
import { RESERVA, reservaEmpezada, inicioReservas } from '../../../data/features'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'
import { EASE_SUAVE } from '../../../theme/animacion'
// #endregion

const PASOS = ['Servicio', 'Día', 'Hora', 'Tus datos']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/**
 * Reserva online: 1 Servicio → 2 Día → 3 Hora → 4 Datos → ✓ Confirmación.
 *
 * El paso va en la URL (?paso=2): así el botón ATRÁS del móvil vuelve al paso
 * anterior en vez de sacar al cliente de la reserva (era lo que pasaba antes,
 * y perdía todo lo elegido). Si alguien entra a un paso sin haber elegido lo
 * de antes, se le lleva al primero que le falte.
 */
const ReservaComponent = () => {
  // #region Declaraciones, variables y hooks
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [servicio, setServicio] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  // Datos guardados al confirmar.
  const [cita, setCita] = useState(null)
  const [avisoHora, setAvisoHora] = useState('')
  const [horario, setHorario] = useState(null)
  const [servicios, setServicios] = useState(null)
  const [soloWhatsapp, setSoloWhatsapp] = useState([])
  const [direccion, setDireccion] = useState(1)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const [h, ss] = await Promise.all([getHorario(), getServicios()])
      if (!vivo) return
      setHorario(h)
      const activos = ss.filter((s) => s.activo !== false)
      setServicios(activos.filter((s) => s.online !== false))
      setSoloWhatsapp(activos.filter((s) => s.online === false))
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  // Paso pedido en la URL, recortado a lo que de verdad se puede ver.
  const pedido = Number(params.get('paso')) || 1
  const maximo = !servicio ? 1 : !fecha ? 2 : !hora ? 3 : 4
  // Al confirmar se borra la hora elegida: si luego se vuelve atrás desde la
  // confirmación, se cae en "elige hora" (para reservar otra, p. ej. para un
  // amigo) y no en el formulario con la misma hora, que ya está cogida.
  const paso = cita && pedido === 5 ? 5 : Math.min(Math.max(pedido, 1), maximo)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paso])

  const irA = (n, opciones) => {
    setDireccion(n > paso ? 1 : -1)
    setParams({ paso: String(n) }, opciones)
  }
  const atras = () => {
    setDireccion(-1)
    navigate(-1)
  }

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
            <LogoAdriComponent variante="monograma" className="h-9 w-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento">
            <ArrowLeft size={16} />
            Inicio
          </Link>
        </div>
        {/* Progreso. */}
        {paso < 5 && (
          <m.div
            className="h-0.5 origin-left bg-acento"
            animate={{ scaleX: paso / PASOS.length }}
            transition={{ duration: 0.5, ease: EASE_SUAVE }}
          />
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 sm:px-5 md:pt-12">
        {paso < 5 && (
          <>
            <div className="mb-6 text-center">
              <p className="mb-2 text-xs tracking-kicker text-acento-oscuro">Reserva online</p>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">Pide tu cita</h1>
            </div>

            {/* Aún no ha empezado: se avisa (solo al principio, para no empujar
                hacia abajo cada paso) y se da la salida por WhatsApp. */}
            {antesDeEmpezar && paso === 1 && (
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
                  <WhatsAppIcon size={15} /> Escríbeme
                </a>
              </div>
            )}

            <Pasos paso={paso} onIr={(n) => n < paso && irA(n)} />
            <Resumen servicio={servicio} fecha={paso > 2 ? fecha : null} hora={paso > 3 ? hora : null} />
          </>
        )}

        <AnimatePresence mode="wait" custom={direccion}>
          <m.section
            key={paso}
            custom={direccion}
            initial={{ opacity: 0, x: 40 * direccion }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direccion }}
            transition={{ duration: 0.35, ease: EASE_SUAVE }}
          >
            {paso === 1 && (
              <PasoServicio
                servicios={servicios}
                soloWhatsapp={soloWhatsapp}
                servicio={servicio}
                onElegir={(s) => {
                  if (s.id !== servicio?.id) setHora(null)
                  setServicio(s)
                  irA(2)
                }}
              />
            )}

            {paso === 2 && !horario && <div className="h-96 animate-pulse rounded-3xl bg-tinta/[0.06]" />}

            {paso === 2 && horario && (
              <PasoFecha
                servicio={servicio}
                fecha={fecha}
                horario={horario}
                onElegir={(f) => {
                  setFecha(f)
                  setHora(null)
                  setAvisoHora('')
                  irA(3)
                }}
              />
            )}

            {paso === 3 && (
              <PasoHora
                key={`${servicio.id}-${fecha.getTime()}-${avisoHora}`}
                servicio={servicio}
                fecha={fecha}
                horario={horario}
                hora={hora}
                aviso={avisoHora}
                onElegir={(h) => {
                  setHora(h)
                  setAvisoHora('')
                  irA(4)
                }}
              />
            )}

            {paso === 4 && (
              <PasoDatos
                servicio={servicio}
                hora={hora}
                onConfirmado={(datos) => {
                  setCita({ ...datos, servicio })
                  setHora(null)
                  irA(5, { replace: true })
                }}
                onHoraPerdida={(texto) => {
                  setHora(null)
                  setAvisoHora(texto)
                  irA(3, { replace: true })
                }}
              />
            )}

            {paso === 5 && <Confirmacion servicio={cita.servicio} hora={cita.inicio} nombre={cita.clienteNombre} />}
          </m.section>
        </AnimatePresence>

        {paso > 1 && paso < 5 && (
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

/** Puntos de los pasos. Los ya hechos se pueden pulsar para volver. */
const Pasos = ({ paso, onIr }) => {
  return (
    <ol className="mx-auto mb-6 flex max-w-md items-center">
      {PASOS.map((nombre, i) => {
        const n = i + 1
        const hecho = paso > n
        const activo = paso === n
        return (
          <li key={nombre} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onIr(n)}
              disabled={!hecho}
              aria-current={activo ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  hecho ? 'bg-acento text-tinta' : activo ? 'scale-110 bg-tinta text-hueso shadow-lg' : 'bg-tinta/10 text-tinta/40'
                }`}
              >
                {hecho ? <Check size={16} strokeWidth={3} /> : n}
              </span>
              <span className={`text-[0.7rem] ${activo ? 'font-semibold text-tinta' : 'text-tinta/40'}`}>{nombre}</span>
            </button>
            {n < PASOS.length && (
              <span className="mx-1.5 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/10">
                <span
                  className={`block h-full origin-left bg-acento transition-transform duration-500 ${hecho ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Lo elegido hasta ahora, siempre a la vista. */
const Resumen = ({ servicio, fecha, hora }) => {
  if (!servicio) return null
  const piezas = [
    { Icono: Scissors, texto: `${servicio.nombre} · ${servicio.precio} €` },
    fecha && { Icono: CalendarDays, texto: fechaLarga(fecha) },
    hora && { Icono: Clock, texto: horaEn(hora, RESERVA.zona) },
  ].filter(Boolean)

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      <AnimatePresence initial={false}>
        {piezas.map(({ Icono, texto }) => (
          <m.span
            key={texto}
            className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 ring-hueso-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: EASE_SUAVE }}
          >
            <Icono size={14} className="text-acento-oscuro" />
            {texto}
          </m.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ReservaComponent

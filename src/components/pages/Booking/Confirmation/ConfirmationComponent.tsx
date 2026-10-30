// #region Imports
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { CalendarPlus, Home, MapPin } from 'lucide-react'
import WhatsAppIconComponent from '../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { addMinutes } from '../../../../utils/availability'
import { formatLongDate, formatTimeInZone } from '../../../../utils/dates'
import { RESERVA } from '../../../../data/features'
import { NEGOCIO, WHATSAPP, MAPS_URL } from '../../../../data/contact'
import { EASE_SMOOTH } from '../../../../theme/animation'
import type { IConfirmationProps } from './IConfirmationProps'
// #endregion

/** Datos del evento que se guarda en el calendario. */
interface EventoCalendario {
  /** Título del evento. */
  titulo: string;
  /** Inicio de la cita. */
  inicio: Date;
  /** Fin de la cita. */
  fin: Date;
  /** Dirección de la barbería. */
  lugar: string;
  /** Texto del recordatorio. */
  aviso: string;
}

/** Instante en UTC compacto, el formato de los calendarios: "20270104T090000Z". */
const aUtcCompacto = (d: Date): string => {
  const result = d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return result
}

/** Archivo .ics: lo abren el calendario del iPhone, Outlook y casi todos. */
const enlaceIcs = ({ titulo, inicio, fin, lugar, aviso }: EventoCalendario): string => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A.S Barberia//Reserva//ES',
    'BEGIN:VEVENT',
    `UID:${inicio.getTime()}@as-barberia`,
    `DTSTAMP:${aUtcCompacto(new Date())}`,
    `DTSTART:${aUtcCompacto(inicio)}`,
    `DTEND:${aUtcCompacto(fin)}`,
    `SUMMARY:${titulo}`,
    `LOCATION:${lugar.replace(/,/g, '\\,')}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${aviso}`,
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const result = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
  return result
}

/**
 * Cita guardada. Resumen bien claro, botón para guardarla en el calendario
 * del móvil (con recordatorio 2 horas antes) y WhatsApp por si hay que
 * cambiarla o anularla.
 */
const ConfirmationComponent: FunctionComponent<IConfirmationProps> = ({ servicio, hora, nombre }) => {
  // #region Declaraciones, variables y hooks
  const fin = addMinutes(hora, servicio.duracion)
  const desde = formatTimeInZone(hora, RESERVA.zona)
  const hasta = formatTimeInZone(fin, RESERVA.zona)
  const lugar = `${NEGOCIO.nombreCompleto}, ${NEGOCIO.direccion}, ${NEGOCIO.localidad}`
  const titulo = `${servicio.nombre} · A.S Barbería`

  const google =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(titulo)}` +
    `&dates=${aUtcCompacto(hora)}/${aUtcCompacto(fin)}` +
    `&location=${encodeURIComponent(lugar)}`

  const mensaje =
    `Hola Adrián, soy ${nombre}. Tengo cita el ${formatLongDate(hora).toLowerCase()} a las ${desde} ` +
    `(${servicio.nombre}) y necesito cambiarla.`
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`
  // #endregion

  // #region Renderizado
  return (
    <div className="mx-auto max-w-md text-center">
      {/* Check que se dibuja. */}
      <m.div
        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-acento shadow-xl shadow-acento/40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
      >
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-tinta" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <m.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE_SMOOTH }}
          />
        </svg>
      </m.div>

      <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_SMOOTH }}>
        <h1 className="font-display text-4xl font-bold">¡Hecho, {nombre.split(' ')[0]}!</h1>
        <p className="mt-2 text-tinta/60">Tu cita está reservada. Te esperamos.</p>

        {/* Resumen tipo tique. */}
        <div className="grain relative mt-8 overflow-hidden rounded-3xl bg-tinta p-6 text-left text-hueso shadow-xl shadow-tinta/20">
          <img
            src="/logo-sello.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 w-40 opacity-10"
          />
          <p className="text-xs tracking-kicker text-acento">Tu cita</p>
          <p className="mt-2 font-display text-2xl font-bold">{formatLongDate(hora)}</p>
          <p className="mt-1 font-display text-4xl font-bold text-acento tabular-nums">
            {desde} <span className="text-xl text-hueso/50">– {hasta}</span>
          </p>
          <span className="my-5 block border-t border-dashed border-white/15" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-hueso/75">{servicio.nombre}</span>
            <span className="font-display text-2xl font-bold">{servicio.precio} €</span>
          </div>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm text-hueso/55 transition-colors hover:text-acento"
          >
            <MapPin size={15} /> {NEGOCIO.direccion}, {NEGOCIO.localidad}
          </a>
        </div>

        {/* Calendario. */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={google}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-tinta/15 bg-white py-3.5 text-sm font-semibold transition-colors hover:border-tinta"
          >
            <CalendarPlus size={17} /> Google Calendar
          </a>
          <a
            href={enlaceIcs({ titulo, inicio: hora, fin, lugar, aviso: `Cita en A.S Barbería a las ${desde}` })}
            download="cita-as-barberia.ics"
            className="flex items-center justify-center gap-2 rounded-full border border-tinta/15 bg-white py-3.5 text-sm font-semibold transition-colors hover:border-tinta"
          >
            <CalendarPlus size={17} /> iPhone / Outlook
          </a>
        </div>

        <p className="mt-8 text-sm text-tinta/55">¿No puedes venir? Avísale y deja el hueco libre para otro.</p>
        <div className="mt-3 flex flex-col gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
          >
            <WhatsAppIconComponent size={18} />
            Cambiar o anular por WhatsApp
          </a>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-full py-3.5 font-medium text-tinta/60 transition-colors hover:text-tinta"
          >
            <Home size={18} />
            Volver al inicio
          </Link>
        </div>
      </m.div>
    </div>
  )
  // #endregion
}

export default ConfirmationComponent

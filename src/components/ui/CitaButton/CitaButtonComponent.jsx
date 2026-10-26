import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { reservaEmpezada } from '../../../data/features'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Botón principal "Pedir cita" — la acción estrella de toda la web.
 *  - Con la reserva online ya en marcha: lleva a /reserva.
 *  - Antes (o con la reserva apagada): abre WhatsApp con el mensaje
 *    predefinido. El cambio es automático el día que empieza la reserva
 *    (RESERVA.desde en data/features.js).
 *
 * Props:
 *  - variante: 'acento' (dorado, por defecto) | 'contorno' (borde claro).
 *  - tamano: 'md' | 'lg'.
 *  - className: clases extra.
 */
export default function CitaButtonComponent({
  texto,
  variante = 'acento',
  tamano = 'md',
  className = '',
}) {
  // Con la reserva apagada, los botones grandes dicen que se abre WhatsApp;
  // en el pequeño (menú) no cabe y basta con el icono.
  const online = reservaEmpezada()
  const porDefecto = tamano !== 'lg' ? 'Pedir cita' : online ? 'Reservar cita' : 'Pedir cita por WhatsApp'
  const etiqueta = texto ?? porDefecto

  const variantes = {
    acento:
      'bg-acento text-tinta hover:bg-acento-claro shadow-lg shadow-acento/20',
    contorno:
      'border border-hueso/40 text-hueso hover:bg-hueso hover:text-tinta',
  }
  const tamanos = {
    md: 'px-7 py-3.5 text-xs',
    lg: 'px-6 py-4 text-xs min-[400px]:px-8 sm:px-9 sm:text-sm lg:px-7 xl:px-9',
  }

  const clases = `group inline-flex items-center justify-center gap-2.5 whitespace-nowrap al-tocar font-semibold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${variantes[variante]} ${tamanos[tamano]} ${className}`
  const medida = tamano === 'lg' ? 20 : 18

  // Sin reserva online (aún) → el botón contacta por WhatsApp. Se usa el
  // icono de WhatsApp (y no un calendario) para que se vea de antemano que
  // se abre el chat, y no una pantalla de reserva.
  if (!online) {
    const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className={clases}
      >
        <WhatsAppIcon size={medida} />
        {etiqueta}
      </a>
    )
  }

  // Reserva online en marcha.
  return (
    <Link to="/reserva" className={clases}>
      <CalendarCheck size={medida} strokeWidth={2} />
      {etiqueta}
    </Link>
  )
}

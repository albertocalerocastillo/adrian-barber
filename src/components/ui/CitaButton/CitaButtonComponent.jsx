import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { RESERVAS_ONLINE } from '../../../data/features'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Botón principal "Pedir cita" — la acción estrella de toda la web.
 *  - FASE 2 (RESERVAS_ONLINE = true):  lleva a la reserva online (/reserva).
 *  - FASE 1 (RESERVAS_ONLINE = false): abre WhatsApp con el mensaje predefinido.
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
  const etiqueta =
    texto ??
    (!RESERVAS_ONLINE && tamano === 'lg' ? 'Pedir cita por WhatsApp' : 'Pedir cita')

  const variantes = {
    acento:
      'bg-acento text-tinta hover:bg-acento-claro shadow-lg shadow-acento/20',
    contorno:
      'border border-hueso/40 text-hueso hover:bg-hueso hover:text-tinta',
  }
  const tamanos = {
    md: 'px-7 py-3.5 text-xs',
    lg: 'px-9 py-4 text-sm',
  }

  const clases = `group inline-flex items-center justify-center gap-2.5 font-semibold uppercase tracking-widest transition-all duration-300 ${variantes[variante]} ${tamanos[tamano]} ${className}`
  const medida = tamano === 'lg' ? 20 : 18

  // FASE 1: sin reserva online → el botón contacta por WhatsApp. Se usa el
  // icono de WhatsApp (y no un calendario) para que se vea de antemano que
  // se abre el chat, y no una pantalla de reserva.
  if (!RESERVAS_ONLINE) {
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

  // FASE 2: reserva online activa.
  return (
    <Link to="/reserva" className={clases}>
      <CalendarCheck size={medida} strokeWidth={2} />
      {etiqueta}
    </Link>
  )
}

import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
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
  texto = 'Pedir cita',
  variante = 'acento',
  tamano = 'md',
  className = '',
}) {
  const variantes = {
    acento:
      'bg-acento text-tinta hover:bg-acento-claro shadow-lg shadow-acento/20',
    contorno:
      'border border-hueso/40 text-hueso hover:bg-hueso hover:text-tinta',
  }
  const tamanos = {
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const clases = `group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-wide transition-all duration-300 ${variantes[variante]} ${tamanos[tamano]} ${className}`
  const icono = <CalendarCheck size={tamano === 'lg' ? 20 : 18} strokeWidth={2} />

  // FASE 1: sin reserva online → el botón contacta por WhatsApp.
  if (!RESERVAS_ONLINE) {
    const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className={clases}
      >
        {icono}
        {texto}
      </a>
    )
  }

  // FASE 2: reserva online activa.
  return (
    <Link to="/reserva" className={clases}>
      {icono}
      {texto}
    </Link>
  )
}

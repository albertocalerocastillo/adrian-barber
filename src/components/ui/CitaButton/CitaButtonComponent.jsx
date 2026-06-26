import { CalendarCheck } from 'lucide-react'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Botón principal "Pedir cita" — la acción estrella de toda la web.
 *
 * FASE 1: abre WhatsApp con el mensaje predefinido.
 * FASE 2: pasará a enrutar a /reserva (reserva online). Al estar centralizado
 *         aquí, ese cambio se hará en un único sitio.
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
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-wide transition-all duration-300 ${variantes[variante]} ${tamanos[tamano]} ${className}`}
    >
      <CalendarCheck size={tamano === 'lg' ? 20 : 18} strokeWidth={2} />
      {texto}
    </a>
  )
}

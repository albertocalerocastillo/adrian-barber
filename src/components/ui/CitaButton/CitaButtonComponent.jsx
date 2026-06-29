import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'

/**
 * Botón principal "Pedir cita" — la acción estrella de toda la web.
 * Lleva a la reserva online (/reserva).
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

  return (
    <Link
      to="/reserva"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-wide transition-all duration-300 ${variantes[variante]} ${tamanos[tamano]} ${className}`}
    >
      <CalendarCheck size={tamano === 'lg' ? 20 : 18} strokeWidth={2} />
      {texto}
    </Link>
  )
}

import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Botón/enlace a WhatsApp con el mensaje predefinido.
 * En la Fase 1 es la vía para pedir cita; en la Fase 2 convivirá con la
 * reserva online (/reserva).
 *
 * Props:
 *  - texto: etiqueta del botón.
 *  - variante: 'solido' (verde WhatsApp) | 'oscuro' | 'claro'.
 *  - className: clases extra.
 */
export default function WhatsAppButtonComponent({
  texto = 'Escríbenos por WhatsApp',
  variante = 'solido',
  className = '',
}) {
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  const estilos = {
    solido: 'bg-[#25D366] text-white hover:bg-[#1ebe5b]',
    oscuro: 'bg-tinta text-hueso hover:bg-tinta-800',
    claro: 'bg-hueso text-tinta hover:bg-hueso-200',
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium transition-colors ${estilos[variante]} ${className}`}
    >
      <WhatsAppIcon size={18} />
      {texto}
    </a>
  )
}

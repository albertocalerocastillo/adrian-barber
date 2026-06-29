import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Acciones flotantes (esquina inferior derecha): "Pedir cita" + WhatsApp.
 * Aparecen tras desplazar un poco la página para no tapar el hero.
 * Cómodas en móvil, que es donde más se usará.
 *
 * FASE 1: "Pedir cita" abre WhatsApp con el mensaje predefinido.
 * FASE 2: pasará a enrutar a /reserva (reserva online).
 */
export default function FloatingActionsComponent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {/* WhatsApp */}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition-transform hover:scale-105"
      >
        <WhatsAppIcon size={26} />
      </a>

      {/* Pedir cita (acción principal) */}
      <Link
        to="/reserva"
        className="flex items-center gap-2 rounded-full bg-acento px-5 py-3.5 text-sm font-semibold text-tinta shadow-xl shadow-acento/30 transition-transform hover:scale-105"
      >
        <CalendarCheck size={18} strokeWidth={2} />
        Pedir cita
      </Link>
    </div>
  )
}

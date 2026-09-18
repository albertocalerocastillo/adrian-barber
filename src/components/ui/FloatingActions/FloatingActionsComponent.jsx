import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Phone } from 'lucide-react'
import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { RESERVAS_ONLINE } from '../../../data/features'
import {
  WHATSAPP,
  WHATSAPP_MENSAJE,
  TELEFONO,
  TELEFONO_VISIBLE,
} from '../../../data/contacto'

/**
 * Acciones flotantes (esquina inferior derecha): llamar + WhatsApp + "Pedir cita".
 * Aparecen tras desplazar un poco la página para no tapar el hero.
 * Cómodas en móvil, que es donde más se usará.
 *
 * El botón de llamar está porque buena parte de la clientela de una barbería
 * prefiere el teléfono a escribir.
 *
 * FASE 1 (RESERVAS_ONLINE = false): "Pedir cita" abre WhatsApp.
 * FASE 2 (RESERVAS_ONLINE = true):  "Pedir cita" enruta a /reserva.
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

  const claseCita =
    'flex items-center gap-2 bg-acento px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-tinta shadow-xl shadow-acento/30 transition-transform hover:scale-105'

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {/* Llamar */}
      <a
        href={`tel:${TELEFONO}`}
        aria-label={`Llamar al ${TELEFONO_VISIBLE}`}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-tinta-800 text-hueso shadow-xl shadow-black/20 ring-1 ring-acento/30 transition-transform hover:scale-105"
      >
        <Phone size={24} strokeWidth={1.75} />
      </a>

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
      {RESERVAS_ONLINE ? (
        <Link to="/reserva" className={claseCita}>
          <CalendarCheck size={18} strokeWidth={2} />
          Pedir cita
        </Link>
      ) : (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={claseCita}>
          <WhatsAppIcon size={18} />
          Pedir cita
        </a>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import WhatsAppIcon from '../WhatsAppIcon/WhatsAppIcon'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Botón flotante de WhatsApp (esquina inferior derecha).
 * Aparece tras desplazar un poco la página para no tapar el hero.
 * Cómodo en móvil, que es donde más se usará.
 */
export default function FloatingActionsComponent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <WhatsAppIcon size={28} />
    </a>
  )
}

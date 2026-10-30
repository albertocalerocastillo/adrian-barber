// #region Imports
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { useScrolled } from '../../../hooks/useScrolled'
import { EASE_SMOOTH } from '../../../theme/animation'
import { CalendarCheck, Phone, MapPin } from 'lucide-react'
import WhatsAppIconComponent from '../WhatsAppIcon/WhatsAppIconComponent'
import { reservaEmpezada } from '../../../data/features'
import {
  WHATSAPP,
  WHATSAPP_MENSAJE,
  TELEFONO,
  TELEFONO_VISIBLE,
  MAPS_URL,
} from '../../../data/contact'
// #endregion

/**
 * Acciones de contacto, SIEMPRE visibles (no dependen del scroll):
 *  - Móvil: barra fija abajo con Llamar · WhatsApp · Cómo llegar. Es la zona
 *    del pulgar y es el patrón que mejor convierte en negocios locales.
 *  - Escritorio: grupo flotante en la esquina inferior derecha.
 *
 * Ojo: la barra de móvil tapa el final de la página, así que la home reserva
 * espacio abajo (ver HomeComponent).
 */
const FloatingActionsComponent = () => {
  // #region Declaraciones, variables y hooks
  const visible = useScrolled(600)
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  const claseCita =
    'flex items-center gap-2 bg-acento px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-tinta shadow-xl shadow-acento/30 transition-transform hover:scale-105'
  // #endregion

  // #region Renderizado
  return (
    <>
      {/* ─── MÓVIL: barra fija inferior ─────────────────────── */}
      <nav
        aria-label="Contacto rápido"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-acento/25 bg-tinta/95 backdrop-blur-md md:hidden"
      >
        <a
          href={`tel:${TELEFONO}`}
          aria-label={`Llamar al ${TELEFONO_VISIBLE}`}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.6rem] font-medium uppercase tracking-widest text-hueso/85 transition-colors active:bg-tinta-800"
        >
          <Phone size={19} strokeWidth={1.75} />
          Llamar
        </a>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 bg-acento py-2.5 active:bg-acento-claro text-[0.6rem] font-semibold uppercase tracking-widest text-tinta transition-colors"
        >
          <WhatsAppIconComponent size={19} />
          WhatsApp
        </a>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-[0.6rem] font-medium uppercase tracking-widest text-hueso/85 transition-colors active:bg-tinta-800"
        >
          <MapPin size={19} strokeWidth={1.75} />
          Cómo llegar
        </a>
      </nav>

      {/* ─── ESCRITORIO: grupo flotante ─────────────────────────
          Aparece al dejar atrás el hero: arriba ya están sus botones. */}
      <m.div
        className="fixed bottom-5 right-5 z-50 hidden items-center gap-3 md:flex"
        initial={false}
        animate={visible ? { opacity: 1, y: 0, pointerEvents: 'auto' } : { opacity: 0, y: 24, pointerEvents: 'none' }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
      >
        <a
          href={`tel:${TELEFONO}`}
          aria-label={`Llamar al ${TELEFONO_VISIBLE}`}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-tinta-800 text-hueso shadow-xl shadow-black/20 ring-1 ring-acento/30 transition-transform hover:scale-105"
        >
          <Phone size={24} strokeWidth={1.75} />
        </a>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition-transform hover:scale-105"
        >
          <WhatsAppIconComponent size={26} />
        </a>

        {reservaEmpezada() ? (
          <Link to="/reserva" className={claseCita}>
            <CalendarCheck size={18} strokeWidth={2} />
            Pedir cita
          </Link>
        ) : (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={claseCita}>
            <WhatsAppIconComponent size={18} />
            Pedir cita
          </a>
        )}
      </m.div>
    </>
  )
  // #endregion
}

export default FloatingActionsComponent

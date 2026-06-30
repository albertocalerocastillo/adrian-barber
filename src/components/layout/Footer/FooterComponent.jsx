import { Phone } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import {
  NEGOCIO,
  TELEFONO,
  TELEFONO_VISIBLE,
  WHATSAPP,
  WHATSAPP_MENSAJE,
  INSTAGRAM_URL,
} from '../../../data/contacto'

/**
 * Pie de página: logo, contacto rápido y redes.
 */
export default function FooterComponent() {
  const anio = new Date().getFullYear()
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  return (
    <footer className="pizarra border-t-2 border-acento/30 py-12 text-hueso">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 text-center md:flex-row md:justify-between md:px-8 md:text-left">
        {/* Logo + nombre */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <LogoAdriComponent className="h-24 w-24" redondeado="rounded-xl" />
          <p className="text-sm text-hueso/50">
            {NEGOCIO.barbero} · {NEGOCIO.ciudad}
          </p>
        </div>

        {/* Redes / contacto */}
        <div className="flex items-center gap-4">
          <a
            href={`tel:${TELEFONO}`}
            aria-label={`Llamar al ${TELEFONO_VISIBLE}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-tinta-700 text-hueso/70 transition-colors hover:border-acento hover:text-acento"
          >
            <Phone size={18} />
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-tinta-700 text-hueso/70 transition-colors hover:border-acento hover:text-acento"
          >
            <WhatsAppIcon size={18} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-tinta-700 text-hueso/70 transition-colors hover:border-acento hover:text-acento"
          >
            <InstagramIcon size={18} />
          </a>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-hueso/35">
        © {anio} {NEGOCIO.nombreCompleto}. Hecho con cariño en {NEGOCIO.localidad}.
      </p>
    </footer>
  )
}

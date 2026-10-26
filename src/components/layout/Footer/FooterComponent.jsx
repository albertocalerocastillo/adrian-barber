import { Link } from 'react-router-dom'
import { Phone, MapPin, ArrowUp } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import { useEstadoNegocio } from '../../../hooks/useEstadoNegocio'
import { resumenHorario } from '../../../data/faq'
import {
  NEGOCIO,
  TELEFONO,
  TELEFONO_VISIBLE,
  WHATSAPP,
  WHATSAPP_MENSAJE,
  INSTAGRAM,
  INSTAGRAM_URL,
  MAPS_URL,
} from '../../../data/contacto'

const ENLACES = [
  { href: '#servicios', texto: 'Servicios' },
  { href: '#galeria', texto: 'Galería' },
  { href: '#sobre-mi', texto: 'Sobre mí' },
  { href: '#resenas', texto: 'Reseñas' },
  { href: '#horario', texto: 'Horario' },
  { href: '#faq', texto: 'Preguntas' },
]

/**
 * Pie de página: sello, enlaces, contacto y horario, y redes.
 */
export default function FooterComponent() {
  const anio = new Date().getFullYear()
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
  const { horario } = useEstadoNegocio()

  const redes = [
    { href: `tel:${TELEFONO}`, etiqueta: `Llamar al ${TELEFONO_VISIBLE}`, icono: <Phone size={18} />, fuera: false },
    { href: wa, etiqueta: 'WhatsApp', icono: <WhatsAppIcon size={18} />, fuera: true },
    { href: INSTAGRAM_URL, etiqueta: 'Instagram', icono: <InstagramIcon size={18} />, fuera: true },
  ]

  return (
    // pb-16 en móvil: hueco para la barra fija de contacto de abajo.
    <footer className="pizarra relative border-t border-acento/30 pb-16 pt-16 text-hueso md:pb-0 md:pt-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 text-center md:grid-cols-2 md:px-8 md:text-left lg:grid-cols-[1.2fr_0.8fr_1fr]">
        {/* Sello + frase */}
        <div className="flex flex-col items-center gap-5 md:items-start">
          <LogoAdriComponent className="h-32 w-32 md:h-36 md:w-36" loading="lazy" />
          <p className="max-w-xs text-sm leading-relaxed text-hueso/55">
            Peluquería y barbería de {NEGOCIO.barbero} en {NEGOCIO.localidad}, {NEGOCIO.provincia}.
          </p>
          <div className="flex items-center gap-3">
            {redes.map((r) => (
              <a
                key={r.etiqueta}
                href={r.href}
                aria-label={r.etiqueta}
                {...(r.fuera ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="al-tocar flex h-11 w-11 items-center justify-center rounded-full border border-tinta-700 text-hueso/70 hover:-translate-y-0.5 hover:border-acento hover:text-acento"
              >
                {r.icono}
              </a>
            ))}
          </div>
        </div>

        {/* Enlaces */}
        <nav aria-label="Secciones">
          <p className="text-xs tracking-kicker text-acento">La web</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="subrayado pb-0.5 text-hueso/70 hover:text-acento">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacto */}
        <div className="md:col-span-2 lg:col-span-1">
          <p className="text-xs tracking-kicker text-acento">Visítanos</p>
          <ul className="mt-5 space-y-4 text-sm text-hueso/70">
            <li>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-3 hover:text-acento"
              >
                <MapPin size={17} className="mt-0.5 shrink-0 text-acento" />
                <span>
                  {NEGOCIO.direccion}
                  <br />
                  {NEGOCIO.localidad}, {NEGOCIO.provincia}
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${TELEFONO}`} className="inline-flex items-center gap-3 hover:text-acento">
                <Phone size={17} className="shrink-0 text-acento" />
                {TELEFONO_VISIBLE}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 hover:text-acento"
              >
                <InstagramIcon size={17} />
                @{INSTAGRAM}
              </a>
            </li>
            <li className="text-hueso/50">{resumenHorario(horario)}.</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-hueso/10 px-5 py-7 text-xs text-hueso/40 md:flex-row md:px-8">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <p>
            © {anio} {NEGOCIO.nombreCompleto}. Hecho con cariño en {NEGOCIO.localidad}.
          </p>
          <nav aria-label="Información legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/aviso-legal" className="hover:text-acento">Aviso legal</Link>
            <Link to="/privacidad" className="hover:text-acento">Privacidad</Link>
            <Link to="/cookies" className="hover:text-acento">Cookies</Link>
          </nav>
        </div>
        <a href="#inicio" className="al-tocar group inline-flex items-center gap-2 uppercase tracking-widest hover:text-acento">
          Volver arriba
          <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
        </a>
      </div>
    </footer>
  )
}

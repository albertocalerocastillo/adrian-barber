import { MapPin, Phone, Navigation } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import {
  NEGOCIO,
  TELEFONO,
  TELEFONO_VISIBLE,
  MAPS_URL,
  MAPS_EMBED,
} from '../../../data/contacto'

/**
 * Ubicación: dirección, teléfono y mapa de Google embebido.
 * El mapa usa una búsqueda por dirección (placeholder); se afinará con las
 * coordenadas exactas del local de Adrián.
 */
export default function UbicacionComponent() {
  return (
    <section id="ubicacion" className="bg-tinta py-20 text-hueso md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Cómo llegar" titulo="Dónde estamos" claro />

        <RevealComponent className="mx-auto mt-5 max-w-2xl text-center">
          <p className="text-base leading-relaxed text-hueso/70">
            {NEGOCIO.nombreCompleto} está en {NEGOCIO.localidad} ({NEGOCIO.provincia}),
            a un paso de San José de la Rinconada. Ven a por tu corte, arreglo de
            barba, mechas o tinte — o pide tu cita online.
          </p>
        </RevealComponent>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Datos */}
          <RevealComponent className="flex flex-col justify-center">
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tinta-800 text-acento">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="text-xs tracking-kicker text-hueso/50">Dirección</p>
                  <p className="mt-1 text-base text-hueso/90">{NEGOCIO.direccion}</p>
                  <p className="text-sm text-hueso/60">
                    {NEGOCIO.localidad}, {NEGOCIO.provincia}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tinta-800 text-acento">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="text-xs tracking-kicker text-hueso/50">Teléfono</p>
                  <a
                    href={`tel:${TELEFONO}`}
                    className="mt-1 block text-base text-hueso/90 transition-colors hover:text-acento"
                  >
                    {TELEFONO_VISIBLE}
                  </a>
                </div>
              </li>
            </ul>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-fit items-center gap-2.5 rounded-full bg-acento px-6 py-3 text-sm font-semibold text-tinta transition-colors hover:bg-acento-claro"
            >
              <Navigation size={18} />
              Cómo llegar
            </a>
          </RevealComponent>

          {/* Mapa */}
          <RevealComponent delay={120}>
            <div className="overflow-hidden rounded-2xl border border-tinta-700">
              <iframe
                title="Ubicación de A.S Barbería en Google Maps"
                src={MAPS_EMBED}
                width="100%"
                height="340"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </RevealComponent>
        </div>
      </div>
    </section>
  )
}

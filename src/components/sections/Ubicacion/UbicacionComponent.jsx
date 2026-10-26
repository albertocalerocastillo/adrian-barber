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
 * El mapa usa una búsqueda por dirección; se afinará con las coordenadas
 * exactas del local de Adrián.
 */
export default function UbicacionComponent() {
  const datos = [
    {
      icono: MapPin,
      etiqueta: 'Dirección',
      contenido: (
        <>
          <p className="mt-1 text-lg text-hueso">{NEGOCIO.direccion}</p>
          <p className="text-sm text-hueso/60">
            {NEGOCIO.localidad}, {NEGOCIO.provincia}
          </p>
        </>
      ),
    },
    {
      icono: Phone,
      etiqueta: 'Teléfono y WhatsApp',
      contenido: (
        <a
          href={`tel:${TELEFONO}`}
          className="subrayado mt-1 inline-block text-lg text-hueso hover:text-acento"
        >
          {TELEFONO_VISIBLE}
        </a>
      ),
    },
  ]

  return (
    <section id="ubicacion" className="grain relative overflow-hidden bg-tinta py-24 text-hueso md:py-32">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent
          kicker="Cómo llegar"
          titulo="Dónde estamos"
          texto={`${NEGOCIO.nombreCompleto} está en ${NEGOCIO.localidad} (${NEGOCIO.provincia}), a un paso de San José de la Rinconada. Ven a por tu corte, arreglo de barba, mechas o tinte: pide cita por WhatsApp o por teléfono.`}
          claro
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
          {/* Datos */}
          <RevealComponent desde="izquierda" className="flex flex-col justify-center">
            <ul className="space-y-7">
              {datos.map((d) => (
                <li key={d.etiqueta} className="flex items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-acento/30 text-acento">
                    <d.icono size={20} />
                  </span>
                  <div>
                    <p className="text-xs tracking-kicker text-hueso/50">{d.etiqueta}</p>
                    {d.contenido}
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="al-tocar mt-10 inline-flex w-full items-center justify-center gap-2.5 bg-acento px-8 py-4 text-xs font-semibold uppercase tracking-widest text-tinta hover:bg-acento-claro sm:w-fit"
            >
              <Navigation size={18} />
              Cómo llegar
            </a>
          </RevealComponent>

          {/* Mapa */}
          <RevealComponent delay={120} desde="derecha">
            <div className="relative overflow-hidden ring-1 ring-acento/25">
              <iframe
                title="Ubicación de A.S Barbería en Google Maps"
                src={MAPS_EMBED}
                width="100%"
                style={{ border: 0 }}
                className="block h-[300px] w-full grayscale-[60%] transition-[filter] duration-700 hover:grayscale-0 md:h-[380px]"
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

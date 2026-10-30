// #region Imports
import { useState } from 'react'
import type { FunctionComponent, ReactNode } from 'react'
import { MapPin, Phone, Navigation, Map as IconoMapa } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import SectionHeadingComponent from '../../core/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../core/Reveal/RevealComponent'
import { Link } from 'react-router-dom'
import {
  NEGOCIO,
  TELEFONO,
  TELEFONO_VISIBLE,
  MAPS_URL,
  MAPS_EMBED,
} from '../../../data/contact'
import { RevealFromEnum } from '../../../services/enums/RevealFromEnum'
import { RouteEnum } from '../../../services/enums/RouteEnum'
// #endregion

// #region Constantes
/** Dato de contacto de la lista (dirección, teléfono…). */
interface IDatoContacto {
  /** Icono del dato. */
  icono: LucideIcon;
  /** Etiqueta pequeña encima del dato. */
  etiqueta: string;
  /** El dato en sí. */
  contenido: ReactNode;
}
// #endregion

/**
 * Ubicación: dirección, teléfono y mapa de Google.
 *
 * El mapa NO se carga solo: Google Maps pone cookies y recibe la IP del
 * visitante, y eso exige su permiso (RGPD/LSSI). Hasta que pulsa "Ver mapa"
 * sale una tarjeta propia, sin nada de Google. El botón "Cómo llegar" es un
 * enlace normal y funciona siempre.
 */
const LocationComponent: FunctionComponent = () => {
  // #region Declaraciones, variables y hooks
  const [mapa, setMapa] = useState<boolean>(false)
  const datos: IDatoContacto[] = [
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
  // #endregion

  // #region Renderizado
  return (
    <section id="ubicacion" className="grain relative overflow-hidden bg-tinta py-24 text-hueso md:py-32">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent
          kicker="Cómo llegar"
          title="Dónde estamos"
          text={`${NEGOCIO.nombreCompleto} está en ${NEGOCIO.localidad} (${NEGOCIO.provincia}), a un paso de San José de la Rinconada. Ven a por tu corte, arreglo de barba, mechas o tinte: pide cita por WhatsApp o por teléfono.`}
          light
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
          {/* Datos. */}
          <RevealComponent from={RevealFromEnum.Left} className="flex flex-col justify-center">
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

          {/* Mapa. */}
          <RevealComponent delay={120} from={RevealFromEnum.Right}>
            <div className="relative h-[300px] overflow-hidden ring-1 ring-acento/25 md:h-[380px]">
              {mapa ? (
                <iframe
                  title="Ubicación de A.S Barbería en Google Maps"
                  src={MAPS_EMBED}
                  width="100%"
                  style={{ border: 0 }}
                  className="block h-full w-full"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="grain flex h-full flex-col items-center justify-center gap-4 bg-tinta-800 px-6 text-center">
                  {/* Sello en vez del mapa: nada de Google hasta que se pulse. */}
                  <img src="/logo-sello.webp" alt="" aria-hidden="true" loading="lazy" className="w-24 opacity-90 md:w-28" />
                  <p className="max-w-xs text-sm text-hueso/60">
                    {NEGOCIO.direccion}, {NEGOCIO.localidad}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMapa(true)}
                    className="al-tocar inline-flex items-center gap-2 border border-hueso/30 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-hueso transition-colors hover:border-acento hover:text-acento"
                  >
                    <IconoMapa size={16} /> Ver mapa
                  </button>
                  <p className="max-w-xs text-[0.7rem] leading-relaxed text-hueso/35">
                    Al pulsar se carga Google Maps, que puede usar cookies. Más en la{' '}
                    <Link to={RouteEnum.Cookies} className="underline hover:text-acento">política de cookies</Link>.
                  </p>
                </div>
              )}
            </div>
          </RevealComponent>
        </div>
      </div>
    </section>
  )
  // #endregion
}

export default LocationComponent

// #region Imports
import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { Phone } from 'lucide-react'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import MagneticComponent from '../../ui/Magnetic/MagneticComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import ReservaOnlineComponent from '../../ui/ReservaOnline/ReservaOnlineComponent'
import { TELEFONO, TELEFONO_VISIBLE } from '../../../data/contacto'
import { reservaEmpezada } from '../../../data/features'
// #endregion

/**
 * Último empujón antes del pie: quien ha llegado hasta aquí ya está
 * convencido, así que se le pone el botón delante y grande. El sello gira
 * con el scroll a modo de remate.
 */
const CtaFinalComponent = () => {
  // #region Declaraciones, variables y hooks
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const giro = useTransform(scrollYProgress, [0, 1], [-60, 60])
  const escala = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
  // #endregion

  // #region Renderizado
  return (
    <section ref={ref} className="grain relative overflow-hidden bg-vino py-24 text-hueso md:py-32">
      {/* Sello enorme de fondo. */}
      <m.img
        src="/logo-sello.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[38rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.08] md:w-[52rem]"
        style={{ rotate: giro, scale: escala }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center md:px-8">
        <RevealComponent>
          <p className="text-xs tracking-kicker text-acento">¿Te toca ya?</p>
          <h2 className="mt-5 font-display text-5xl font-bold leading-[1.02] sm:text-6xl md:text-7xl">
            Tu próximo corte,
            <span className="block italic text-acento">a un mensaje.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-hueso/75 sm:text-lg">
            {reservaEmpezada()
              ? 'Elige día y hora en un minuto, o escríbeme por WhatsApp y te guardo hueco.'
              : 'Escríbeme por WhatsApp, dime cuándo te viene bien y te guardo hueco. Así de fácil.'}
          </p>
        </RevealComponent>

        <RevealComponent delay={150} className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <MagneticComponent className="w-full sm:w-auto">
            <CitaButtonComponent tamano="lg" className="w-full sm:w-auto" />
          </MagneticComponent>
          <a
            href={`tel:${TELEFONO}`}
            className="al-tocar inline-flex w-full items-center justify-center gap-2.5 border border-hueso/30 px-8 py-4 text-sm font-medium uppercase tracking-widest text-hueso/90 hover:border-acento hover:text-acento sm:w-auto"
          >
            <Phone size={17} />
            {TELEFONO_VISIBLE}
          </a>
        </RevealComponent>

        <ReservaOnlineComponent claro className="mt-8" />
      </div>
    </section>
  )
  // #endregion
}

export default CtaFinalComponent

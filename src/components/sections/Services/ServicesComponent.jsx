// #region Imports
import { useState, useEffect } from 'react'
import { Clock, Repeat, Scissors, Sparkles } from 'lucide-react'
import SectionHeadingComponent from '../../core/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../core/Reveal/RevealComponent'
import TiltCardComponent from '../../core/TiltCard/TiltCardComponent'
import BookingButtonComponent from '../../core/BookingButton/BookingButtonComponent'
import OnlineBookingLinkComponent from '../../core/OnlineBookingLink/OnlineBookingLinkComponent'
import { useCountUp } from '../../../hooks/useCountUp'
import { PROMO } from '../../../data/services'
import { ICONS } from '../../../theme/icons'
import { ConfigurationService } from '../../../services/ConfigurationService'
// #endregion

/**
 * Listado de servicios con icono, descripción, duración y precio.
 * El destacado (el Corte) va en pizarra con su sello de "el más pedido" y la
 * oferta semanal; el resto, tarjetas claras. Con ratón, se inclinan un poco.
 * Los servicios se leen de Supabase (o del estático como fallback) y se
 * muestran solo los activos.
 */
const ServicesComponent = () => {
  // #region Declaraciones, variables y hooks
  const [servicios, setServicios] = useState([])
  const promoRef = useCountUp(PROMO.precio)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const ss = await ConfigurationService.getServicios()
      if (vivo) setServicios(ss.filter((s) => s.activo !== false))
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])
  // #endregion

  // #region Renderizado
  return (
    <section id="servicios" className="relative overflow-hidden bg-hueso py-24 md:py-32">
      {/* Sello gigante de marca de agua. */}
      <img
        src="/logo-sello.webp"
        alt=""
        aria-hidden="true"
        className="gira-lento pointer-events-none absolute -right-40 -top-40 w-[34rem] opacity-[0.04] md:w-[44rem]"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent
          kicker="La carta"
          titulo="Servicios y precios"
          texto="Precios claros, sin sorpresas. El corte lo incluye todo: cejas, barba y diseños."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {servicios.map((s, i) => {
            const Icono = ICONS[s.icono] || ICONS.Scissors
            const oscuro = s.destacado
            return (
              <RevealComponent key={s.id} delay={i * 90} className={oscuro ? 'md:col-span-2 lg:col-span-1' : ''}>
                <TiltCardComponent>
                  <article
                    className={`relative flex h-full flex-col p-7 transition-shadow duration-500 hover:shadow-2xl md:p-8 ${
                      oscuro
                        ? 'grain bg-tinta text-hueso shadow-xl shadow-tinta/25 ring-1 ring-acento/40'
                        : 'border border-hueso-200 bg-white text-tinta hover:shadow-tinta/10'
                    }`}
                  >
                    {oscuro && (
                      <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 bg-acento px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-tinta md:left-8">
                        <Sparkles size={12} strokeWidth={2.25} />
                        El más pedido
                      </span>
                    )}

                    <div className="mb-6 flex items-start justify-between">
                      <span
                        className={`flex h-14 w-14 items-center justify-center transition-colors duration-300 ${
                          oscuro
                            ? 'bg-acento text-tinta'
                            : 'bg-tinta text-acento group-hover/tilt:bg-acento group-hover/tilt:text-tinta'
                        }`}
                      >
                        <Icono size={24} strokeWidth={1.75} />
                      </span>
                      <span className="flex items-baseline gap-1 font-display font-bold leading-none">
                        <span className="text-5xl">{s.precio}</span>
                        <span className={`text-2xl ${oscuro ? 'text-acento' : 'text-tinta/50'}`}>€</span>
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold">{s.nombre}</h3>
                    <p className={`mt-3 flex-1 text-sm leading-relaxed ${oscuro ? 'text-hueso/70' : 'text-tinta/60'}`}>
                      {s.descripcion}
                    </p>

                    <p className={`mt-5 flex items-center gap-1.5 text-xs font-medium ${oscuro ? 'text-hueso/50' : 'text-tinta/45'}`}>
                      <Clock size={14} />
                      {s.duracion} min aprox.
                    </p>

                    {/* La oferta, justo donde se mira el precio y se decide.
                        Antes solo estaba en un banner al final, que mucha gente
                        no llegaba a ver. */}
                    {s.destacado && (
                      <p className="mt-5 flex items-center gap-2 border-t border-acento/30 pt-5 text-xs font-semibold uppercase tracking-widest text-acento">
                        <Repeat size={14} strokeWidth={2} />
                        {PROMO.precio} € si vienes cada semana
                      </p>
                    )}
                  </article>
                </TiltCardComponent>
              </RevealComponent>
            )
          })}
        </div>

        {/* Promo destacada. Es la oferta que más fideliza (un cliente semanal
            son unos 260 € al año), así que se le da peso de anuncio y su
            propio botón, en vez de dejarla como nota al pie. */}
        <RevealComponent className="mt-10" desde="escala">
          <div className="grain destello relative flex flex-col items-center gap-8 overflow-hidden bg-vino px-6 py-12 text-center text-hueso ring-1 ring-acento/30 md:flex-row md:justify-between md:px-14 md:py-14 md:text-left">
            {/* Tijeras gigantes de fondo. */}
            <Scissors
              aria-hidden="true"
              size={260}
              strokeWidth={0.6}
              className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 -rotate-12 text-acento/10"
            />

            <div className="relative z-[2]">
              <p className="text-xs tracking-kicker text-acento">{PROMO.titulo}</p>
              <p className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {PROMO.texto}
              </p>
            </div>

            <div className="relative z-[2] flex shrink-0 flex-col items-center gap-5">
              <span className="flex items-baseline gap-1 font-display font-bold leading-none text-acento">
                <span ref={promoRef} className="text-8xl md:text-9xl">
                  {PROMO.precio}
                </span>
                <span className="text-4xl">€</span>
              </span>
              <BookingButtonComponent texto="La quiero" />
            </div>
          </div>
        </RevealComponent>

        {/* Nota + CTA. */}
        <RevealComponent className="mt-14 flex flex-col items-center gap-5 text-center">
          <p className="font-display text-xl italic text-tinta/60">
            ¿No lo tienes claro? Escríbeme y lo vemos.
          </p>
          <BookingButtonComponent tamano="lg" />
          <OnlineBookingLinkComponent />
        </RevealComponent>
      </div>
    </section>
  )
  // #endregion
}

export default ServicesComponent

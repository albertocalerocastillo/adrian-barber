import { Clock } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import { SERVICIOS, PROMO } from '../../../data/servicios'
import { ICONOS } from '../../../theme/icons'

/**
 * Listado de servicios con icono, descripción, duración y precio.
 * Tarjetas claras sobre fondo hueso; las destacadas llevan borde de acento.
 */
export default function ServiciosComponent() {
  return (
    <section id="servicios" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="La carta" titulo="Servicios" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => {
            const Icono = ICONOS[s.icono] || ICONOS.Scissors
            return (
              <RevealComponent key={s.id} delay={i * 70}>
                <article
                  className={`group flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta/5 ${
                    s.destacado ? 'border-acento/40' : 'border-hueso-200'
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tinta text-acento transition-colors group-hover:bg-acento group-hover:text-tinta">
                      <Icono size={22} strokeWidth={1.75} />
                    </span>
                    <span className="font-display text-2xl font-bold text-tinta">
                      {s.precio} €
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-tinta">
                    {s.nombre}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-tinta/60">
                    {s.descripcion}
                  </p>

                  <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-tinta/50">
                    <Clock size={14} />
                    {s.duracion} min
                  </p>
                </article>
              </RevealComponent>
            )
          })}
        </div>

        {/* Promo destacada */}
        <RevealComponent className="mt-6">
          <div className="grain flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-tinta px-6 py-8 text-center text-hueso sm:flex-row sm:justify-between sm:text-left">
            <div className="relative">
              <p className="text-xs tracking-kicker text-acento">{PROMO.titulo}</p>
              <p className="mt-2 max-w-md font-display text-xl font-semibold sm:text-2xl">
                {PROMO.texto}
              </p>
            </div>
            <span className="relative flex shrink-0 items-baseline gap-1 font-display text-5xl font-bold text-acento">
              {PROMO.precio}
              <span className="text-2xl">€</span>
            </span>
          </div>
        </RevealComponent>

        {/* Nota + CTA */}
        <RevealComponent className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-tinta/50">
            ¿No lo tienes claro? Escríbeme y lo vemos.
          </p>
          <CitaButtonComponent tamano="lg" />
        </RevealComponent>
      </div>
    </section>
  )
}

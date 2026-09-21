import { useState, useEffect } from 'react'
import { Clock, Repeat } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import { PROMO } from '../../../data/servicios'
import { getServicios } from '../../../lib/config'
import { ICONOS } from '../../../theme/icons'

/**
 * Listado de servicios con icono, descripción, duración y precio.
 * Tarjetas claras sobre fondo hueso; las destacadas llevan borde de acento.
 * Los servicios se leen de Supabase (o del estático como fallback) y se
 * muestran solo los activos.
 */
export default function ServiciosComponent() {
  const [servicios, setServicios] = useState([])

  useEffect(() => {
    let vivo = true
    getServicios().then((ss) => {
      if (vivo) setServicios(ss.filter((s) => s.activo !== false))
    })
    return () => {
      vivo = false
    }
  }, [])

  return (
    <section id="servicios" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="La carta" titulo="Servicios" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s, i) => {
            const Icono = ICONOS[s.icono] || ICONOS.Scissors
            return (
              <RevealComponent key={s.id} delay={i * 70}>
                <article
                  className={`group flex h-full flex-col border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tinta/5 ${
                    s.destacado ? 'border-acento/40' : 'border-hueso-200'
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center bg-tinta text-acento transition-colors group-hover:bg-acento group-hover:text-tinta">
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

                  {/* La oferta, justo donde se mira el precio y se decide.
                      Antes solo estaba en un banner al final, que mucha gente
                      no llegaba a ver. */}
                  {s.destacado && (
                    <p className="mt-4 flex items-center gap-2 border-t border-acento/30 pt-4 text-xs font-semibold uppercase tracking-widest text-acento">
                      <Repeat size={14} strokeWidth={2} />
                      {PROMO.precio} € si vienes cada semana
                    </p>
                  )}
                </article>
              </RevealComponent>
            )
          })}
        </div>

        {/* Promo destacada. Es la oferta que más fideliza (un cliente semanal
            son unos 260 € al año), así que se le da peso de anuncio y su
            propio botón, en vez de dejarla como nota al pie. */}
        <RevealComponent className="mt-8">
          <div className="grain flex flex-col items-center gap-7 overflow-hidden bg-vino px-6 py-10 text-center text-hueso ring-1 ring-acento/30 md:flex-row md:justify-between md:px-12 md:py-12 md:text-left">
            <div className="relative">
              <p className="text-xs tracking-kicker text-acento">{PROMO.titulo}</p>
              <p className="mt-3 max-w-md font-display text-2xl font-semibold sm:text-3xl">
                {PROMO.texto}
              </p>
            </div>

            <div className="relative flex shrink-0 flex-col items-center gap-4">
              <span className="flex items-baseline gap-1 font-display text-7xl font-bold leading-none text-acento">
                {PROMO.precio}
                <span className="text-3xl">€</span>
              </span>
              <CitaButtonComponent texto="La quiero" />
            </div>
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

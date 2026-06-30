import { Scissors, Award, Heart } from 'lucide-react'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import { NEGOCIO, INSTAGRAM, INSTAGRAM_URL } from '../../../data/contacto'

const VALORES = [
  { icono: Scissors, titulo: 'Oficio', texto: 'Técnica cuidada en cada corte, sin prisas.' },
  { icono: Award, titulo: 'Detalle', texto: 'El acabado importa: barba, perfilado y remate.' },
  { icono: Heart, titulo: 'Cercanía', texto: 'Ambiente de barrio, trato de siempre.' },
]

/**
 * Presentación del barbero. Foto a un lado, texto e ideas clave al otro.
 * Fondo tinta (oscuro) para contraste con las secciones claras.
 */
export default function SobreMiComponent() {
  return (
    <section id="sobre-mi" className="pizarra bg-tinta py-20 text-hueso md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        {/* Foto */}
        <RevealComponent className="order-1 md:order-none">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=80"
              alt={`${NEGOCIO.barbero}, barbero`}
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            {/* Marco de acento */}
            <span className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 rounded-br-2xl border-b-2 border-r-2 border-acento" />
          </div>
        </RevealComponent>

        {/* Texto */}
        <div>
          <RevealComponent>
            <p className="mb-3 text-xs tracking-kicker text-acento">Sobre mí</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              Hola, soy Adrián
            </h2>
            <span className="mt-5 block h-px w-16 bg-acento" />
          </RevealComponent>

          <RevealComponent delay={100}>
            <p className="mt-6 text-base leading-relaxed text-hueso/75">
              Barbero en {NEGOCIO.localidad}. Me gusta el corte clásico tanto
              como las tendencias, pero sobre todo me gusta que salgas de la
              silla con la cabeza alta. Aquí no hay líneas de montaje: hay tiempo,
              conversación y trabajo bien hecho.
            </p>
          </RevealComponent>

          {/* Valores */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {VALORES.map((v, i) => (
              <RevealComponent key={v.titulo} delay={150 + i * 80}>
                <div className="rounded-xl border border-tinta-700 bg-tinta-800 p-4">
                  <v.icono size={20} className="text-acento" strokeWidth={1.75} />
                  <h3 className="mt-3 font-display text-base font-semibold">
                    {v.titulo}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-hueso/55">
                    {v.texto}
                  </p>
                </div>
              </RevealComponent>
            ))}
          </div>

          <RevealComponent delay={400}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 text-sm font-medium text-hueso/80 transition-colors hover:text-acento"
            >
              <InstagramIcon size={18} />
              Sígueme en @{INSTAGRAM}
            </a>
          </RevealComponent>
        </div>
      </div>
    </section>
  )
}

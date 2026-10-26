import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import { NEGOCIO, LEGAL, TELEFONO_VISIBLE, WHATSAPP } from '../../../data/contacto'

const PAGINAS = {
  'aviso-legal': { titulo: 'Aviso legal', Contenido: AvisoLegal },
  privacidad: { titulo: 'Política de privacidad', Contenido: Privacidad },
  cookies: { titulo: 'Política de cookies', Contenido: Cookies },
}

/**
 * Páginas legales: aviso legal (LSSI), privacidad (RGPD) y cookies.
 * Los datos del titular salen de LEGAL (data/contacto.js), para cambiarlos
 * en un solo sitio. Están escritas en claro, sin jerga, y describen lo que
 * la web hace DE VERDAD (si algún día se añade analítica o publicidad, hay
 * que actualizarlas y poner un aviso de cookies).
 */
export default function LegalComponent({ tipo }) {
  const { titulo, Contenido } = PAGINAS[tipo]

  useEffect(() => {
    const anterior = document.title
    document.title = `${titulo} · ${NEGOCIO.nombreCompleto}`
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      document.title = anterior
    }
  }, [titulo])

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="pizarra border-b border-acento/15">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label="Volver al inicio">
            <LogoAdriComponent variante="monograma" className="h-9 w-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento">
            <ArrowLeft size={16} /> Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <p className="text-xs tracking-kicker text-acento-oscuro">Información legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{titulo}</h1>
        <p className="mt-3 text-sm text-tinta/45">Última actualización: {LEGAL.actualizado}</p>

        <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed text-tinta/75 [&_a]:font-medium [&_a]:text-acento-oscuro [&_a]:underline [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-tinta [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1.5">
          <Contenido />
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-hueso-200 pt-6 text-sm" aria-label="Otras páginas legales">
          {Object.entries(PAGINAS)
            .filter(([clave]) => clave !== tipo)
            .map(([clave, p]) => (
              <Link key={clave} to={`/${clave}`} className="text-tinta/55 hover:text-acento-oscuro">
                {p.titulo}
              </Link>
            ))}
        </nav>
      </main>
    </div>
  )
}

/** Cómo contactar con el titular (email si lo hay, y siempre WhatsApp/teléfono). */
function Contacto() {
  return (
    <>
      {LEGAL.email && (
        <>
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>,{' '}
        </>
      )}
      por WhatsApp o teléfono al{' '}
      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
        {TELEFONO_VISIBLE}
      </a>
      , o en persona en la barbería
    </>
  )
}

function Titular() {
  return (
    <ul>
      <li>
        <strong>Titular:</strong> {LEGAL.titular}
      </li>
      {LEGAL.nif && (
        <li>
          <strong>NIF:</strong> {LEGAL.nif}
        </li>
      )}
      <li>
        <strong>Domicilio:</strong> {LEGAL.domicilio}
      </li>
      {LEGAL.email && (
        <li>
          <strong>Email:</strong> <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </li>
      )}
      <li>
        <strong>Teléfono y WhatsApp:</strong> {TELEFONO_VISIBLE}
      </li>
      <li>
        <strong>Actividad:</strong> peluquería y barbería ({NEGOCIO.nombreCompleto})
      </li>
    </ul>
  )
}

function AvisoLegal() {
  return (
    <>
      <section>
        <h2>Quién está detrás de esta web</h2>
        <p>
          En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información (LSSI), estos son los
          datos del titular de la web:
        </p>
        <Titular />
      </section>

      <section>
        <h2>Para qué sirve esta web</h2>
        <p>
          Informar sobre los servicios, precios, horario y ubicación de la barbería, y permitir pedir cita. La web no
          vende nada: los servicios se pagan en el local.
        </p>
      </section>

      <section>
        <h2>Reservas online</h2>
        <ul>
          <li>Reservar es gratis y no obliga a nada más que a venir a la hora elegida.</li>
          <li>Si no puedes venir, avisa cuanto antes por WhatsApp o teléfono para que el hueco quede libre.</li>
          <li>
            Las reservas con datos falsos, o que se repiten sin aparecer, se pueden anular sin aviso para no
            bloquear la agenda a otros clientes.
          </li>
          <li>Los precios que se muestran son los vigentes; si cambian, se aplica el precio del día de la cita.</li>
        </ul>
      </section>

      <section>
        <h2>Uso de la web</h2>
        <p>
          Al usar esta web te comprometes a hacerlo de buena fe: no intentar dañarla, saturarla con reservas
          automáticas ni acceder a zonas restringidas (como el panel del barbero). El titular puede bloquear el acceso
          a quien lo haga.
        </p>
      </section>

      <section>
        <h2>Propiedad intelectual</h2>
        <p>
          El logotipo, las fotografías de los trabajos y los textos son de {LEGAL.titular} o se usan con permiso. No
          se pueden copiar ni usar con fines comerciales sin autorización.
        </p>
      </section>

      <section>
        <h2>Responsabilidad y enlaces</h2>
        <p>
          Se procura que la información (precios, horario) esté siempre al día, pero puede haber errores puntuales:
          ante la duda, confírmalo por WhatsApp. Los enlaces a otras webs (Instagram, Google Maps) llevan a servicios
          de terceros, de los que la barbería no es responsable.
        </p>
      </section>

      <section>
        <h2>Ley aplicable</h2>
        <p>
          Esta web se rige por la ley española. Para cualquier conflicto, serán competentes los juzgados y
          tribunales que correspondan según la normativa de consumidores.
        </p>
      </section>
    </>
  )
}

function Privacidad() {
  return (
    <>
      <section>
        <h2>Responsable de tus datos</h2>
        <Titular />
      </section>

      <section>
        <h2>Qué datos recogemos y para qué</h2>
        <ul>
          <li>
            <strong>Si reservas online:</strong> tu nombre, tu móvil, el servicio y el día y la hora de la cita. Solo
            para gestionar tu cita y avisarte si hay algún cambio.
          </li>
          <li>
            <strong>Si escribes por WhatsApp o llamas:</strong> lo que tú nos cuentes, para darte cita o responderte.
          </li>
          <li>
            No usamos tus datos para publicidad, no los vendemos y no creamos perfiles. Esta web no tiene analítica ni
            rastreadores.
          </li>
        </ul>
      </section>

      <section>
        <h2>Por qué podemos tratarlos (base legal)</h2>
        <p>
          Porque nos los das para pedir cita: tratarlos es necesario para darte el servicio que solicitas (artículo
          6.1.b del Reglamento General de Protección de Datos).
        </p>
      </section>

      <section>
        <h2>Cuánto tiempo los guardamos</h2>
        <p>
          El tiempo necesario para gestionar tu cita y llevar el historial de clientes de la barbería. Puedes pedir
          que se borren cuando quieras.
        </p>
      </section>

      <section>
        <h2>Quién más los ve</h2>
        <p>Nadie aparte de {LEGAL.titular}. Para que la web funcione se usan estos proveedores, que solo los guardan o transmiten por cuenta de la barbería:</p>
        <ul>
          <li>
            <strong>Supabase</strong>: base de datos donde se guardan las citas.
          </li>
          <li>
            <strong>Vercel</strong>: alojamiento de la web. Puede tratar datos técnicos (como la IP) fuera de la UE,
            con las garantías que exige la normativa europea.
          </li>
          <li>
            <strong>CallMeBot</strong> (si está activado): servicio que avisa al barbero por WhatsApp de cada
            reserva nueva (recibe tu nombre, móvil y la hora de la cita).
          </li>
          <li>
            <strong>Google Maps</strong>: solo si pulsas «Ver mapa». Hasta entonces no se carga nada de Google.
          </li>
        </ul>
      </section>

      <section>
        <h2>Tus derechos</h2>
        <p>
          Puedes pedir ver tus datos, corregirlos, borrarlos, oponerte a que se usen, limitar su uso o llevártelos.
          Escríbenos: <Contacto />. Si crees que no se han respetado tus derechos, puedes reclamar ante la Agencia
          Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            aepd.es
          </a>
          ).
        </p>
      </section>
    </>
  )
}

function Cookies() {
  return (
    <>
      <section>
        <h2>Resumen</h2>
        <p>
          Esta web <strong>no usa cookies de analítica, publicidad ni seguimiento</strong>. Por eso no te sale ningún
          aviso de cookies al entrar: no hay nada que aceptar.
        </p>
      </section>

      <section>
        <h2>Lo único que se guarda en tu navegador</h2>
        <ul>
          <li>
            <strong>Sesión del panel del barbero</strong> (almacenamiento local): solo si inicias sesión en el panel
            privado, para que no tengas que entrar cada vez. Es técnico y necesario, y no afecta a los clientes.
          </li>
        </ul>
        <p>Las tipografías y las imágenes se sirven desde la propia web, sin conectar con Google ni con otros.</p>
      </section>

      <section>
        <h2>Google Maps</h2>
        <p>
          El mapa de «Dónde estamos» no se carga hasta que pulsas «Ver mapa». Al hacerlo, Google puede instalar sus
          propias cookies y recibir tu IP, según su{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            política de cookies
          </a>
          . Si prefieres no cargarlo, usa el botón «Cómo llegar», que abre Google Maps aparte.
        </p>
      </section>

      <section>
        <h2>Enlaces a redes</h2>
        <p>
          Los botones de Instagram y WhatsApp son enlaces normales: no cargan nada de esos servicios hasta que los
          pulsas.
        </p>
      </section>
    </>
  )
}

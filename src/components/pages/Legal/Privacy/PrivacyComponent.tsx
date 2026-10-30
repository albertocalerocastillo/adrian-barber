// #region Imports
import type { FunctionComponent } from 'react'
import OwnerDetailsComponent from '../OwnerDetails/OwnerDetailsComponent'
import OwnerContactComponent from '../OwnerContact/OwnerContactComponent'
import { LEGAL } from '../../../../data/contact'
// #endregion

/** Política de privacidad (RGPD): qué datos se recogen, para qué y tus derechos. */
const PrivacyComponent: FunctionComponent = () => {
  // #region Renderizado
  return (
    <>
      <section>
        <h2>Responsable de tus datos</h2>
        <OwnerDetailsComponent />
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
          Escríbenos: <OwnerContactComponent />. Si crees que no se han respetado tus derechos, puedes reclamar ante la Agencia
          Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            aepd.es
          </a>
          ).
        </p>
      </section>
    </>
  )
  // #endregion
}

export default PrivacyComponent

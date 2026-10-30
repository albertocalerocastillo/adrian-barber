// #region Imports
import type { FunctionComponent } from 'react'
// #endregion

/** Política de cookies: lo que la web guarda en el navegador (casi nada). */
const CookiesComponent: FunctionComponent = () => {
  // #region Renderizado
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
  // #endregion
}

export default CookiesComponent

// #region Imports
import type { FunctionComponent } from 'react'
import { NEGOCIO, LEGAL, TELEFONO_VISIBLE } from '../../../../data/contact'
// #endregion

/** Datos del titular de la web (los que pide la LSSI). */
const OwnerDetailsComponent: FunctionComponent = () => {
  // #region Renderizado
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
  // #endregion
}

export default OwnerDetailsComponent

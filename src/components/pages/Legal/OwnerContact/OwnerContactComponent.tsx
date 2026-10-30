// #region Imports
import type { FunctionComponent } from 'react'
import { LEGAL, TELEFONO_VISIBLE, WHATSAPP } from '../../../../data/contact'
// #endregion

/** Cómo contactar con el titular (email si lo hay, y siempre WhatsApp/teléfono). */
const OwnerContactComponent: FunctionComponent = () => {
  // #region Renderizado
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
  // #endregion
}

export default OwnerContactComponent

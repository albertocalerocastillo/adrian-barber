// #region Imports
import type { FunctionComponent } from 'react'
import OwnerDetailsComponent from '../OwnerDetails/OwnerDetailsComponent'
import { LEGAL } from '../../../../data/contact'
// #endregion

/** Aviso legal (LSSI): quién está detrás de la web y las condiciones de uso. */
const LegalNoticeComponent: FunctionComponent = () => {
  // #region Renderizado
  return (
    <>
      <section>
        <h2>Quién está detrás de esta web</h2>
        <p>
          En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información (LSSI), estos son los
          datos del titular de la web:
        </p>
        <OwnerDetailsComponent />
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
  // #endregion
}

export default LegalNoticeComponent

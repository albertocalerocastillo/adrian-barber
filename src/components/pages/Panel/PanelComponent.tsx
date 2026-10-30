// #region Imports
import { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import BrandLogoComponent from '../../core/BrandLogo/BrandLogoComponent'
import LoginComponent from './Login/LoginComponent'
import DesktopComponent from './Desktop/DesktopComponent'
import ToastProviderComponent from './Toast/ToastProviderComponent'
import { AuthenticationService } from '../../../services/AuthenticationService'
// #endregion

// #region Constantes
// Título de la pestaña mientras se está en el panel.
const TITULO_PANEL = 'Panel · A.S Barbería'

// Etiqueta robots del panel: que no salga en Google.
const SELECTOR_META_ROBOTS = 'meta[name="robots"]'
const ROBOTS_PANEL = 'noindex, nofollow'
// #endregion

/** Resultado de comprobar si la cuenta con sesión es de un barbero. */
interface PermisoPanel {
  /** Usuario comprobado (id o email); null si aún no se ha comprobado ninguno. */
  usuario: string | null;
  /** Si es barbero; null mientras se comprueba. */
  ok: boolean | null;
}

/**
 * Panel del barbero (/admin). Sin sesión → acceso. Con sesión → agenda,
 * horario y servicios.
 *
 * Pensado sobre todo para el MÓVIL, entre cliente y cliente: en el móvil la
 * navegación va abajo, al alcance del pulgar, como en cualquier app; en
 * pantallas grandes, en una barra lateral.
 *
 * Las tres pantallas se quedan montadas (solo se ocultan): si Adrián está
 * cambiando el horario y salta a la agenda a mirar algo, al volver sigue
 * todo como lo dejó.
 */
const PanelComponent: FunctionComponent = () => {
  // #region Declaraciones, variables y hooks
  const { sesion, cargando } = useAuth()
  // Con ok a null se está comprobando; se guarda junto al usuario comprobado para no
  // arrastrar el resultado de otra sesión.
  const [permiso, setPermiso] = useState<PermisoPanel>({ usuario: null, ok: null })
  const usuario = sesion?.user?.id ?? sesion?.user?.email ?? null

  useEffect(() => {
    if (!usuario) return
    let vivo = true
    const comprobar = async () => {
      const ok = await AuthenticationService.esBarbero()
      if (vivo) setPermiso({ usuario, ok })
    }
    comprobar()
    return () => {
      vivo = false
    }
  }, [usuario])

  // El panel no debe salir en Google.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(SELECTOR_META_ROBOTS)
    const anterior = meta?.content ?? ''
    if (meta) meta.content = ROBOTS_PANEL
    const titulo = document.title
    document.title = TITULO_PANEL
    return () => {
      if (meta) meta.content = anterior
      document.title = titulo
    }
  }, [])

  const comprobando = Boolean(usuario) && permiso.usuario !== usuario
  // #endregion

  // #region Renderizado
  if (cargando || comprobando) {
    return (
      <div className="grain flex min-h-screen items-center justify-center bg-tinta-900">
        <BrandLogoComponent className="h-24 w-24 animate-pulse" />
      </div>
    )
  }

  if (!sesion) return <LoginComponent />

  // Sesión iniciada, pero la cuenta no está en la lista de barberos: la BD no
  // le enseña nada, así que se le dice claro en vez de mostrar un panel vacío.
  if (!permiso.ok) {
    return (
      <div className="grain flex min-h-screen flex-col items-center justify-center bg-tinta-900 px-6 text-center text-hueso">
        <BrandLogoComponent className="h-24 w-24" />
        <h1 className="mt-6 font-display text-3xl font-bold">Esta cuenta no tiene acceso</h1>
        <p className="mt-3 max-w-sm text-hueso/60">
          {sesion.user?.email} no está autorizada para usar el panel. Si es tuya, pide que la añadan.
        </p>
        <button
          type="button"
          onClick={AuthenticationService.logout}
          className="mt-8 rounded-full bg-acento px-6 py-3 font-semibold text-tinta transition-colors hover:bg-acento-claro"
        >
          Salir
        </button>
      </div>
    )
  }

  return (
    <ToastProviderComponent>
      <DesktopComponent email={sesion.user?.email} />
    </ToastProviderComponent>
  )
  // #endregion
}

export default PanelComponent

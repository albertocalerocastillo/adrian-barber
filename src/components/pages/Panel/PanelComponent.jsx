// #region Imports
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Scissors, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import BrandLogoComponent from '../../core/BrandLogo/BrandLogoComponent'
import LoginComponent from './Login/LoginComponent'
import AgendaComponent from './Agenda/AgendaComponent'
import ScheduleSettingsComponent from './ScheduleSettings/ScheduleSettingsComponent'
import ServiceSettingsComponent from './ServiceSettings/ServiceSettingsComponent'
import ToastProviderComponent from './Toast/ToastProviderComponent'
import { AuthenticationService } from '../../../services/AuthenticationService'
import { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'
// #endregion

const SECCIONES = [
  { id: 'agenda', texto: 'Agenda', Icono: CalendarDays },
  { id: 'horario', texto: 'Horario', Icono: Clock },
  { id: 'servicios', texto: 'Servicios', Icono: Scissors },
]

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
const PanelComponent = () => {
  // #region Declaraciones, variables y hooks
  const { sesion, cargando } = useAuth()
  // Con ok a null se está comprobando; se guarda junto al usuario comprobado para no
  // arrastrar el resultado de otra sesión.
  const [permiso, setPermiso] = useState({ usuario: null, ok: null })
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
    const meta = document.querySelector('meta[name="robots"]')
    const anterior = meta?.content
    if (meta) meta.content = 'noindex, nofollow'
    const titulo = document.title
    document.title = 'Panel · A.S Barbería'
    return () => {
      if (meta) meta.content = anterior
      document.title = titulo
    }
  }, [])

  const comprobando = usuario && permiso.usuario !== usuario

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
  // #endregion

  // #region Renderizado
  return (
    <ToastProviderComponent>
      <Escritorio email={sesion.user?.email} />
    </ToastProviderComponent>
  )
  // #endregion
}

const Escritorio = ({ email }) => {
  const [pantalla, setPantalla] = useState('agenda')

  const ir = (id) => {
    setPantalla(id)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Al volver a una pantalla, su contenido entra con un fundido (la clase se
  // pone al mostrarla: la animación se repite cada vez).
  const seccion = (id) => ({
    hidden: pantalla !== id,
    className: pantalla === id ? 'panel-entra' : '',
  })

  return (
    <div className="min-h-screen bg-hueso pb-24 text-tinta lg:grid lg:grid-cols-[16rem_1fr] lg:pb-0">
      {/* ── Barra lateral (escritorio) ── */}
      <aside className="pizarra sticky top-0 hidden h-screen flex-col justify-between p-6 text-hueso lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogoComponent className="h-14 w-14" />
            <div>
              <p className="font-display text-lg font-bold leading-tight">A.S Barbería</p>
              <p className="text-[0.65rem] tracking-kicker text-acento">Panel</p>
            </div>
          </div>

          <nav className="mt-10 flex flex-col gap-1" aria-label="Secciones del panel">
            {SECCIONES.map(({ id, texto, Icono }) => {
              const activa = pantalla === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => ir(id)}
                  aria-current={activa ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                    activa ? 'bg-acento text-tinta shadow-lg shadow-acento/20' : 'text-hueso/70 hover:bg-white/5 hover:text-hueso'
                  }`}
                >
                  <Icono size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  {texto}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-1 border-t border-white/10 pt-5 text-sm">
          {email && <p className="mb-3 truncate px-4 text-xs text-hueso/40">{email}</p>}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-hueso/60 transition-colors hover:bg-white/5 hover:text-hueso"
          >
            <ExternalLink size={16} /> Ver la web
          </Link>
          <button
            type="button"
            onClick={AuthenticationService.logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-hueso/60 transition-colors hover:bg-white/5 hover:text-hueso"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* ── Cabecera (móvil y tablet) ── */}
        <header className="pizarra sticky top-0 z-30 border-b border-acento/15 text-hueso lg:hidden">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <BrandLogoComponent variant={BrandLogoVariantEnum.Monogram} className="h-8 w-auto" />
              <span className="h-5 w-px bg-white/15" />
              <span className="text-[0.65rem] tracking-kicker text-acento">Panel</span>
            </div>

            {/* En tablet hay sitio para las secciones arriba. */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Secciones del panel">
              {SECCIONES.map(({ id, texto, Icono }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => ir(id)}
                  aria-current={pantalla === id ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    pantalla === id ? 'bg-acento font-semibold text-tinta' : 'text-hueso/70 hover:text-hueso'
                  }`}
                >
                  <Icono size={16} /> {texto}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={AuthenticationService.logout}
              aria-label="Salir"
              className="-mr-2 flex h-11 items-center gap-2 rounded-full px-3 text-sm text-hueso/65 transition-colors hover:text-acento"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
          <div {...seccion('agenda')}>
            <AgendaComponent activa={pantalla === 'agenda'} />
          </div>
          <div {...seccion('horario')}>
            <ScheduleSettingsComponent activa={pantalla === 'horario'} />
          </div>
          <div {...seccion('servicios')}>
            <ServiceSettingsComponent activa={pantalla === 'servicios'} />
          </div>
        </main>
      </div>

      {/* ── Navegación del móvil: abajo, al alcance del pulgar ── */}
      <nav
        aria-label="Secciones del panel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-acento/15 bg-tinta-900/95 pb-[env(safe-area-inset-bottom)] text-hueso/60 backdrop-blur-md md:hidden"
      >
        {SECCIONES.map(({ id, texto, Icono }) => {
          const activa = pantalla === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => ir(id)}
              aria-current={activa ? 'page' : undefined}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors duration-300 active:bg-white/5 ${
                activa ? 'text-acento' : ''
              }`}
            >
              <span className="relative">
                {/* Pastilla detrás del icono activo, que crece al elegirlo. */}
                <span
                  className={`absolute -inset-x-4 -inset-y-1 rounded-full bg-acento/15 transition-all duration-300 ease-[var(--ease-suave)] ${
                    activa ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                />
                <Icono size={22} className={`relative transition-transform duration-300 ${activa ? '-translate-y-0.5' : ''}`} />
              </span>
              {texto}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default PanelComponent

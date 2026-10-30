// #region Imports
import { useState } from 'react'
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Scissors, LogOut, ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import BrandLogoComponent from '../../../core/BrandLogo/BrandLogoComponent'
import AgendaComponent from '../Agenda/AgendaComponent'
import ScheduleSettingsComponent from '../ScheduleSettings/ScheduleSettingsComponent'
import ServiceSettingsComponent from '../ServiceSettings/ServiceSettingsComponent'
import { AuthenticationService } from '../../../../services/AuthenticationService'
import { BrandLogoVariantEnum } from '../../../../services/enums/BrandLogoVariantEnum'
import { PantallaPanelEnum } from '../../../../services/enums/PantallaPanelEnum'
import type { IDesktopProps } from './IDesktopProps'
// #endregion

/** Entrada de la navegación del panel. */
interface SeccionPanel {
  /** Pantalla a la que lleva. */
  id: PantallaPanelEnum;
  /** Texto del botón. */
  texto: string;
  /** Icono del botón. */
  Icono: LucideIcon;
}

// #region Constantes
// Secciones del panel, en el orden de la navegación.
const SECCIONES: SeccionPanel[] = [
  { id: PantallaPanelEnum.Agenda, texto: 'Agenda', Icono: CalendarDays },
  { id: PantallaPanelEnum.Horario, texto: 'Horario', Icono: Clock },
  { id: PantallaPanelEnum.Servicios, texto: 'Servicios', Icono: Scissors },
]

// Clase que hace entrar con un fundido la pantalla que se muestra.
const CLASE_ENTRADA = 'panel-entra'
// #endregion

/**
 * Escritorio del panel con sesión: barra lateral (escritorio), cabecera
 * (móvil y tablet), las tres pantallas y la navegación de abajo del móvil.
 */
const DesktopComponent: FunctionComponent<IDesktopProps> = ({ email }) => {
  // #region Declaraciones, variables y hooks
  const [pantalla, setPantalla] = useState<PantallaPanelEnum>(PantallaPanelEnum.Agenda)

  const ir = (id: PantallaPanelEnum) => {
    setPantalla(id)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Al volver a una pantalla, su contenido entra con un fundido (la clase se
  // pone al mostrarla: la animación se repite cada vez).
  const seccion = (id: PantallaPanelEnum) => ({
    hidden: pantalla !== id,
    className: pantalla === id ? CLASE_ENTRADA : '',
  })
  // #endregion

  // #region Renderizado
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
          <div {...seccion(PantallaPanelEnum.Agenda)}>
            <AgendaComponent activa={pantalla === PantallaPanelEnum.Agenda} />
          </div>
          <div {...seccion(PantallaPanelEnum.Horario)}>
            <ScheduleSettingsComponent activa={pantalla === PantallaPanelEnum.Horario} />
          </div>
          <div {...seccion(PantallaPanelEnum.Servicios)}>
            <ServiceSettingsComponent activa={pantalla === PantallaPanelEnum.Servicios} />
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
  // #endregion
}

export default DesktopComponent

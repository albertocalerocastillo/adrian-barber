import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useScrolled } from '../../../hooks/useScrolled'
import LogoAdriComponent from '../../ui/LogoAdri/LogoAdriComponent'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'

const ENLACES = [
  { href: '#servicios', texto: 'Servicios' },
  { href: '#galeria', texto: 'Galería' },
  { href: '#sobre-mi', texto: 'Sobre mí' },
  { href: '#horario', texto: 'Horario' },
  { href: '#ubicacion', texto: 'Dónde estamos' },
]

/**
 * Barra de navegación fija.
 * Transparente sobre el hero; al hacer scroll se vuelve sólida (tinta) con
 * blur. Menú lateral en móvil.
 */
export default function NavComponent() {
  const scrolled = useScrolled(40)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const cerrar = () => setMenuAbierto(false)

  return (
    <header
      className={`pizarra fixed inset-x-0 top-0 z-40 border-b border-acento/15 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/40' : ''
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
        {/* Logo */}
        <a href="#inicio" className="shrink-0" aria-label="Inicio">
          <LogoAdriComponent className="h-12 w-12" />
        </a>

        {/* Enlaces escritorio */}
        <ul className="hidden items-center gap-8 md:flex">
          {ENLACES.map((e) => (
            <li key={e.href}>
              <a
                href={e.href}
                className="text-sm font-medium text-hueso/80 transition-colors hover:text-acento"
              >
                {e.texto}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA escritorio */}
        <div className="hidden md:block">
          <CitaButtonComponent />
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className="text-hueso md:hidden"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuAbierto ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      <div
        className={`overflow-hidden bg-tinta/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden ${
          menuAbierto ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 pb-5 pt-1">
          {ENLACES.map((e) => (
            <li key={e.href}>
              <a
                href={e.href}
                onClick={cerrar}
                className="block rounded-lg px-3 py-3 text-base font-medium text-hueso/85 transition-colors hover:bg-tinta-800 hover:text-acento"
              >
                {e.texto}
              </a>
            </li>
          ))}
          <li className="mt-2 px-1">
            <CitaButtonComponent className="w-full" />
          </li>
        </ul>
      </div>
    </header>
  )
}

// #region Imports
import { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X, Phone, MapPin } from 'lucide-react'
import BrandLogoComponent from '../../core/BrandLogo/BrandLogoComponent'
import BookingButtonComponent from '../../core/BookingButton/BookingButtonComponent'
import InstagramIconComponent from '../../core/InstagramIcon/InstagramIconComponent'
import { EASE_SMOOTH } from '../../../theme/animation'
import {
  NEGOCIO,
  TELEFONO,
  TELEFONO_VISIBLE,
  INSTAGRAM,
  INSTAGRAM_URL,
} from '../../../data/contact'
import { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'
import { ButtonSizeEnum } from '../../../services/enums/ButtonSizeEnum'
// #endregion

// #region Constantes
const ENLACES = [
  { href: '#servicios', texto: 'Servicios' },
  { href: '#galeria', texto: 'Galería' },
  { href: '#sobre-mi', texto: 'Sobre mí' },
  { href: '#resenas', texto: 'Reseñas' },
  { href: '#horario', texto: 'Horario' },
  { href: '#ubicacion', texto: 'Dónde estamos' },
]

// Píxeles de scroll a partir de los que la barra se vuelve sólida.
const UMBRAL_SOLIDA = 40
// Píxeles de scroll a partir de los que la barra se esconde al bajar.
const UMBRAL_OCULTA = 500
// Margen de scroll para no reaccionar a temblores.
const MARGEN_SCROLL = 4
// #endregion

/**
 * Barra de navegación fija.
 *  - Arriba del todo es transparente y deja respirar al hero; al bajar se
 *    vuelve pizarra sólida y más compacta.
 *  - Al bajar se esconde (más pantalla para el contenido) y al subir vuelve,
 *    que es justo cuando el usuario busca el menú.
 *  - En móvil y tablet, menú a pantalla completa con los enlaces escalonados.
 */
const NavComponent: FunctionComponent = () => {
  // #region Declaraciones, variables y hooks
  const { scrollY } = useScroll()
  const [solida, setSolida] = useState<boolean>(false)
  const [oculta, setOculta] = useState<boolean>(false)
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const anterior = scrollY.getPrevious() ?? 0
    setSolida(y > UMBRAL_SOLIDA)
    setOculta(y > UMBRAL_OCULTA && y > anterior + MARGEN_SCROLL)
    if (y < anterior - MARGEN_SCROLL) setOculta(false)
  })

  // Con el menú abierto, la página de debajo no debe moverse.
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuAbierto])

  const cerrar = () => setMenuAbierto(false)
  // #endregion

  // #region Renderizado
  return (
    <>
      <m.header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          solida || menuAbierto
            ? 'border-b border-acento/15 bg-tinta-900/90 shadow-lg shadow-black/30 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
        animate={{ y: oculta && !menuAbierto ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-[padding] duration-500 md:px-8 ${
            solida ? 'py-2.5' : 'py-4 lg:py-5'
          }`}
        >
          {/* Logo. */}
          <a href="#inicio" className="al-tocar shrink-0" aria-label="Inicio" onClick={cerrar}>
            <BrandLogoComponent
              variant={BrandLogoVariantEnum.Monogram}
              className={`w-auto transition-[height] duration-500 ${solida ? 'h-9' : 'h-10 lg:h-12'}`}
            />
          </a>

          {/* Enlaces escritorio (en tablet no caben bien: van al menú). */}
          <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  className="subrayado pb-1 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-hueso/80 hover:text-acento"
                >
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {/* CTA (tablet y escritorio). */}
            <div className="hidden md:block">
              <BookingButtonComponent />
            </div>

            {/* Botón menú (móvil y tablet). */}
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              className="al-tocar -mr-2 flex h-11 w-11 items-center justify-center text-hueso lg:hidden"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>
      </m.header>

      {/* Menú a pantalla completa (móvil y tablet). */}
      <AnimatePresence>
        {menuAbierto && (
          <m.div
            className="grain fixed inset-0 z-40 flex flex-col overflow-y-auto bg-tinta-900 px-6 pb-28 pt-24 text-hueso md:px-12 lg:hidden"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH }}
          >
            {/* Sello de fondo, muy tenue. */}
            <img
              src="/logo-sello.webp"
              alt=""
              aria-hidden="true"
              className="gira-lento pointer-events-none absolute -bottom-24 -right-24 w-80 opacity-[0.07] md:w-[28rem]"
            />

            <ul className="relative flex flex-col">
              {ENLACES.map((e, i) => (
                <m.li
                  key={e.href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: EASE_SMOOTH }}
                >
                  <a
                    href={e.href}
                    onClick={cerrar}
                    className="group flex items-baseline gap-4 border-b border-hueso/10 py-4 font-display text-3xl font-semibold transition-colors hover:text-acento md:text-4xl"
                  >
                    <span className="font-body text-xs text-acento">0{i + 1}</span>
                    {e.texto}
                  </a>
                </m.li>
              ))}
            </ul>

            <m.div
              className="relative mt-10 flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: EASE_SMOOTH }}
            >
              <BookingButtonComponent size={ButtonSizeEnum.Lg} className="w-full md:w-auto md:self-start" />
              <div className="flex flex-col gap-3 text-sm text-hueso/65">
                <a href={`tel:${TELEFONO}`} className="flex items-center gap-3 hover:text-acento">
                  <Phone size={16} className="text-acento" /> {TELEFONO_VISIBLE}
                </a>
                <p className="flex items-center gap-3">
                  <MapPin size={16} className="text-acento" /> {NEGOCIO.direccion}, {NEGOCIO.localidad}
                </p>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-acento"
                >
                  <InstagramIconComponent size={16} /> @{INSTAGRAM}
                </a>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
  // #endregion
}

export default NavComponent

import { useRef, useEffect, useState } from 'react'

/**
 * Envuelve a sus hijos y los hace aparecer con un fade-in al entrar en
 * pantalla (IntersectionObserver). Acelerado por GPU → fluido en móvil.
 *
 * Props:
 *  - delay: retardo en ms (para escalonar elementos de una lista).
 *  - as: etiqueta a renderizar (por defecto 'div').
 *  - className: clases extra.
 */
export default function RevealComponent({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import LogoComponent from '../../ui/Logo/LogoComponent'
import PasoServicio from './PasoServicio'
import PasoFecha from './PasoFecha'
import PasoHora from './PasoHora'
import PasoDatos from './PasoDatos'
import Confirmacion from './Confirmacion'

const PASOS = ['Servicio', 'Fecha', 'Hora', 'Tus datos']

/**
 * Pantalla de reserva (Fase 2). Orquesta el flujo en pasos:
 *   1 Servicio → 2 Fecha → 3 Hora → 4 Datos → ✓ Confirmación
 * Mantiene el estado de la selección y va avanzando/retrocediendo.
 */
export default function ReservaComponent() {
  const [paso, setPaso] = useState(1)
  const [servicio, setServicio] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null) // Date con la hora de inicio

  const irA = (n) => setPaso(n)
  const atras = () => setPaso((p) => Math.max(1, p - 1))

  const confirmado = paso === 5

  return (
    <div className="flex min-h-screen flex-col bg-hueso text-tinta">
      {/* Cabecera */}
      <header className="bg-tinta">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/" aria-label="Volver al inicio">
            <LogoComponent claro alto={40} />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento"
          >
            <ArrowLeft size={16} />
            Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 md:py-12">
        {/* Título */}
        {!confirmado && (
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs tracking-kicker text-acento">Reserva online</p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Pide tu cita</h1>
          </div>
        )}

        {/* Indicador de pasos */}
        {!confirmado && (
          <ol className="mx-auto mb-10 flex max-w-xl items-center justify-between">
            {PASOS.map((nombre, i) => {
              const n = i + 1
              const hecho = paso > n
              const activo = paso === n
              return (
                <li key={nombre} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        hecho
                          ? 'bg-acento text-tinta'
                          : activo
                            ? 'bg-tinta text-hueso'
                            : 'bg-tinta/10 text-tinta/40'
                      }`}
                    >
                      {hecho ? <Check size={16} /> : n}
                    </span>
                    <span
                      className={`hidden text-xs sm:block ${
                        activo ? 'font-medium text-tinta' : 'text-tinta/40'
                      }`}
                    >
                      {nombre}
                    </span>
                  </div>
                  {n < PASOS.length && (
                    <span
                      className={`mx-2 h-px flex-1 ${hecho ? 'bg-acento' : 'bg-tinta/15'}`}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        )}

        {/* Contenido del paso */}
        {paso === 1 && (
          <PasoServicio
            servicio={servicio}
            onElegir={(s) => {
              setServicio(s)
              irA(2)
            }}
          />
        )}

        {paso === 2 && (
          <PasoFecha
            fecha={fecha}
            onAtras={atras}
            onElegir={(f) => {
              setFecha(f)
              setHora(null)
              irA(3)
            }}
          />
        )}

        {paso === 3 && (
          <PasoHora
            key={`${servicio?.id}-${fecha?.toISOString()}`}
            servicio={servicio}
            fecha={fecha}
            onAtras={atras}
            onElegir={(h) => {
              setHora(h)
              irA(4)
            }}
          />
        )}

        {paso === 4 && (
          <PasoDatos
            servicio={servicio}
            fecha={fecha}
            hora={hora}
            onAtras={atras}
            onConfirmado={() => irA(5)}
          />
        )}

        {confirmado && (
          <Confirmacion servicio={servicio} hora={hora} />
        )}
      </main>
    </div>
  )
}

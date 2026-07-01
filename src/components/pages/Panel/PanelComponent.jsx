import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import LoginPanel from './LoginPanel'
import AgendaPanel from './AgendaPanel'
import AjustesHorario from './AjustesHorario'

/**
 * Panel del barbero (Fase 3). Sin sesión → login. Con sesión → agenda u
 * horario, según la sección elegida.
 */
export default function PanelComponent() {
  const { sesion, cargando } = useAuth()
  const [seccion, setSeccion] = useState('agenda')

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tinta text-hueso">
        <Loader2 size={28} className="animate-spin text-acento" />
      </div>
    )
  }

  if (!sesion) return <LoginPanel />

  return seccion === 'horario' ? (
    <AjustesHorario onVolver={() => setSeccion('agenda')} />
  ) : (
    <AgendaPanel onAbrirHorario={() => setSeccion('horario')} />
  )
}

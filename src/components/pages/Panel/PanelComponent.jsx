import { Loader2 } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import LoginPanel from './LoginPanel'
import AgendaPanel from './AgendaPanel'

/**
 * Panel del barbero (Fase 3). Si hay sesión → agenda; si no → login.
 */
export default function PanelComponent() {
  const { sesion, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tinta text-hueso">
        <Loader2 size={28} className="animate-spin text-acento" />
      </div>
    )
  }

  return sesion ? <AgendaPanel /> : <LoginPanel />
}

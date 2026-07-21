import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { firebaseEnabled } from '@/lib/firebase'
import { signInAdmin } from '@/services/siteContent'
import { useSiteStore } from '@/store/useSiteStore'

export default function AdminLoginPage() {
  useDocumentTitle('Admin | Bicicletería Laprida')
  const navigate = useNavigate()
  const adminSession = useSiteStore((state) => state.adminSession)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (adminSession.isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signInAdmin({ username, password })
      navigate('/admin')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span className="admin-login-kicker">Panel administrador</span>
        <h1>Bicicletería Laprida</h1>
        <p>
          {firebaseEnabled
            ? 'Ingresá con tu usuario o email y tu contraseña de Firebase Auth.'
            : 'Modo demo activo. Usuario: admin | Contraseña: laprida123'}
        </p>

        <label>
          Usuario
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
          />
        </label>

        <label>
          Contraseña
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>

        {error ? <div className="admin-inline-error">{error}</div> : null}

        <button disabled={submitting} type="submit">
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

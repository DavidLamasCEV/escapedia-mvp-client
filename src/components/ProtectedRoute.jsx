import { Navigate } from 'react-router-dom'
import { useAuth } from '../contents/authContext'


function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  // Sin sesión → login
  if (!user) return <Navigate to="/login" replace />

  // Rol insuficiente → home
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
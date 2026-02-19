import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contents/authContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">🔐 Escapedia</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>🚪 Salas</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/locales">🏢 Locales</NavLink>
            </li>

            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/mis-reservas">📖 Mis reservas</NavLink>
              </li>
            )}

            {user && (user.role === 'owner' || user.role === 'admin') && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/salas">✅ Mis salas</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/reservas">🔔 Reservas recibidas</NavLink>
                </li>
              </>
            )}

            {user && user.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/locales">🗄️ Admin locales</NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/perfil">{user.name}</NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    Cerrar sesion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Iniciar sesion</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">Registrarse</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

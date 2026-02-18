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
        {/* Logo */}
        <Link className="navbar-brand" to="/">🔐 Escapedia</Link>

        {/* Botón hamburguesa para móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          {/* Links izquierda */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Catálogo</NavLink>
            </li>

            {/* Solo usuarios autenticados */}
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/mis-reservas">Mis reservas</NavLink>
              </li>
            )}

            {/* Solo owner/admin */}
            {user && (user.role === 'owner' || user.role === 'admin') && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/salas">Mis salas</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/owner/reservas">Reservas recibidas</NavLink>
                </li>
              </>
            )}

            {user && user.role === 'admin' && (
            <li className="nav-item">
                <NavLink className="nav-link" to="/admin/locales">🏢 Locales</NavLink>
            </li>
            )}
          </ul>

          {/* Links derecha */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/perfil">👤 {user.name}</NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Iniciar sesión</NavLink>
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
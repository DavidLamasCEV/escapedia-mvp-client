import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../services/authService'

// Creamos el contexto
const AuthContext = createContext()

// Hook para usarlo fácilmente en cualquier componente
export function useAuth() {
  return useContext(AuthContext)
}

// Provider que envuelve la app en main.jsx
export function AuthContextProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true mientras comprobamos el token inicial

  // Al montar la app: si hay token guardado, recuperamos el usuario
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token')) // token inválido o expirado
      .finally(() => setLoading(false))
  }, [])

  // Guarda el token y el usuario después de login/register
  function saveLogin(token, userData) {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // Cierra sesión
  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = { user, loading, saveLogin, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
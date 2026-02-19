import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthContextProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token')) 
      .finally(() => setLoading(false))
  }, [])

  function saveLogin(token, userData) {
    localStorage.setItem('token', token)
    setUser(userData)
  }

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
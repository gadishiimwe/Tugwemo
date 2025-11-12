import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('adminToken')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        // Set Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

        // Fetch profile
        const res = await axios.get(`${API_BASE_URL}/auth/profile`)
        setUser(res.data.user)
        setToken(storedToken)
      } catch (err) {
        console.error('Token verification failed', err)
        localStorage.removeItem('adminToken')
        setToken(null)
        setUser(null)
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      const { token: newToken, user } = res.data

      localStorage.setItem('adminToken', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setUser(user)

      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: err.response?.data?.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setUser(null)
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

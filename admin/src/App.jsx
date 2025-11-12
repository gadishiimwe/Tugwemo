import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Ads from './pages/Ads'
import Settings from './pages/Settings'
import Logs from './pages/Logs'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { useState } from 'react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex flex-1">
                  {/* Mobile sidebar overlay */}
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}

                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />

                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                      onMenuClick={() => setSidebarOpen(true)}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 sm:p-4 lg:p-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/ads" element={<Ads />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/logs" element={<Logs />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

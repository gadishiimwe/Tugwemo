import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Flag,
  BarChart3,
  Megaphone,
  Settings,
  FileText,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/reports', icon: Flag, label: 'Reports' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/ads', icon: Megaphone, label: 'Ads' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/logs', icon: FileText, label: 'Logs' },
  ]

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Tugwemo Admin</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

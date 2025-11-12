import { Search, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Notifications from './Notifications'

const Header = ({ onMenuClick, className = '' }) => {
  const { user } = useAuth()

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            Welcome back, {user?.name || 'Admin'}
          </h2>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden sm:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64"
            />
          </div>
          <Notifications />
          <div className="flex items-center space-x-2">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=667eea&color=fff`}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-24 lg:max-w-none">
              {user?.name || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

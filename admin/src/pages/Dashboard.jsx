import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, MessageSquare, Eye, TrendingUp, AlertTriangle, AlertCircle, Shield, Info } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalConnections: 0,
    reportsToday: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard')
      setStats(response.data.stats)
      setRecentActivity(response.data.recentActivity)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Eye,
      color: 'bg-green-500'
    },
    {
      title: 'Total Connections',
      value: stats.totalConnections,
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      title: 'Reports Today',
      value: stats.reportsToday,
      icon: TrendingUp,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`${card.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                let IconComponent = Info
                switch (activity.icon) {
                  case 'AlertTriangle':
                    IconComponent = AlertTriangle
                    break
                  case 'AlertCircle':
                    IconComponent = AlertCircle
                    break
                  case 'Shield':
                    IconComponent = Shield
                    break
                  case 'Info':
                  default:
                    IconComponent = Info
                    break
                }
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

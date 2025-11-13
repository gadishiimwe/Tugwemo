import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import API_BASE_URL from '../config'

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    connectionStats: [],
    reportStats: [],
    deviceStats: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
    setLoading(false)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">User Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8884d8"
              strokeWidth={2}
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.connectionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="connections" fill="#8884d8" name="Connections" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Device Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.deviceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Array.isArray(analytics.deviceStats) && analytics.deviceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Report Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.reportStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#ff7300"
              strokeWidth={2}
              name="Reports"
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#00ff00"
              strokeWidth={2}
              name="Resolved"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Array.isArray(analytics.userGrowth) && analytics.userGrowth.length > 0 ? analytics.userGrowth[analytics.userGrowth.length - 1]?.users || 0 : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Active Today</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {Array.isArray(analytics.userGrowth) && analytics.userGrowth.length > 0 ? analytics.userGrowth[analytics.userGrowth.length - 1]?.activeUsers || 0 : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Currently online</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Connections</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Array.isArray(analytics.connectionStats) ? analytics.connectionStats.reduce((sum, stat) => sum + stat.connections, 0) : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">This week</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Reports Resolved</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {Array.isArray(analytics.reportStats) && analytics.reportStats.length > 0 ? analytics.reportStats[analytics.reportStats.length - 1]?.resolved || 0 : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">This month</p>
        </div>
      </div>
    </div>
  )
}

export default Analytics

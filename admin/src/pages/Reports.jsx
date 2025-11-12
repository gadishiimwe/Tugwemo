import { useState, useEffect } from 'react'
import { Flag, Eye, CheckCircle, XCircle, AlertTriangle, Search, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'

const Reports = () => {
  const { token } = useAuth()

  // Debug: Check if token exists
  console.log('Reports component - token:', token)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8000/api/admin/reports?page=${page}&limit=${pagination.limit}&status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      setReports(data.reports || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [filter])

  const handleResolveReport = async (reportId, action) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/reports/${reportId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action })
        }
      )

      if (response.ok) {
        fetchReports(pagination.page)
        setShowModal(false)
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Error resolving report:', error)
    }
  }

  const handleBanUser = async (userId, reason) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}/ban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: reason || 'Violation of community guidelines' })
        }
      )

      if (response.ok) {
        alert('User has been banned successfully')
        fetchReports(pagination.page)
        setShowModal(false)
        setSelectedReport(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to ban user: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user')
    }
  }

  const handleKickUser = async (userId, reason) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}/kick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: reason || 'Kicked by admin' })
        }
      )

      if (response.ok) {
        alert('User has been kicked successfully')
        fetchReports(pagination.page)
        setShowModal(false)
        setSelectedReport(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to kick user: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error kicking user:', error)
      alert('Failed to kick user')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'harassment': return 'text-red-600'
      case 'inappropriate_content': return 'text-orange-600'
      case 'spam': return 'text-yellow-600'
      case 'abuse': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const filteredReports = reports.filter(report =>
    report.reporter?.name?.toLowerCase().includes(search.toLowerCase()) ||
    report.reportedUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    report.reason?.toLowerCase().includes(search.toLowerCase()) ||
    report.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Resolved</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Dismissed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'dismissed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Reports</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.reporter?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.reporter?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.reportedUser?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.reportedUser?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getReasonColor(report.reason)}`}>
                        {report.reason.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(report._id, 'resolve')}
                              className="text-green-600 hover:text-green-900"
                              title="Resolve Report"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleResolveReport(report._id, 'dismiss')}
                              className="text-gray-600 hover:text-gray-900"
                              title="Dismiss Report"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReports(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchReports(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedReport(null)
        }}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                <p className="text-sm text-gray-900">{selectedReport.reporter?.name} ({selectedReport.reporter?.email})</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reported User</h3>
                <p className="text-sm text-gray-900">{selectedReport.reportedUser?.name} ({selectedReport.reportedUser?.email})</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Reason</h3>
              <p className="text-sm text-gray-900 capitalize">{selectedReport.reason.replace('_', ' ')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-sm text-gray-900">{selectedReport.description}</p>
            </div>

            {selectedReport.roomId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Room ID</h3>
                <p className="text-sm text-gray-900 font-mono">{selectedReport.roomId}</p>
              </div>
            )}

            {selectedReport.screenshot && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Screenshot</h3>
                <img
                  src={selectedReport.screenshot}
                  alt="Report screenshot"
                  className="max-w-full h-auto rounded border"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                <p className="text-sm text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedReport.resolvedBy && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Resolved By</h3>
                <p className="text-sm text-gray-900">{selectedReport.resolvedBy?.name} ({selectedReport.resolvedBy?.email})</p>
                <p className="text-sm text-gray-500">Resolved on {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
              </div>
            )}

            {selectedReport.status === 'pending' && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleResolveReport(selectedReport._id, 'resolve')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve Report
                  </button>
                  <button
                    onClick={() => handleResolveReport(selectedReport._id, 'dismiss')}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Dismiss Report
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBanUser(selectedReport.reportedUser._id, `Banned for ${selectedReport.reason}`)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ban User
                  </button>
                  <button
                    onClick={() => handleKickUser(selectedReport.reportedUser._id, `Kicked for ${selectedReport.reason}`)}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Kick User
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Reports

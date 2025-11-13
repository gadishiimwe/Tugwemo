import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Ban, MessageSquare, Eye, MoreVertical, UserX, VolumeX, Volume2, Edit } from 'lucide-react'
import Modal from '../components/Modal'
import API_BASE_URL from '../config'

const Users = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalType, setModalType] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { page: currentPage, search: searchTerm }
      })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
    setLoading(false)
  }

  const openModal = (user, type) => {
    setSelectedUser(user)
    setModalType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
    setModalType('')
  }

  const handleAction = async (userId, action, user) => {
    setActionLoading(true)
    try {
      if (action === 'view') {
        openModal(user, 'view')
      } else if (action === 'kick') {
        await axios.post(`${API_BASE_URL}/admin/users/${userId}/kick`, { reason: 'Kicked by admin' })
        alert('User kicked successfully!')
        fetchUsers()
        closeModal()
      } else if (action === 'ban') {
        openModal(user, 'ban')
      } else if (action === 'mute') {
        openModal(user, 'mute')
      } else if (action === 'unmute') {
        await axios.post(`${API_BASE_URL}/admin/users/${userId}/unmute`)
        fetchUsers()
        closeModal()
      } else if (action === 'unban') {
        await axios.post(`${API_BASE_URL}/admin/users/${userId}/unban`)
        fetchUsers()
        closeModal()
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
    setActionLoading(false)
  }

  const handleBanUser = async (reason, duration) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/users/${selectedUser._id}/ban`, { reason, duration })
      alert('User banned successfully!')
      fetchUsers()
      closeModal()
    } catch (error) {
      console.error('Failed to ban user:', error)
      alert('Failed to ban user. Please try again.')
    }
  }

  const handleMuteUser = async (duration) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/users/${selectedUser._id}/mute`, { duration })
      fetchUsers()
      closeModal()
    } catch (error) {
      console.error('Failed to mute user:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connections
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=667eea&color=fff`}
                            alt=""
                          />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 flex items-center truncate">
                            <span className="truncate">{user.name}</span>
                            {user.sex && (
                              <span className="ml-1 sm:ml-2 flex-shrink-0">
                                {user.sex === 'boy' ? '👦' : user.sex === 'girl' ? '👧' : '🧑'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.connectionCount || 0}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.reportCount || 0}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleAction(user._id, 'view', user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user._id, 'kick', user)}
                          className="text-orange-600 hover:text-orange-900 p-1"
                          title="Kick User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        {user.isBanned ? (
                          <button
                            onClick={() => handleAction(user._id, 'unban', user)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Unban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user._id, 'ban', user)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {user.isMuted ? (
                          <button
                            onClick={() => handleAction(user._id, 'unmute', user)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Unmute User"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user._id, 'mute', user)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Mute User"
                          >
                            <VolumeX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i
                    if (page > totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedUser && (
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={
            modalType === 'view' ? 'User Details' :
            modalType === 'ban' ? 'Ban User' :
            modalType === 'mute' ? 'Mute User' : 'Action'
          }
        >
          {modalType === 'view' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=667eea&color=fff`}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Connections</label>
                  <p className="text-sm text-gray-900">{selectedUser.connectionCount || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reports</label>
                  <p className="text-sm text-gray-900">{selectedUser.reportCount || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banned</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.isBanned ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {modalType === 'ban' && (
            <div className="space-y-4">
              <p>Are you sure you want to ban {selectedUser.name}?</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  id="banReason"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter ban reason..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                <input
                  id="banDuration"
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter duration in days (0 for permanent)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason = document.getElementById('banReason').value
                    const duration = parseInt(document.getElementById('banDuration').value) || 0
                    handleBanUser(reason, duration)
                  }}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Banning...' : 'Ban User'}
                </button>
              </div>
            </div>
          )}

          {modalType === 'mute' && (
            <div className="space-y-4">
              <p>Are you sure you want to mute {selectedUser.name}?</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  id="muteDuration"
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter duration in minutes"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const duration = parseInt(document.getElementById('muteDuration').value) || 0
                    handleMuteUser(duration)
                  }}
                  className="px-4 py-2 bg-yellow-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-yellow-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Muting...' : 'Mute User'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

export default Users

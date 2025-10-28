import { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Settings as SettingsIcon } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maxUsersPerRoom: 2,
    maxMessageLength: 500,
    allowGuestUsers: true,
    requireEmailVerification: false,
    enableAds: true,
    supportEmail: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/settings')
      setSettings(response.data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put('/api/admin/settings', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Privacy Policy URL</label>
              <input
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={settings.privacyPolicyUrl}
                onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Terms of Service URL</label>
              <input
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={settings.termsOfServiceUrl}
                onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Chat Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Users Per Room</label>
              <input
                type="number"
                min="2"
                max="10"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={settings.maxUsersPerRoom}
                onChange={(e) => handleInputChange('maxUsersPerRoom', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Message Length</label>
              <input
                type="number"
                min="100"
                max="2000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={settings.maxMessageLength}
                onChange={(e) => handleInputChange('maxMessageLength', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center">
              <input
                id="allowGuestUsers"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.allowGuestUsers}
                onChange={(e) => handleInputChange('allowGuestUsers', e.target.checked)}
              />
              <label htmlFor="allowGuestUsers" className="ml-2 block text-sm text-gray-900">
                Allow Guest Users
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="requireEmailVerification"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
              />
              <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                Require Email Verification
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                Maintenance Mode
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enableAds"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.enableAds}
                onChange={(e) => handleInputChange('enableAds', e.target.checked)}
              />
              <label htmlFor="enableAds" className="ml-2 block text-sm text-gray-900">
                Enable Advertisements
              </label>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => axios.post('/api/admin/system/clear-cache')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear System Cache
            </button>
            <button
              onClick={() => axios.post('/api/admin/system/backup')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create Database Backup
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to restart the server? This will disconnect all users.')) {
                  axios.post('/api/admin/system/restart')
                }
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Restart Server
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

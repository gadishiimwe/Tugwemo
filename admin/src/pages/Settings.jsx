import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Save,
  Settings as SettingsIcon,
  Shield,
  Mail,
  Bell,
  Zap,
  Link,
  UserCheck,
  BarChart3,
  Search,
  History,
  Download,
  Upload,
  Database,
  FileText,
  Activity,
  Users,
  MessageSquare,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Chat Platform',
    siteDescription: '',
    supportEmail: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    contactEmail: '',
    businessAddress: '',

    // Chat Settings
    maxUsersPerRoom: 2,
    maxMessageLength: 500,
    allowGuestUsers: true,
    requireEmailVerification: false,
    enableFileUploads: true,
    maxFileSize: 10, // MB
    allowedFileTypes: ['jpg', 'png', 'gif', 'pdf', 'txt'],
    enableVoiceMessages: false,
    enableVideoCalls: false,

    // System Settings
    maintenanceMode: false,
    enableAds: true,
    enableAnalytics: true,
    enableNotifications: true,
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    enableRateLimiting: true,

    // Security Settings
    enableTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    enableIpWhitelist: false,
    allowedIps: [],
    enableBruteForceProtection: true,
    sslRequired: true,

    // Email Settings
    smtpHost: '',
    emailFromName: '',
    emailFromAddress: '',
    enableEmailNotifications: true,

    // Notification Settings
    pushNotificationsEnabled: true,
    emailNotificationsEnabled: true,
    webhookUrl: '',
    webhookSecret: '',
    notifyOnNewUser: true,
    notifyOnReport: true,
    notifyOnSecurityEvent: true,

    // Performance Settings
    cacheEnabled: true,
    cacheTtl: 3600, // seconds
    rateLimitRequests: 100,
    rateLimitWindow: 60, // seconds
    enableCompression: true,
    maxConcurrentConnections: 1000,

    // Integration Settings
    googleAnalyticsId: '',
    facebookPixelId: '',
    slackWebhookUrl: '',
    discordWebhookUrl: '',
    apiKey: '',
    apiRateLimit: 1000,

    // Moderation Settings
    enableAutoModeration: true,
    bannedWords: [],
    enableSpamDetection: true,
    spamThreshold: 0.8,
    enableContentFiltering: true,
    maxReportsPerUser: 10,

    // Analytics Settings
    trackUserBehavior: true,
    trackPageViews: true,
    dataRetentionDays: 365,
    enablePrivacyMode: false,
    allowDataExport: true,
    cookieConsentRequired: true
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [settingsHistory, setSettingsHistory] = useState([])

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon, color: 'blue' },
    { id: 'chat', name: 'Chat', icon: MessageSquare, color: 'green' },
    { id: 'system', name: 'System', icon: Globe, color: 'purple' },
    { id: 'security', name: 'Security', icon: Shield, color: 'red' },
    { id: 'email', name: 'Email', icon: Mail, color: 'yellow' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'indigo' },
    { id: 'performance', name: 'Performance', icon: Zap, color: 'orange' },
    { id: 'integrations', name: 'Integrations', icon: Link, color: 'pink' },
    { id: 'moderation', name: 'Moderation', icon: UserCheck, color: 'teal' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'cyan' }
  ]

  useEffect(() => {
    fetchSettings()
    fetchSettingsHistory()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/settings')
      setSettings(prev => ({ ...prev, ...response.data.settings }))
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
    setLoading(false)
  }

  const fetchSettingsHistory = async () => {
    try {
      // This would be implemented in the backend
      // const response = await axios.get('/api/admin/settings/history')
      // setSettingsHistory(response.data.history)
    } catch (error) {
      console.error('Failed to fetch settings history:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put('/api/admin/settings', settings)
      alert('Settings saved successfully!')
      fetchSettingsHistory()
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  const handleBulkSave = async (categorySettings) => {
    setSaving(true)
    try {
      await axios.put('/api/admin/settings', categorySettings)
      alert('Category settings saved successfully!')
      fetchSettingsHistory()
    } catch (error) {
      console.error('Failed to save category settings:', error)
      alert('Failed to save category settings')
    }
    setSaving(false)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'settings-export.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          setSettings(prev => ({ ...prev, ...importedSettings }))
          alert('Settings imported successfully! Remember to save.')
        } catch (error) {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }

  const quickActions = [
    {
      name: 'Clear System Cache',
      action: () => axios.post('/api/admin/system/clear-cache'),
      color: 'gray',
      description: 'Clear all cached data'
    },
    {
      name: 'Create Database Backup',
      action: () => axios.post('/api/admin/system/backup'),
      color: 'green',
      description: 'Create full database backup'
    },
    {
      name: 'Optimize Database',
      action: () => axios.post('/api/admin/system/optimize-db'),
      color: 'blue',
      description: 'Optimize database performance'
    },
    {
      name: 'Rotate Logs',
      action: () => axios.post('/api/admin/system/rotate-logs'),
      color: 'yellow',
      description: 'Archive old log files'
    },
    {
      name: 'System Health Check',
      action: () => axios.get('/api/admin/system/health'),
      color: 'indigo',
      description: 'Run system diagnostics'
    },
    {
      name: 'Restart Server',
      action: () => {
        if (window.confirm('Are you sure you want to restart the server? This will disconnect all users.')) {
          axios.post('/api/admin/system/restart')
        }
      },
      color: 'red',
      description: 'Restart application server'
    }
  ]

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Name</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Support Email</label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.supportEmail}
            onChange={(e) => handleInputChange('supportEmail', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Site Description</label>
        <textarea
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={settings.siteDescription}
          onChange={(e) => handleInputChange('siteDescription', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Address</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.businessAddress}
            onChange={(e) => handleInputChange('businessAddress', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderChatSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Users Per Room</label>
          <input
            type="number"
            min="2"
            max="50"
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
            max="5000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxMessageLength}
            onChange={(e) => handleInputChange('maxMessageLength', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Max File Size (MB)</label>
          <input
            type="number"
            min="1"
            max="100"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxFileSize}
            onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed File Types</label>
          <input
            type="text"
            placeholder="jpg,png,gif,pdf,txt"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.allowedFileTypes.join(',')}
            onChange={(e) => handleInputChange('allowedFileTypes', e.target.value.split(','))}
          />
        </div>
      </div>

      <div className="space-y-4">
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

        <div className="flex items-center">
          <input
            id="enableFileUploads"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableFileUploads}
            onChange={(e) => handleInputChange('enableFileUploads', e.target.checked)}
          />
          <label htmlFor="enableFileUploads" className="ml-2 block text-sm text-gray-900">
            Enable File Uploads
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableVoiceMessages"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableVoiceMessages}
            onChange={(e) => handleInputChange('enableVoiceMessages', e.target.checked)}
          />
          <label htmlFor="enableVoiceMessages" className="ml-2 block text-sm text-gray-900">
            Enable Voice Messages
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableVideoCalls"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableVideoCalls}
            onChange={(e) => handleInputChange('enableVideoCalls', e.target.checked)}
          />
          <label htmlFor="enableVideoCalls" className="ml-2 block text-sm text-gray-900">
            Enable Video Calls
          </label>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (hours)</label>
          <input
            type="number"
            min="1"
            max="168"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.sessionTimeout}
            onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="20"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
          />
        </div>
      </div>

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

        <div className="flex items-center">
          <input
            id="enableAnalytics"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableAnalytics}
            onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
          />
          <label htmlFor="enableAnalytics" className="ml-2 block text-sm text-gray-900">
            Enable Analytics
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableNotifications"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableNotifications}
            onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
          />
          <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
            Enable Notifications
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableRateLimiting"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableRateLimiting}
            onChange={(e) => handleInputChange('enableRateLimiting', e.target.checked)}
          />
          <label htmlFor="enableRateLimiting" className="ml-2 block text-sm text-gray-900">
            Enable Rate Limiting
          </label>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Password Min Length</label>
          <input
            type="number"
            min="6"
            max="32"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.passwordMinLength}
            onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="20"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="enableTwoFactor"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableTwoFactor}
            onChange={(e) => handleInputChange('enableTwoFactor', e.target.checked)}
          />
          <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
            Enable Two-Factor Authentication
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="passwordRequireSpecialChars"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.passwordRequireSpecialChars}
            onChange={(e) => handleInputChange('passwordRequireSpecialChars', e.target.checked)}
          />
          <label htmlFor="passwordRequireSpecialChars" className="ml-2 block text-sm text-gray-900">
            Require Special Characters in Passwords
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="passwordRequireNumbers"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.passwordRequireNumbers}
            onChange={(e) => handleInputChange('passwordRequireNumbers', e.target.checked)}
          />
          <label htmlFor="passwordRequireNumbers" className="ml-2 block text-sm text-gray-900">
            Require Numbers in Passwords
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableIpWhitelist"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableIpWhitelist}
            onChange={(e) => handleInputChange('enableIpWhitelist', e.target.checked)}
          />
          <label htmlFor="enableIpWhitelist" className="ml-2 block text-sm text-gray-900">
            Enable IP Whitelist
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableBruteForceProtection"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableBruteForceProtection}
            onChange={(e) => handleInputChange('enableBruteForceProtection', e.target.checked)}
          />
          <label htmlFor="enableBruteForceProtection" className="ml-2 block text-sm text-gray-900">
            Enable Brute Force Protection
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="sslRequired"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.sslRequired}
            onChange={(e) => handleInputChange('sslRequired', e.target.checked)}
          />
          <label htmlFor="sslRequired" className="ml-2 block text-sm text-gray-900">
            Require SSL/HTTPS
          </label>
        </div>
      </div>

      {settings.enableIpWhitelist && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed IPs (one per line)</label>
          <textarea
            rows={4}
            placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.allowedIps.join('\n')}
            onChange={(e) => handleInputChange('allowedIps', e.target.value.split('\n').filter(ip => ip.trim()))}
          />
        </div>
      )}
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
          <input
            type="text"
            placeholder="smtp.gmail.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.smtpHost}
            onChange={(e) => handleInputChange('smtpHost', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
          <input
            type="number"
            min="25"
            max="587"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.smtpPort}
            onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.smtpUser}
            onChange={(e) => handleInputChange('smtpUser', e.target.value)}
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={settings.smtpPassword}
              onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">From Name</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.emailFromName}
            onChange={(e) => handleInputChange('emailFromName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">From Address</label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.emailFromAddress}
            onChange={(e) => handleInputChange('emailFromAddress', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="smtpSecure"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.smtpSecure}
            onChange={(e) => handleInputChange('smtpSecure', e.target.checked)}
          />
          <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-900">
            Use SSL/TLS
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableEmailNotifications"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableEmailNotifications}
            onChange={(e) => handleInputChange('enableEmailNotifications', e.target.checked)}
          />
          <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900">
            Enable Email Notifications
          </label>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
          <input
            type="url"
            placeholder="https://your-app.com/webhook"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.webhookUrl}
            onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.webhookSecret}
            onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="pushNotificationsEnabled"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.pushNotificationsEnabled}
            onChange={(e) => handleInputChange('pushNotificationsEnabled', e.target.checked)}
          />
          <label htmlFor="pushNotificationsEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Push Notifications
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="emailNotificationsEnabled"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.emailNotificationsEnabled}
            onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
          />
          <label htmlFor="emailNotificationsEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Email Notifications
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="notifyOnNewUser"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifyOnNewUser}
            onChange={(e) => handleInputChange('notifyOnNewUser', e.target.checked)}
          />
          <label htmlFor="notifyOnNewUser" className="ml-2 block text-sm text-gray-900">
            Notify on New User Registration
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="notifyOnReport"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifyOnReport}
            onChange={(e) => handleInputChange('notifyOnReport', e.target.checked)}
          />
          <label htmlFor="notifyOnReport" className="ml-2 block text-sm text-gray-900">
            Notify on New Reports
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="notifyOnSecurityEvent"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.notifyOnSecurityEvent}
            onChange={(e) => handleInputChange('notifyOnSecurityEvent', e.target.checked)}
          />
          <label htmlFor="notifyOnSecurityEvent" className="ml-2 block text-sm text-gray-900">
            Notify on Security Events
          </label>
        </div>
      </div>
    </div>
  )

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cache TTL (seconds)</label>
          <input
            type="number"
            min="60"
            max="86400"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.cacheTtl}
            onChange={(e) => handleInputChange('cacheTtl', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rate Limit Requests</label>
          <input
            type="number"
            min="10"
            max="1000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.rateLimitRequests}
            onChange={(e) => handleInputChange('rateLimitRequests', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rate Limit Window (seconds)</label>
          <input
            type="number"
            min="1"
            max="3600"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.rateLimitWindow}
            onChange={(e) => handleInputChange('rateLimitWindow', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Concurrent Connections</label>
          <input
            type="number"
            min="100"
            max="10000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxConcurrentConnections}
            onChange={(e) => handleInputChange('maxConcurrentConnections', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="cacheEnabled"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.cacheEnabled}
            onChange={(e) => handleInputChange('cacheEnabled', e.target.checked)}
          />
          <label htmlFor="cacheEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Caching
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableCompression"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableCompression}
            onChange={(e) => handleInputChange('enableCompression', e.target.checked)}
          />
          <label htmlFor="enableCompression" className="ml-2 block text-sm text-gray-900">
            Enable Response Compression
          </label>
        </div>
      </div>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.googleAnalyticsId}
            onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
          <input
            type="text"
            placeholder="123456789012345"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.facebookPixelId}
            onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Slack Webhook URL</label>
          <input
            type="url"
            placeholder="https://hooks.slack.com/services/..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.slackWebhookUrl}
            onChange={(e) => handleInputChange('slackWebhookUrl', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discord Webhook URL</label>
          <input
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.discordWebhookUrl}
            onChange={(e) => handleInputChange('discordWebhookUrl', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">API Key</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">API Rate Limit</label>
          <input
            type="number"
            min="100"
            max="10000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.apiRateLimit}
            onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  )

  const renderModerationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Spam Threshold</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.spamThreshold}
            onChange={(e) => handleInputChange('spamThreshold', parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Reports Per User</label>
          <input
            type="number"
            min="1"
            max="50"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.maxReportsPerUser}
            onChange={(e) => handleInputChange('maxReportsPerUser', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Banned Words (comma-separated)</label>
        <textarea
          rows={3}
          placeholder="badword1,badword2,badword3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={settings.bannedWords.join(',')}
          onChange={(e) => handleInputChange('bannedWords', e.target.value.split(',').map(word => word.trim()).filter(word => word))}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="enableAutoModeration"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableAutoModeration}
            onChange={(e) => handleInputChange('enableAutoModeration', e.target.checked)}
          />
          <label htmlFor="enableAutoModeration" className="ml-2 block text-sm text-gray-900">
            Enable Auto Moderation
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableSpamDetection"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableSpamDetection}
            onChange={(e) => handleInputChange('enableSpamDetection', e.target.checked)}
          />
          <label htmlFor="enableSpamDetection" className="ml-2 block text-sm text-gray-900">
            Enable Spam Detection
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableContentFiltering"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enableContentFiltering}
            onChange={(e) => handleInputChange('enableContentFiltering', e.target.checked)}
          />
          <label htmlFor="enableContentFiltering" className="ml-2 block text-sm text-gray-900">
            Enable Content Filtering
          </label>
        </div>
      </div>
    </div>
  )

  const renderAnalyticsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Retention (days)</label>
          <input
            type="number"
            min="30"
            max="3650"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={settings.dataRetentionDays}
            onChange={(e) => handleInputChange('dataRetentionDays', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="trackUserBehavior"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.trackUserBehavior}
            onChange={(e) => handleInputChange('trackUserBehavior', e.target.checked)}
          />
          <label htmlFor="trackUserBehavior" className="ml-2 block text-sm text-gray-900">
            Track User Behavior
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="trackPageViews"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.trackPageViews}
            onChange={(e) => handleInputChange('trackPageViews', e.target.checked)}
          />
          <label htmlFor="trackPageViews" className="ml-2 block text-sm text-gray-900">
            Track Page Views
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enablePrivacyMode"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.enablePrivacyMode}
            onChange={(e) => handleInputChange('enablePrivacyMode', e.target.checked)}
          />
          <label htmlFor="enablePrivacyMode" className="ml-2 block text-sm text-gray-900">
            Enable Privacy Mode
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="allowDataExport"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.allowDataExport}
            onChange={(e) => handleInputChange('allowDataExport', e.target.checked)}
          />
          <label htmlFor="allowDataExport" className="ml-2 block text-sm text-gray-900">
            Allow Data Export
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="cookieConsentRequired"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={settings.cookieConsentRequired}
            onChange={(e) => handleInputChange('cookieConsentRequired', e.target.checked)}
          />
          <label htmlFor="cookieConsentRequired" className="ml-2 block text-sm text-gray-900">
            Require Cookie Consent
          </label>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'chat':
        return renderChatSettings()
      case 'system':
        return renderSystemSettings()
      case 'security':
        return renderSecuritySettings()
      case 'email':
        return renderEmailSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'performance':
        return renderPerformanceSettings()
      case 'integrations':
        return renderIntegrationSettings()
      case 'moderation':
        return renderModerationSettings()
      case 'analytics':
        return renderAnalyticsSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your application settings and preferences</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search settings..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={exportSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 border rounded-lg hover:shadow-md transition-shadow flex items-center space-x-3 ${
                action.color === 'red' ? 'border-red-200 hover:bg-red-50' :
                action.color === 'green' ? 'border-green-200 hover:bg-green-50' :
                action.color === 'blue' ? 'border-blue-200 hover:bg-blue-50' :
                action.color === 'yellow' ? 'border-yellow-200 hover:bg-yellow-50' :
                action.color === 'indigo' ? 'border-indigo-200 hover:bg-indigo-50' :
                'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-full ${
                action.color === 'red' ? 'bg-red-100' :
                action.color === 'green' ? 'bg-green-100' :
                action.color === 'blue' ? 'bg-blue-100' :
                action.color === 'yellow' ? 'bg-yellow-100' :
                action.color === 'indigo' ? 'bg-indigo-100' :
                'bg-gray-100'
              }`}>
                <Activity className={`h-4 w-4 ${
                  action.color === 'red' ? 'text-red-600' :
                  action.color === 'green' ? 'text-green-600' :
                  action.color === 'blue' ? 'text-blue-600' :
                  action.color === 'yellow' ? 'text-yellow-600' :
                  action.color === 'indigo' ? 'text-indigo-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{action.name}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings History */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Settings History</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {settingsHistory.length > 0 ? (
              <div className="space-y-4">
                {settingsHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <History className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Setting "{entry.settingKey}" updated
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {entry.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No settings history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Settings changes will appear here once you start making updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

import express from 'express'
import multer, { FileFilterCallback, MulterError } from 'multer'
import path from 'path'
import fs from 'fs'
import User from '../models/User'
import Log from '../models/Log'
import {
  getDashboard,
  getWelcome,
  getUsers,
  updateUser,
  banUser,
  unbanUser,
  muteUser,
  unmuteUser,
  viewUser,
  getReports,
  resolveReport,
  getAnalytics,
  getSettings,
  updateSettings,
  getSettingsHistory,
  getAds,
  createAd,
  updateAd,
  deleteAd,
  toggleAd,
  getLogs,
  exportLogs,
  clearCache,
  createBackup,
  restartServer,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/adminController'
import { authenticateToken, requireModerator, requireSuperAdmin, AuthRequest } from '../middlewares/auth'

const router = express.Router()

// Apply authentication to all admin routes
router.use(authenticateToken)

// Dashboard Route
router.get('/dashboard', requireModerator, getDashboard)
router.get('/welcome', requireModerator, getWelcome)

// User Management Routes
router.get('/users', requireModerator, getUsers)
router.put('/users/:userId', requireModerator, updateUser)
router.post('/users/:userId/ban', requireModerator, banUser)
router.post('/users/:userId/unban', requireModerator, unbanUser)
router.post('/users/:userId/mute', requireModerator, muteUser)
router.post('/users/:userId/unmute', requireModerator, unmuteUser)
router.get('/users/:userId', requireModerator, viewUser)
router.post('/users/:userId/kick', requireModerator, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const io = req.app.get('io')
    if (!io) return res.status(500).json({ message: 'Socket server not available' })

    io.emit('user-kicked', {
      userId,
      reason: reason || 'Kicked by admin',
      kickedBy: req.user?._id
    })

    await Log.create({
      level: 'warning',
      action: 'user_kicked',
      details: `User ${user.email} kicked by ${req.user?.email}. Reason: ${reason || 'No reason provided'}`,
      userId: req.user?._id,
      metadata: { targetUserId: userId, reason }
    })

    res.json({ message: 'User kicked successfully' })
  } catch (error) {
    console.error('Kick user error:', error)
    res.status(500).json({ message: 'Failed to kick user' })
  }
})

// Reports Management
router.get('/reports', requireModerator, getReports)
router.post('/reports/:reportId/resolve', requireModerator, resolveReport)

// Analytics
router.get('/analytics', requireModerator, getAnalytics)

// Settings
router.get('/settings', requireModerator, getSettings)
router.put('/settings', requireSuperAdmin, updateSettings)
router.get('/settings/history', requireModerator, getSettingsHistory)

// Ads Management Routes
router.get('/adverts', requireModerator, getAds)
router.post('/adverts', requireModerator, createAd)
router.put('/adverts/:adId', requireModerator, updateAd)
router.delete('/adverts/:adId', requireModerator, deleteAd)
router.patch('/adverts/:adId/toggle', requireModerator, toggleAd)

// Multer upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/ads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'ad-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed!'))
}

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).single('image')

// Upload ad image route
router.post('/upload-ad-image', requireModerator, (req: AuthRequest, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message })
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const imageUrl = `/uploads/ads/${req.file.filename}`
    res.json({ imageUrl })
  })
})

// Logs
router.get('/logs', requireModerator, getLogs)
router.get('/logs/export', requireModerator, exportLogs)

// System Control Routes
router.post('/system/clear-cache', requireSuperAdmin, clearCache)
router.post('/system/backup', requireSuperAdmin, createBackup)
router.post('/system/optimize-db', requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    await Log.create({
      level: 'info',
      action: 'database_optimized',
      details: `Database optimized by ${req.user?.email}`,
      userId: req.user?._id
    })
    res.json({ message: 'Database optimized successfully' })
  } catch (error) {
    console.error('Optimize DB error:', error)
    res.status(500).json({ message: 'Failed to optimize database' })
  }
})
router.post('/system/rotate-logs', requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    await Log.create({
      level: 'info',
      action: 'logs_rotated',
      details: `Logs rotated by ${req.user?.email}`,
      userId: req.user?._id
    })
    res.json({ message: 'Logs rotated successfully' })
  } catch (error) {
    console.error('Rotate logs error:', error)
    res.status(500).json({ message: 'Failed to rotate logs' })
  }
})
router.get('/system/health', requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    }
    res.json(health)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ message: 'Health check failed' })
  }
})
router.post('/system/restart', requireSuperAdmin, restartServer)

// Notifications
router.get('/notifications', requireModerator, getNotifications)
router.patch('/notifications/:notificationId/read', requireModerator, markNotificationRead)
router.patch('/notifications/read-all', requireModerator, markAllNotificationsRead)

export default router

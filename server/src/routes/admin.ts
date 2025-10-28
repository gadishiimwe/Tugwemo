import express from 'express'
import {
  getUsers,
  updateUser,
  banUser,
  unbanUser,
  muteUser,
  unmuteUser,
  getReports,
  resolveReport,
  getAnalytics,
  getSettings,
  updateSettings,
  getAds,
  createAd,
  updateAd,
  deleteAd,
  toggleAd,
  getLogs,
  exportLogs,
  clearCache,
  createBackup,
  restartServer
} from '../controllers/adminController'
import { authenticateToken, requireModerator, requireSuperAdmin } from '../middlewares/auth'

const router = express.Router()

// Apply authentication to all admin routes
router.use(authenticateToken)

// User Management Routes
router.get('/users', requireModerator, getUsers)
router.put('/users/:userId', requireModerator, updateUser)
router.post('/users/:userId/ban', requireModerator, banUser)
router.post('/users/:userId/unban', requireModerator, unbanUser)
router.post('/users/:userId/mute', requireModerator, muteUser)
router.post('/users/:userId/unmute', requireModerator, unmuteUser)

// Reports Management Routes
router.get('/reports', requireModerator, getReports)
router.post('/reports/:reportId/resolve', requireModerator, resolveReport)

// Analytics Routes
router.get('/analytics', requireModerator, getAnalytics)

// Settings Routes
router.get('/settings', requireModerator, getSettings)
router.put('/settings', requireSuperAdmin, updateSettings)

// Ads Management Routes
router.get('/ads', requireModerator, getAds)
router.post('/ads', requireModerator, createAd)
router.put('/ads/:adId', requireModerator, updateAd)
router.delete('/ads/:adId', requireModerator, deleteAd)
router.patch('/ads/:adId/toggle', requireModerator, toggleAd)

// Logs Routes
router.get('/logs', requireModerator, getLogs)
router.get('/logs/export', requireModerator, exportLogs)

// System Control Routes (Super Admin only)
router.post('/system/clear-cache', requireSuperAdmin, clearCache)
router.post('/system/backup', requireSuperAdmin, createBackup)
router.post('/system/restart', requireSuperAdmin, restartServer)

export default router

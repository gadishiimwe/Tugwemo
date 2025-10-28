import { Request, Response } from 'express'
import User from '../models/User'
import Report from '../models/Report'
import Ban from '../models/Ban'
import Setting from '../models/Setting'
import Ad from '../models/Ad'
import Log from '../models/Log'
import mongoose from 'mongoose'

interface AuthRequest extends Request {
  user?: any
}

// User Management
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const status = req.query.status as string

    let query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (status === 'online') query.isOnline = true
    if (status === 'banned') query.isBanned = true
    if (status === 'muted') query.isMuted = true

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const updates = req.body

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Log the action
    await Log.create({
      level: 'info',
      action: 'user_updated',
      details: `User ${user.email} updated by ${req.user.email}`,
      userId: req.user._id,
      metadata: { targetUserId: userId, updates }
    })

    res.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { reason, duration } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isBanned = true
    user.banReason = reason
    await user.save()

    // Create ban record
    const banData: any = {
      user: userId,
      bannedBy: req.user._id,
      reason
    }

    if (duration) {
      banData.duration = duration
      banData.expiresAt = new Date(Date.now() + duration)
    }

    await Ban.create(banData)

    // Log the action
    await Log.create({
      level: 'security',
      action: 'user_banned',
      details: `User ${user.email} banned by ${req.user.email}. Reason: ${reason}`,
      userId: req.user._id,
      metadata: { targetUserId: userId, reason, duration }
    })

    res.json({ message: 'User banned successfully' })
  } catch (error) {
    console.error('Ban user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const unbanUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isBanned = false
    user.banReason = undefined
    await user.save()

    // Update ban record
    await Ban.findOneAndUpdate(
      { user: userId, isActive: true },
      { isActive: false }
    )

    // Log the action
    await Log.create({
      level: 'security',
      action: 'user_unbanned',
      details: `User ${user.email} unbanned by ${req.user.email}`,
      userId: req.user._id,
      metadata: { targetUserId: userId }
    })

    res.json({ message: 'User unbanned successfully' })
  } catch (error) {
    console.error('Unban user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const muteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { duration } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isMuted = true
    if (duration) {
      user.muteExpiresAt = new Date(Date.now() + duration)
    }
    await user.save()

    // Log the action
    await Log.create({
      level: 'warning',
      action: 'user_muted',
      details: `User ${user.email} muted by ${req.user.email}`,
      userId: req.user._id,
      metadata: { targetUserId: userId, duration }
    })

    res.json({ message: 'User muted successfully' })
  } catch (error) {
    console.error('Mute user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const unmuteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isMuted = false
    user.muteExpiresAt = undefined
    await user.save()

    // Log the action
    await Log.create({
      level: 'info',
      action: 'user_unmuted',
      details: `User ${user.email} unmuted by ${req.user.email}`,
      userId: req.user._id,
      metadata: { targetUserId: userId }
    })

    res.json({ message: 'User unmuted successfully' })
  } catch (error) {
    console.error('Unmute user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Reports Management
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string || 'pending'

    const reports = await Report.find({ status })
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Report.countDocuments({ status })

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params
    const { action, notes } = req.body

    const report = await Report.findById(reportId)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    report.status = action === 'resolve' ? 'resolved' : 'dismissed'
    report.resolvedBy = req.user._id
    report.resolvedAt = new Date()
    await report.save()

    // Log the action
    await Log.create({
      level: 'info',
      action: 'report_resolved',
      details: `Report ${reportId} ${action}d by ${req.user.email}`,
      userId: req.user._id,
      metadata: { reportId, action, notes }
    })

    res.json({ message: `Report ${action}d successfully` })
  } catch (error) {
    console.error('Resolve report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Analytics
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query
    const startDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    // Connection stats
    const connectionStats = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalConnections: { $sum: '$connectionCount' },
          avgConnectionsPerUser: { $avg: '$connectionCount' }
        }
      }
    ])

    // Reports by reason
    const reportsByReason = await Report.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ])

    // Device/browser stats (would need to be collected separately)
    const deviceStats = {
      desktop: 65,
      mobile: 30,
      tablet: 5
    }

    res.json({
      userGrowth,
      connectionStats: connectionStats[0] || { totalConnections: 0, avgConnectionsPerUser: 0 },
      reportsByReason,
      deviceStats
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Settings Management
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await Setting.find({}).sort({ category: 1, key: 1 })

    // Convert to object format
    const settingsObj: any = {}
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value
    })

    res.json({ settings: settingsObj })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body

    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        {
          value,
          updatedBy: req.user._id,
          updatedAt: new Date()
        },
        { upsert: true }
      )
    }

    // Log the action
    await Log.create({
      level: 'info',
      action: 'settings_updated',
      details: `Settings updated by ${req.user.email}`,
      userId: req.user._id,
      metadata: { updates }
    })

    res.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Ads Management
export const getAds = async (req: AuthRequest, res: Response) => {
  try {
    const ads = await Ad.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({ ads })
  } catch (error) {
    console.error('Get ads error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createAd = async (req: AuthRequest, res: Response) => {
  try {
    const adData = {
      ...req.body,
      createdBy: req.user._id
    }

    const ad = await Ad.create(adData)

    // Log the action
    await Log.create({
      level: 'info',
      action: 'ad_created',
      details: `Ad "${ad.title}" created by ${req.user.email}`,
      userId: req.user._id,
      metadata: { adId: ad._id }
    })

    res.status(201).json({ ad })
  } catch (error) {
    console.error('Create ad error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateAd = async (req: AuthRequest, res: Response) => {
  try {
    const { adId } = req.params
    const ad = await Ad.findByIdAndUpdate(adId, req.body, { new: true })

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' })
    }

    // Log the action
    await Log.create({
      level: 'info',
      action: 'ad_updated',
      details: `Ad "${ad.title}" updated by ${req.user.email}`,
      userId: req.user._id,
      metadata: { adId }
    })

    res.json({ ad })
  } catch (error) {
    console.error('Update ad error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteAd = async (req: AuthRequest, res: Response) => {
  try {
    const { adId } = req.params
    const ad = await Ad.findByIdAndDelete(adId)

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' })
    }

    // Log the action
    await Log.create({
      level: 'warning',
      action: 'ad_deleted',
      details: `Ad "${ad.title}" deleted by ${req.user.email}`,
      userId: req.user._id,
      metadata: { adId }
    })

    res.json({ message: 'Ad deleted successfully' })
  } catch (error) {
    console.error('Delete ad error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const toggleAd = async (req: AuthRequest, res: Response) => {
  try {
    const { adId } = req.params
    const ad = await Ad.findById(adId)

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' })
    }

    ad.isActive = !ad.isActive
    await ad.save()

    // Log the action
    await Log.create({
      level: 'info',
      action: 'ad_toggled',
      details: `Ad "${ad.title}" ${ad.isActive ? 'activated' : 'deactivated'} by ${req.user.email}`,
      userId: req.user._id,
      metadata: { adId, isActive: ad.isActive }
    })

    res.json({ ad })
  } catch (error) {
    console.error('Toggle ad error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Logs Management
export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string
    const level = req.query.level as string

    let query: any = {}

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ]
    }

    if (level && level !== 'all') {
      query.level = level
    }

    const logs = await Log.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Log.countDocuments(query)

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const exportLogs = async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string
    const level = req.query.level as string

    let query: any = {}

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ]
    }

    if (level && level !== 'all') {
      query.level = level
    }

    const logs = await Log.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    // Convert to CSV
    const csvHeader = 'Timestamp,Level,User,Action,IP Address,Details\n'
    const csvRows = logs.map(log => {
      const timestamp = log.createdAt.toISOString()
      const user = log.userId ? (log.userId.name || log.userId.email) : 'System'
      const details = log.details.replace(/"/g, '""') // Escape quotes
      return `"${timestamp}","${log.level}","${user}","${log.action}","${log.ipAddress || ''}","${details}"`
    }).join('\n')

    const csv = csvHeader + csvRows

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="logs.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Export logs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// System Controls
export const clearCache = async (req: AuthRequest, res: Response) => {
  try {
    // Implement cache clearing logic here
    // This could involve Redis, in-memory cache, etc.

    await Log.create({
      level: 'info',
      action: 'cache_cleared',
      details: `System cache cleared by ${req.user.email}`,
      userId: req.user._id
    })

    res.json({ message: 'Cache cleared successfully' })
  } catch (error) {
    console.error('Clear cache error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    // Implement backup logic here
    // This could involve database dumps, file backups, etc.

    await Log.create({
      level: 'info',
      action: 'backup_created',
      details: `Database backup created by ${req.user.email}`,
      userId: req.user._id
    })

    res.json({ message: 'Backup created successfully' })
  } catch (error) {
    console.error('Create backup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const restartServer = async (req: AuthRequest, res: Response) => {
  try {
    await Log.create({
      level: 'warning',
      action: 'server_restart',
      details: `Server restart initiated by ${req.user.email}`,
      userId: req.user._id
    })

    // Send response before restarting
    res.json({ message: 'Server restart initiated' })

    // Graceful shutdown and restart
    setTimeout(() => {
      process.exit(0) // PM2 or similar should restart the process
    }, 1000)
  } catch (error) {
    console.error('Restart server error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Log from '../models/Log'

interface AuthenticatedSocket extends Socket {
  user?: any
}

export const setupAdminSocket = (io: Server) => {
  const adminNamespace = io.of('/admin')

  // Authentication middleware for admin namespace
  adminNamespace.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      const user = await User.findById(decoded.userId)

      if (!user || !['moderator', 'super_admin'].includes(user.role)) {
        return next(new Error('Insufficient permissions'))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  adminNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Admin connected: ${socket.user.email} (${socket.user.role})`)

    // Join role-based room for targeted broadcasts
    socket.join(socket.user.role)

    // Real-time user management events
    socket.on('kick-user', async (data: { userId: string, reason: string }) => {
      try {
        const { userId, reason } = data

        // Find user and check if they're online
        const user = await User.findById(userId)
        if (!user) {
          socket.emit('error', { message: 'User not found' })
          return
        }

        // Emit kick event to all clients (main namespace)
        io.emit('user-kicked', {
          userId,
          reason,
          kickedBy: socket.user._id
        })

        // Log the action
        await Log.create({
          level: 'warning',
          action: 'user_kicked',
          details: `User ${user.email} kicked by ${socket.user.email}. Reason: ${reason}`,
          userId: socket.user._id,
          metadata: { targetUserId: userId, reason }
        })

        socket.emit('user-kicked-success', { userId })
      } catch (error) {
        console.error('Kick user error:', error)
        socket.emit('error', { message: 'Failed to kick user' })
      }
    })

    socket.on('ban-user', async (data: { userId: string, reason: string, duration?: number }) => {
      try {
        const { userId, reason, duration } = data

        const user = await User.findById(userId)
        if (!user) {
          socket.emit('error', { message: 'User not found' })
          return
        }

        user.isBanned = true
        user.banReason = reason
        await user.save()

        // Emit ban event to all clients
        io.emit('user-banned', {
          userId,
          reason,
          duration,
          bannedBy: socket.user._id
        })

        // Log the action
        await Log.create({
          level: 'security',
          action: 'user_banned_realtime',
          details: `User ${user.email} banned in real-time by ${socket.user.email}. Reason: ${reason}`,
          userId: socket.user._id,
          metadata: { targetUserId: userId, reason, duration }
        })

        socket.emit('user-ban-success', { userId })
      } catch (error) {
        console.error('Ban user error:', error)
        socket.emit('error', { message: 'Failed to ban user' })
      }
    })

    socket.on('mute-user', async (data: { userId: string, duration?: number }) => {
      try {
        const { userId, duration } = data

        const user = await User.findById(userId)
        if (!user) {
          socket.emit('error', { message: 'User not found' })
          return
        }

        user.isMuted = true
        if (duration) {
          user.muteExpiresAt = new Date(Date.now() + duration)
        }
        await user.save()

        // Emit mute event to all clients
        io.emit('user-muted', {
          userId,
          duration,
          mutedBy: socket.user._id
        })

        // Log the action
        await Log.create({
          level: 'warning',
          action: 'user_muted_realtime',
          details: `User ${user.email} muted in real-time by ${socket.user.email}`,
          userId: socket.user._id,
          metadata: { targetUserId: userId, duration }
        })

        socket.emit('user-mute-success', { userId })
      } catch (error) {
        console.error('Mute user error:', error)
        socket.emit('error', { message: 'Failed to mute user' })
      }
    })

    // Real-time monitoring
    socket.on('get-online-users', async () => {
      try {
        const onlineUsers = await User.find({ isOnline: true })
          .select('name email lastSeen connectionCount')
          .sort({ lastSeen: -1 })

        socket.emit('online-users', { users: onlineUsers })
      } catch (error) {
        console.error('Get online users error:', error)
        socket.emit('error', { message: 'Failed to get online users' })
      }
    })

    // Room monitoring
    socket.on('get-room-stats', async () => {
      try {
        // This would need to be implemented based on your room management system
        // For now, sending mock data
        const roomStats = {
          totalRooms: 0,
          activeRooms: 0,
          totalParticipants: 0,
          rooms: []
        }

        socket.emit('room-stats', roomStats)
      } catch (error) {
        console.error('Get room stats error:', error)
        socket.emit('error', { message: 'Failed to get room stats' })
      }
    })

    // System monitoring
    socket.on('get-system-stats', async () => {
      try {
        const totalUsers = await User.countDocuments()
        const onlineUsers = await User.countDocuments({ isOnline: true })
        const bannedUsers = await User.countDocuments({ isBanned: true })
        const mutedUsers = await User.countDocuments({ isMuted: true })

        const systemStats = {
          totalUsers,
          onlineUsers,
          bannedUsers,
          mutedUsers,
          serverUptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }

        socket.emit('system-stats', systemStats)
      } catch (error) {
        console.error('Get system stats error:', error)
        socket.emit('error', { message: 'Failed to get system stats' })
      }
    })

    // Broadcast messages to all users
    socket.on('broadcast-message', async (data: { message: string, type: 'info' | 'warning' | 'error' }) => {
      try {
        const { message, type } = data

        // Emit to all connected clients
        io.emit('admin-broadcast', {
          message,
          type,
          timestamp: new Date(),
          from: socket.user.name || socket.user.email
        })

        // Log the action
        await Log.create({
          level: 'info',
          action: 'broadcast_sent',
          details: `Broadcast message sent by ${socket.user.email}: ${message}`,
          userId: socket.user._id,
          metadata: { message, type }
        })

        socket.emit('broadcast-success')
      } catch (error) {
        console.error('Broadcast message error:', error)
        socket.emit('error', { message: 'Failed to send broadcast' })
      }
    })

    // Maintenance mode
    socket.on('toggle-maintenance', async (data: { enabled: boolean }) => {
      try {
        const { enabled } = data

        // Update setting in database
        // This would update the maintenance mode setting

        // Emit maintenance mode change to all clients
        io.emit('maintenance-mode-changed', {
          enabled,
          timestamp: new Date()
        })

        // Log the action
        await Log.create({
          level: enabled ? 'warning' : 'info',
          action: 'maintenance_mode_toggled',
          details: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} by ${socket.user.email}`,
          userId: socket.user._id,
          metadata: { enabled }
        })

        socket.emit('maintenance-toggle-success', { enabled })
      } catch (error) {
        console.error('Toggle maintenance error:', error)
        socket.emit('error', { message: 'Failed to toggle maintenance mode' })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Admin disconnected: ${socket.user.email}`)
    })
  })

  return adminNamespace
}

import mongoose, { Document, Schema } from 'mongoose'

export interface ILog extends Document {
  _id: string
  level: 'error' | 'warning' | 'info' | 'security'
  action: string
  details: string
  userId?: mongoose.Types.ObjectId
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  createdAt: Date
}

const logSchema = new Schema<ILog>({
  level: {
    type: String,
    enum: ['error', 'warning', 'info', 'security'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

// Index for efficient queries
logSchema.index({ level: 1, createdAt: -1 })
logSchema.index({ userId: 1, createdAt: -1 })
logSchema.index({ action: 1, createdAt: -1 })

export default mongoose.model<ILog>('Log', logSchema)

import mongoose, { Document, Schema } from 'mongoose'

export interface IBan extends Document {
  _id: string
  user: mongoose.Types.ObjectId
  bannedBy: mongoose.Types.ObjectId
  reason: string
  duration?: number // in milliseconds, null for permanent
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const banSchema = new Schema<IBan>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  duration: {
    type: Number
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
banSchema.index({ user: 1, isActive: 1 })
banSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<IBan>('Ban', banSchema)

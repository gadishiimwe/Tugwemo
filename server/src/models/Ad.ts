import mongoose, { Document, Schema } from 'mongoose'

export interface IAd extends Document {
  _id: string
  title: string
  content: string
  imageUrl?: string
  targetUrl: string
  isActive: boolean
  startDate?: Date
  endDate?: Date
  targetAudience: 'all' | 'new' | 'premium'
  impressions: number
  clicks: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const adSchema = new Schema<IAd>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  targetUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new', 'premium'],
    default: 'all'
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
adSchema.index({ isActive: 1, targetAudience: 1 })
adSchema.index({ startDate: 1, endDate: 1 })

export default mongoose.model<IAd>('Ad', adSchema)

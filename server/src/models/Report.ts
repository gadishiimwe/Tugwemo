import mongoose, { Document, Schema } from 'mongoose'

export interface IReport extends Document {
  _id: string
  reporter: mongoose.Types.ObjectId
  reportedUser: mongoose.Types.ObjectId
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  resolvedBy?: mongoose.Types.ObjectId
  resolvedAt?: Date
  roomId?: string
  screenshot?: string
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous reports
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['harassment', 'inappropriate_content', 'spam', 'abuse', 'other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  roomId: {
    type: String
  },
  screenshot: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ reportedUser: 1, status: 1 })

export default mongoose.model<IReport>('Report', reportSchema)

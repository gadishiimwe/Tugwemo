import mongoose, { Document, Schema } from 'mongoose'

export interface ISetting extends Document {
  _id: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
  category: string
  isPublic: boolean
  updatedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const settingSchema = new Schema<ISetting>({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object'],
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'chat', 'system', 'security', 'email', 'notifications', 'performance', 'integrations', 'moderation', 'analytics', 'ads']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Index for efficient queries
settingSchema.index({ category: 1, key: 1 })

export default mongoose.model<ISetting>('Setting', settingSchema)

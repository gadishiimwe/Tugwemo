import mongoose, { Document, Schema } from 'mongoose'

export interface ISettingHistory extends Document {
  _id: string
  settingKey: string
  oldValue: any
  newValue: any
  type: 'string' | 'number' | 'boolean' | 'object'
  category: string
  changedBy: mongoose.Types.ObjectId
  changeReason?: string
  createdAt: Date
}

const settingHistorySchema = new Schema<ISettingHistory>({
  settingKey: {
    type: String,
    required: true,
    index: true
  },
  oldValue: {
    type: Schema.Types.Mixed
  },
  newValue: {
    type: Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'chat', 'system', 'security', 'email', 'notifications', 'performance', 'integrations', 'moderation', 'analytics', 'ads']
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeReason: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
settingHistorySchema.index({ settingKey: 1, createdAt: -1 })
settingHistorySchema.index({ changedBy: 1, createdAt: -1 })

export default mongoose.model<ISettingHistory>('SettingHistory', settingHistorySchema)

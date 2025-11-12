import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  age?: number
  sex?: 'boy' | 'girl' | 'other'
  sexOther?: string
  role: 'user' | 'moderator' | 'super_admin'
  isOnline: boolean
  lastSeen: Date
  connectionCount: number
  reportCount: number
  isBanned: boolean
  banReason?: string
  isMuted: boolean
  muteExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  sex: {
    type: String,
    enum: ['boy', 'girl', 'other']
  },
  sexOther: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'super_admin'],
    default: 'user'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  connectionCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  muteExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>('User', userSchema)

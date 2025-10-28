import mongoose from 'mongoose'
import User from '../models/User'
import dotenv from 'dotenv'

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tugwemo')
    console.log('Connected to MongoDB')

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' })
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email)
      return
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@tugwemo.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'super_admin'
    })

    await superAdmin.save()
    console.log('Super admin created successfully!')
    console.log('Email: admin@tugwemo.com')
    console.log('Password: admin123')

    // Create moderator
    const moderator = new User({
      name: 'Moderator',
      email: 'mod@tugwemo.com',
      password: 'mod123',
      role: 'moderator'
    })

    await moderator.save()
    console.log('Moderator created successfully!')
    console.log('Email: mod@tugwemo.com')
    console.log('Password: mod123')

  } catch (error) {
    console.error('Error seeding admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedAdmin()

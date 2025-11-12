import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import Report from '../models/Report'

dotenv.config()

const seedAdmin = async () => {
  try {
    // ✅ Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env')
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // --- Super Admin ---
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' })
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'gadyishimwe1@gmail.com',
        password: 'admin123', // Will be hashed by User model pre-save hook
        role: 'super_admin'
      })
      await superAdmin.save()
      console.log('✅ Super admin created: gadyishimwe1@gmail.com / admin123')
    } else {
      console.log('ℹ Super admin already exists:', existingSuperAdmin.email)
    }

    // --- Moderator ---
    const existingModerator = await User.findOne({ role: 'moderator' })
    if (!existingModerator) {
      const moderator = new User({
        name: 'Moderator',
        email: 'mod@tugwemo.com',
        password: 'mod123',
        role: 'moderator'
      })
      await moderator.save()
      console.log('✅ Moderator created: mod@tugwemo.com / mod123')
    } else {
      console.log('ℹ Moderator already exists:', existingModerator.email)
    }

    // --- Test Users ---
    let user1 = await User.findOne({ email: 'user1@test.com' })
    let user2 = await User.findOne({ email: 'user2@test.com' })

    if (!user1) {
      user1 = new User({
        name: 'Test User 1',
        email: 'user1@test.com',
        password: 'user123',
        role: 'user'
      })
      await user1.save()
    }
    if (!user2) {
      user2 = new User({
        name: 'Test User 2',
        email: 'user2@test.com',
        password: 'user123',
        role: 'user'
      })
      await user2.save()
    }
    console.log('✅ Test users ready!')

    // --- Test Reports ---
    const reports = [
      { reporter: user1._id, reportedUser: user2._id, reason: 'harassment', description: 'Test report for harassment', status: 'pending' },
      { reporter: user2._id, reportedUser: user1._id, reason: 'spam', description: 'Test report for spam', status: 'resolved' },
      { reporter: user1._id, reportedUser: user2._id, reason: 'inappropriate_content', description: 'Inappropriate content reported', status: 'pending' },
      { reporter: user2._id, reportedUser: user1._id, reason: 'abuse', description: 'Abusive behavior reported', status: 'dismissed' },
      { reporter: user1._id, reportedUser: user2._id, reason: 'other', description: 'Other violation reported', status: 'pending' },
      { reporter: null, reportedUser: user2._id, reason: 'harassment', description: 'Anonymous report for harassment', status: 'pending' }
    ]

    for (const reportData of reports) {
      const report = new Report(reportData)
      await report.save()
    }
    console.log('✅ Test reports created!')

  } catch (error) {
    console.error('❌ Error seeding admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedAdmin()

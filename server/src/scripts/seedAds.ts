import mongoose from 'mongoose'
import Ad from '../models/Ad'
import dotenv from 'dotenv'

dotenv.config()

const seedAds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tugwemo')
    console.log('Connected to MongoDB')

    // Check if ads already exist
    const existingAds = await Ad.find()
    if (existingAds.length > 0) {
      console.log(`Ads already exist (${existingAds.length} ads found). Skipping seed.`)
      return
    }

    // Create sample ads
    const ads = [
      {
        title: '🎮 Play Online Games',
        content: 'Join thousands of players in exciting online games. Free to play, no downloads required!',
        imageUrl: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=GAMES',
        targetUrl: 'https://example.com/games',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        impressions: 0,
        clicks: 0
      },
      {
        title: '📱 Mobile Apps Store',
        content: 'Discover amazing mobile apps and games. Download now and enhance your experience!',
        imageUrl: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=APPS',
        targetUrl: 'https://example.com/apps',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        impressions: 0,
        clicks: 0
      },
      {
        title: '🎵 Music Streaming',
        content: 'Stream millions of songs ad-free. Create playlists and discover new music every day!',
        imageUrl: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=MUSIC',
        targetUrl: 'https://example.com/music',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        impressions: 0,
        clicks: 0
      },
      {
        title: '📚 Learn New Skills',
        content: 'Take online courses and learn programming, design, business and more. Start your journey today!',
        imageUrl: 'https://via.placeholder.com/200x200/F9CA24/FFFFFF?text=LEARN',
        targetUrl: 'https://example.com/learn',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        impressions: 0,
        clicks: 0
      },
      {
        title: '🛒 Online Shopping',
        content: 'Shop millions of products with free delivery. Best prices guaranteed on electronics, fashion & more!',
        imageUrl: 'https://via.placeholder.com/200x200/6C5CE7/FFFFFF?text=SHOP',
        targetUrl: 'https://example.com/shop',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        impressions: 0,
        clicks: 0
      }
    ]

    for (const adData of ads) {
      const ad = new Ad(adData)
      await ad.save()
      console.log(`Created ad: ${ad.title}`)
    }

    console.log(`Successfully seeded ${ads.length} ads!`)

  } catch (error) {
    console.error('Error seeding ads:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedAds()

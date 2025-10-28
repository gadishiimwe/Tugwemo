import express from 'express'
import { login, getProfile } from '../controllers/authController'
import { authenticateToken } from '../middlewares/auth'

const router = express.Router()

// Admin login route
router.post('/login', login)

// Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile)

export default router

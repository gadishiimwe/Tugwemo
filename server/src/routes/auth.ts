import express from 'express'
import { login, register, userLogin, getProfile } from '../controllers/authController'
import { authenticateToken } from '../middlewares/auth'

const router = express.Router()

// Admin login route
router.post('/login', login)

// User registration
router.post('/register', register)

// User login
router.post('/user/login', userLogin)

// Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile)

export default router

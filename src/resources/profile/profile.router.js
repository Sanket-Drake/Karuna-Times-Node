import { Router } from 'express'
import {
  getUserProfile,
  viewSelfProfile,
  getUsersProfile,
  updateSocialProfile,
  uploadProfilePicture,
  updateDescription
} from './profile.controllers'
// import { isAuthenticated } from '../../utils/auth'

const router = Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// router.get('/me', isAuthenticated(), viewSelfProfile)
// router.get('/user/:id', isAuthenticated(), getUserProfile)
// router.post('/update-social-link', isAuthenticated(), updateSocialProfile)
// router.post('/upload-profile-picture', [isAuthenticated(), upload.single('image')], uploadProfilePicture)
// router.get('/username/:username', isAuthenticated(), getUsersProfile)
// router.post('/update-description', isAuthenticated(), updateDescription)

export default router

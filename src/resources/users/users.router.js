import { Router } from 'express'
import {
  getList,
  getUser,
  scoreUser,
  updateUserLocation,
  emailVerify,
  emailVerifyResend,
  insertUserPlatforms,
  updateUserLocations,
  updateUserProfession,
  Onboarding4
} from './users.controllers'
import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/list', getList)
router.get('/one', getUser)
router.post('/score-one', scoreUser)
router.post('/update-location', updateUserLocation)
router.post('/email-verify', isAuthenticated(), emailVerify)
router.post('/resend-email-verify', isAuthenticated(), emailVerifyResend)
router.post('/insert-user-platform', isAuthenticated(), insertUserPlatforms)
router.post('/update-user-location', isAuthenticated(), updateUserLocations) // Update Location API
router.post('/update-wageperhour-service-skills', isAuthenticated(), Onboarding4) // Insert API for wageperhour,service,skills
router.post('/update-user-profession', isAuthenticated(), updateUserProfession)

export default router

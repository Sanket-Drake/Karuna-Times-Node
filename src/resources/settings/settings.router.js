import { Router } from 'express'
import { sendEmailOTP, changePassword } from './settings.controllers'

const router = Router()

router.post('/forget-password-email-otp', sendEmailOTP)
router.post('/change-password', changePassword)

export default router

import { Router } from 'express'
import { getUserNotification, updateUserNotification } from './notification.controllers'
import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/user-notification', isAuthenticated(), getUserNotification)
router.post('/update-notification',isAuthenticated(), updateUserNotification)

export default router

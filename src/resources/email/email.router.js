import { Router } from 'express'
import {
  messagePendingForever,
    jobsPendingForever,
  newNotifications
} from './email.controllers'
// import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/notifs', newNotifications)
router.get('/message-pending-forever', messagePendingForever)
router.get('/jobs-pending-forever', jobsPendingForever)

export default router

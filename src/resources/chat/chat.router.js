import { Router } from 'express'
import {
  getAllChat,
  getUserChatByConversationId,
  getConversationByUserId,
  customOffer,
  userProjectInquiry
} from './chat.controllers'
import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/all-chat', isAuthenticated(), getAllChat)
router.get('/user-chat/:conversationId', isAuthenticated(), getUserChatByConversationId)
router.get('/conversation', isAuthenticated(), getConversationByUserId)
router.post('/custom-offer', isAuthenticated(), customOffer)
router.post('/project-inquiry', isAuthenticated(), userProjectInquiry)

export default router

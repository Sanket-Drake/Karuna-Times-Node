import { Router } from 'express'
import { generalSearch, generalTest, serviceSearch } from './search.controllers'
// import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/general', generalSearch)
router.get('/service', serviceSearch)
router.post('/general-test', generalTest)
// router.get('/pro-general', isAuthenticated(), generalSearch)

export default router

import { Router } from 'express'

import {
  getCountry,
  getState,
  getCity,
  getUserLocation,
  getUserSocialPlatforms,
  getSocialPlatforms,
  getSkills,
  getService,
  getPortfolioTags
} from './prefetch.controllers'

// import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/get-country', getCountry)
router.get('/get-state/:cid', getState)
router.get('/get-city/:sid', getCity)
// router.get('/get-user-location', isAuthenticated(), getUserLocation)
// router.get(
//   '/get-users-social-platforms',
//   isAuthenticated(),
//   getUserSocialPlatforms
// )
router.get('/get-social-platforms', getSocialPlatforms)
router.get('/get-skills',getSkills)
router.get('/get-services',getService)
router.get('/get-portfolio-tags', getPortfolioTags)

export default router
                 
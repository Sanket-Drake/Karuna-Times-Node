import { Router } from 'express'
import { getHospitals, viewMyPortfolio, viewPortfolioById, viewPortfolioByUser } from './hospital.controllers'
// import { isAuthenticated } from '../../utils/auth'

const router = Router()

router.get('/list', getHospitals)
// router.get('/one-portfolio/:id', isAuthenticated(), viewPortfolioById)
// router.get('/user-portfolio', isAuthenticated(), viewPortfolioByUser)
// router.get('/my-portfolio', isAuthenticated(), viewMyPortfolio)

export default router

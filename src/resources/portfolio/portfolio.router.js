import { Router } from 'express'
import { uploadPortfolio, viewMyPortfolio, viewPortfolioById, viewPortfolioByUser } from './portfolio.controllers'
// import { isAuthenticated } from '../../utils/auth'

const router = Router()

// router.post('/upload-portfolio', isAuthenticated(), uploadPortfolio)
// router.get('/one-portfolio/:id', isAuthenticated(), viewPortfolioById)
// router.get('/user-portfolio', isAuthenticated(), viewPortfolioByUser)
// router.get('/my-portfolio', isAuthenticated(), viewMyPortfolio)

export default router

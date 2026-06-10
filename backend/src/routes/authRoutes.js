import { Router } from 'express'
import { registro, login, perfil } from '../controllers/authController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router()

// Rutas públicas (no necesitan token)
router.post('/registro', registro)
router.post('/login', login)

// Rutas protegidas (necesitan token)
router.get('/perfil', verificarToken, perfil)

export default router
import { Router } from 'express'
import { listarTecnicos, listarUsuarios } from '../controllers/usuarioController.js'
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(verificarToken)

// Listar técnicos — admin y técnicos pueden ver (para reasignar)
router.get('/tecnicos', verificarRol('administrador', 'tecnico_n1', 'tecnico_n2'), listarTecnicos)

// Listar todos los usuarios — solo admin
router.get('/', verificarRol('administrador'), listarUsuarios)

export default router
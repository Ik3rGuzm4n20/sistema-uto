import { Router } from 'express'
import { crearComentario, listarComentarios } from '../controllers/comentarioController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = Router({ mergeParams: true })

router.use(verificarToken)

router.post('/', crearComentario)
router.get('/', listarComentarios)

export default router
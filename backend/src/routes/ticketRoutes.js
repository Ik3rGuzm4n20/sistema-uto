import { Router } from 'express'
import {
  crearTicket,
  obtenerTickets,
  obtenerTicketPorId,
  actualizarEstado,
  dashboard,
  reasignarTecnico
} from '../controllers/ticketController.js'
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js'

const router = Router()

// Todas las rutas de tickets requieren token
router.use(verificarToken)

// Crear ticket — cualquier usuario autenticado
router.post('/', crearTicket)

// Obtener todos los tickets — según rol
router.get('/', obtenerTickets)

// Dashboard métricas — solo admin y técnicos
router.get('/dashboard', verificarRol('administrador', 'tecnico_n1', 'tecnico_n2'), dashboard)

// Obtener ticket por ID
router.get('/:id', obtenerTicketPorId)

// Actualizar estado — solo técnicos y admin
router.patch('/:id/estado', verificarRol('administrador', 'tecnico_n1', 'tecnico_n2'), actualizarEstado)

// Reasignar técnico — solo admin
router.patch('/:id/reasignar', verificarRol('administrador'), reasignarTecnico)

export default router
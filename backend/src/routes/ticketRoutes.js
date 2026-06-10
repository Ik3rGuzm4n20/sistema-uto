import { Router } from 'express'

const router = Router()

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Rutas de tickets funcionando ✅' })
})

export default router
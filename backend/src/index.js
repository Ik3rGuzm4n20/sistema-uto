import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/usuarios', usuarioRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend Sistema UTO funcionando ✅' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
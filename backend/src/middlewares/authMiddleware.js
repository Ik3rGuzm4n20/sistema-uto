import jwt from 'jsonwebtoken'

export const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const token = authHeader.split(' ')[1]

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded

    next()

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Middleware para verificar roles
export const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' })
    }
    next()
  }
}
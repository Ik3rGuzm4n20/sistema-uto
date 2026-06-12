import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, rolesPermitidos }) => {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <p>Cargando...</p>
  }

  // No hay sesión → redirige al login
  if (!usuario) {
    return <Navigate to="/login" />
  }

  // Hay sesión pero el rol no está permitido
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default PrivateRoute
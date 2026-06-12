import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    document.title = 'Login - Sistema UTO'
  }, [])

  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const data = await login(correo, contrasena)
      iniciarSesion(data.token, data.usuario)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.card}>
        <h1 style={estilos.titulo}>Sistema UTO</h1>
        <p style={estilos.subtitulo}>Gestión de Incidentes Tecnológicos</p>

        <form onSubmit={handleSubmit}>
          <div style={estilos.campo}>
            <label style={estilos.label}>Correo institucional</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={estilos.input}
              placeholder="usuario@uto.edu.gt"
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Contraseña</label>
            <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={mostrarContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                style={{ ...estilos.input, paddingRight: '40px' }}
                placeholder="••••••••"
              />
            <span
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                style={estilos.ojito}
              >
                {mostrarContrasena ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {error && <p style={estilos.error}>{error}</p>}

          <button type="submit" style={estilos.boton} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#DEEAF1',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '380px'
  },
  titulo: {
    color: '#1F3864',
    textAlign: 'center',
    margin: 0,
    fontSize: '28px'
  },
  subtitulo: {
    color: '#2E75B6',
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '30px'
  },
  campo: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#444',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #BDD7EE',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  boton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1F3864',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  error: {
    color: '#C00000',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '15px'
  },
  ojito: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '18px',
    userSelect: 'none',
    zIndex: 10
  },
}

export default Login
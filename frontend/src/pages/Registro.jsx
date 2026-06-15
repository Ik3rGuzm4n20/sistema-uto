import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registro } from '../services/authService'

const Registro = () => {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    document.title = 'Registro - Sistema UTO'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setCargando(true)

    try {
      await registro(nombre, correo, contrasena, 'usuario_final')
      setExito('Cuenta creada exitosamente. Ya puedes iniciar sesión.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.card}>
        <h1 style={estilos.titulo}>Sistema UTO</h1>
        <p style={estilos.subtitulo}>Crear cuenta de Usuario</p>

        <form onSubmit={handleSubmit}>
          <div style={estilos.campo}>
            <label style={estilos.label}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={estilos.input}
              placeholder="Tu nombre completo"
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={estilos.input}
              placeholder="tu_correo@gmail.com"
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
          {exito && <p style={estilos.exito}>✅ {exito}</p>}

          <button type="submit" style={estilos.boton} disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p style={estilos.link}>
          ¿Ya tienes cuenta? <Link to="/login" style={estilos.linkTexto}>Inicia sesión</Link>
        </p>
        <p style={estilos.link}>
          <Link to="/" style={estilos.linkTexto}>← Volver</Link>
        </p>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', width: '100%', backgroundColor: '#DEEAF1', fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white', padding: '40px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '380px'
  },
  titulo: { color: '#1F3864', textAlign: 'center', margin: 0, fontSize: '28px' },
  subtitulo: { color: '#2E75B6', textAlign: 'center', fontSize: '14px', marginBottom: '30px' },
  campo: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontSize: '14px', fontWeight: 'bold' },
  input: {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #BDD7EE',
    fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#e7e7e7', color: '#2b2727'
  },
  ojito: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    cursor: 'pointer', fontSize: '18px', userSelect: 'none', zIndex: 10
  },
  boton: {
    width: '100%', padding: '12px', backgroundColor: '#1F3864', color: 'white',
    border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px'
  },
  error: { color: '#C00000', fontSize: '13px', textAlign: 'center', marginBottom: '15px' },
  exito: { color: '#375623', backgroundColor: '#E2EFDA', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', marginBottom: '15px' },
  link: { textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '12px' },
  linkTexto: { color: '#2E75B6', textDecoration: 'none', fontWeight: 'bold' }
}

export default Registro
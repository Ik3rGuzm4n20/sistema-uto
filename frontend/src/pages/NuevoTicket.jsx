import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearTicket } from '../services/ticketService'

const NuevoTicket = () => {
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('software')
  const [tipo, setTipo] = useState('incidente')
  const [urgencia, setUrgencia] = useState('media')
  const [impacto, setImpacto] = useState('medio')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    document.title = 'Nuevo Ticket - Sistema UTO'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setCargando(true)

    try {
      const data = await crearTicket({
        titulo, descripcion, categoria, tipo, urgencia, impacto
      })
      setExito(`Ticket creado: ${data.ticket.codigo}`)
      setTimeout(() => navigate('/tickets'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ticket')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <button onClick={() => navigate('/tickets')} style={estilos.botonNav}>
          ← Volver a Tickets
        </button>
      </nav>

      <div style={estilos.contenido}>
        <div style={estilos.card}>
          <h1 style={estilos.titulo}>Reportar Nuevo Incidente</h1>
          <p style={estilos.subtitulo}>Completa el formulario para crear un nuevo ticket</p>

          <form onSubmit={handleSubmit}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Título del problema</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                style={estilos.input}
                placeholder="Ej: No puedo acceder a la plataforma"
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Descripción detallada</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                style={estilos.textarea}
                placeholder="Describe el problema con el mayor detalle posible..."
                rows={4}
              />
            </div>

            <div style={estilos.fila}>
              <div style={estilos.campoMitad}>
                <label style={estilos.label}>Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={estilos.input}>
                  <option value="red">Red</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="acceso">Acceso</option>
                  <option value="correo">Correo</option>
                  <option value="plataforma">Plataforma Académica</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div style={estilos.campoMitad}>
                <label style={estilos.label}>Tipo de solicitud</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={estilos.input}>
                  <option value="incidente">Incidente</option>
                  <option value="solicitud">Solicitud de servicio</option>
                </select>
              </div>
            </div>

            <div style={estilos.fila}>
              <div style={estilos.campoMitad}>
                <label style={estilos.label}>Urgencia percibida</label>
                <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)} style={estilos.input}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div style={estilos.campoMitad}>
                <label style={estilos.label}>Impacto (usuarios afectados)</label>
                <select value={impacto} onChange={(e) => setImpacto(e.target.value)} style={estilos.input}>
                  <option value="bajo">Bajo (solo yo)</option>
                  <option value="medio">Medio (mi área)</option>
                  <option value="alto">Alto (toda la institución)</option>
                </select>
              </div>
            </div>

            {error && <p style={estilos.error}>{error}</p>}
            {exito && <p style={estilos.exito}>✅ {exito}</p>}

            <button type="submit" style={estilos.boton} disabled={cargando}>
              {cargando ? 'Creando ticket...' : 'Crear Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#F2F2F2'
  },
  navbar: {
    backgroundColor: '#1F3864',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoNav: {
    color: 'white',
    margin: 0
  },
  botonNav: {
    backgroundColor: '#2E75B6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  contenido: {
    padding: '30px',
    display: 'flex',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '700px'
  },
  titulo: {
    color: '#1F3864',
    margin: 0,
    marginBottom: '15px'
  },
  subtitulo: {
    color: '#666',
    marginTop: '0px',
    marginBottom: '40px',
    fontSize: '16px'
  },
  campo: {
    marginBottom: '18px'
  },
  fila: {
    display: 'flex',
    gap: '15px',
    marginBottom: '18px'
  },
  campoMitad: {
    flex: 1
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
    boxSizing: 'border-box',
    backgroundColor: '#e7e7e7',
    color: '#2b2727'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #BDD7EE',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
    backgroundColor: '#e7e7e7',
    color: '#2b2727'
  },
  boton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1F3864',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    color: '#C00000',
    fontSize: '13px',
    marginBottom: '10px'
  },
  exito: {
    color: '#375623',
    backgroundColor: '#E2EFDA',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '10px'
  }
}

export default NuevoTicket
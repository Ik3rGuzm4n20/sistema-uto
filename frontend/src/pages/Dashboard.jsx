import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerDashboard } from '../services/ticketService'

const Dashboard = () => {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarMetricas()
  }, [])

  useEffect(() => {
    document.title = 'Dashboard - Sistema UTO'
  }, [])

  const cargarMetricas = async () => {
    try {
      const data = await obtenerDashboard()
      setMetricas(data.metricas)
    } catch (err) {
      setError('No se pudieron cargar las métricas')
    }
  }

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <div style={estilos.contenedor}>
      {/* Navbar */}
      <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <div style={estilos.navDerecha}>
          <span style={estilos.usuarioNav}>
            {usuario?.nombre} · <strong>{usuario?.rol}</strong>
          </span>
          <button onClick={() => navigate('/tickets')} style={estilos.botonNav}>
            Tickets
          </button>
          <button onClick={handleLogout} style={estilos.botonSalir}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={estilos.contenido}>
        <h1 style={estilos.titulo}>Dashboard</h1>
        <p style={estilos.subtitulo}>Métricas en tiempo real del sistema</p>

        {error && <p style={estilos.error}>{error}</p>}

        {metricas && (
          <div style={estilos.grid}>
            <div style={{ ...estilos.card, borderLeft: '5px solid #2E75B6' }}>
              <p style={estilos.numero}>{metricas.total}</p>
              <p style={estilos.label}>Total Tickets</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #ED7D31' }}>
              <p style={estilos.numero}>{metricas.abiertos}</p>
              <p style={estilos.label}>Abiertos</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #FFC000' }}>
              <p style={estilos.numero}>{metricas.en_proceso}</p>
              <p style={estilos.label}>En Proceso</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #C00000' }}>
              <p style={estilos.numero}>{metricas.criticos}</p>
              <p style={estilos.label}>Críticos</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #70AD47' }}>
              <p style={estilos.numero}>{metricas.resueltos_hoy}</p>
              <p style={estilos.label}>Resueltos Hoy</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #595959' }}>
              <p style={estilos.numero}>{metricas.cerrados}</p>
              <p style={estilos.label}>Cerrados</p>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/tickets/nuevo')} style={estilos.botonCrear}>
          + Crear Nuevo Ticket
        </button>
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
  navDerecha: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  usuarioNav: {
    color: '#BDD7EE',
    fontSize: '14px'
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
  botonSalir: {
    backgroundColor: '#C00000',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  contenido: {
    padding: '30px'
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  numero: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1F3864',
    margin: 0
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px'
  },
  botonCrear: {
    backgroundColor: '#1F3864',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  error: {
    color: '#C00000',
    marginBottom: '20px'
  }
}

export default Dashboard
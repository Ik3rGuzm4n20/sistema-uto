import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerDashboard } from '../services/ticketService'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
          <div style={estilos.graficasGrid}>
            <div style={estilos.graficaCard}>
              <h3 style={estilos.tituloGrafica}>Tickets por Estado</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Abiertos', value: metricas.abiertos },
                      { name: 'En Proceso', value: metricas.en_proceso },
                      { name: 'Resueltos Hoy', value: metricas.resueltos_hoy },
                      { name: 'Cerrados', value: metricas.cerrados }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#2E75B6" />
                    <Cell fill="#FFC000" />
                    <Cell fill="#70AD47" />
                    <Cell fill="#595959" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={estilos.graficaCard}>
              <h3 style={estilos.tituloGrafica}>Tickets Críticos vs Total</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { nombre: 'Total', cantidad: metricas.total },
                    { nombre: 'Críticos', cantidad: metricas.criticos },
                    { nombre: 'Abiertos', cantidad: metricas.abiertos },
                    { nombre: 'Cerrados', cantidad: metricas.cerrados }
                  ]}
                >
                  <XAxis dataKey="nombre" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#1F3864" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
  graficasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  graficaCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  tituloGrafica: {
    color: '#1F3864',
    margin: 0,
    marginBottom: '15px',
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
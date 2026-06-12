import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerTickets, actualizarEstado } from '../services/ticketService'

const Tickets = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.title = 'Tickets - Sistema UTO'
    cargarTickets()
  }, [])

  const cargarTickets = async () => {
    try {
      const data = await obtenerTickets()
      setTickets(data.tickets)
    } catch (err) {
      setError('No se pudieron cargar los tickets')
    } finally {
      setCargando(false)
    }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstado(id, nuevoEstado, `Cambiado a ${nuevoEstado} desde el panel`)
      cargarTickets() // recarga la lista
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado')
    }
  }

  // Próximo estado posible según el flujo definido en el backend
  const siguienteEstado = {
    abierto: 'en_proceso',
    en_proceso: 'resuelto',
    escalado: 'resuelto',
    resuelto: 'cerrado'
  }

  const colorPrioridad = {
    critica: '#C00000',
    alta: '#ED7D31',
    media: '#FFC000',
    baja: '#70AD47'
  }

  const colorEstado = {
    abierto: '#2E75B6',
    en_proceso: '#FFC000',
    escalado: '#C00000',
    resuelto: '#70AD47',
    cerrado: '#595959'
  }

  const puedeCambiarEstado = ['administrador', 'tecnico_n1', 'tecnico_n2'].includes(usuario?.rol)

  return (
    <div style={estilos.contenedor}>
      <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <div style={estilos.navDerecha}>
          <button onClick={() => navigate('/dashboard')} style={estilos.botonNav}>
            ← Dashboard
          </button>
          <button onClick={() => navigate('/tickets/nuevo')} style={estilos.botonNuevo}>
            + Nuevo Ticket
          </button>
        </div>
      </nav>

      <div style={estilos.contenido}>
        <h1 style={estilos.titulo}>Tickets</h1>
        <p style={estilos.subtitulo}>
          {usuario?.rol === 'usuario_final'
            ? 'Tus tickets reportados'
            : 'Todos los tickets asignados a ti'}
        </p>

        {error && <p style={estilos.error}>{error}</p>}
        {cargando && <p>Cargando tickets...</p>}

        {!cargando && tickets.length === 0 && (
          <p style={estilos.vacio}>No hay tickets registrados todavía.</p>
        )}

        {!cargando && tickets.length > 0 && (
          <div style={estilos.tablaWrap}>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Código</th>
                  <th style={estilos.th}>Título</th>
                  <th style={estilos.th}>Categoría</th>
                  <th style={estilos.th}>Prioridad</th>
                  <th style={estilos.th}>Estado</th>
                  <th style={estilos.th}>SLA Límite</th>
                  {puedeCambiarEstado && <th style={estilos.th}>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={estilos.td}><strong>{ticket.codigo}</strong></td>
                    <td style={estilos.td}>{ticket.titulo}</td>
                    <td style={estilos.td}>{ticket.categoria}</td>
                    <td style={estilos.td}>
                      <span style={{
                        ...estilos.badge,
                        backgroundColor: colorPrioridad[ticket.prioridad]
                      }}>
                        {ticket.prioridad.toUpperCase()}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      <span style={{
                        ...estilos.badge,
                        backgroundColor: colorEstado[ticket.estado]
                      }}>
                        {ticket.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      {new Date(ticket.sla_limite).toLocaleString('es-GT')}
                    </td>
                    {puedeCambiarEstado && (
                      <td style={estilos.td}>
                        {siguienteEstado[ticket.estado] ? (
                          <button
                            onClick={() => handleCambiarEstado(ticket.id, siguienteEstado[ticket.estado])}
                            style={estilos.botonAccion}
                          >
                            → {siguienteEstado[ticket.estado].replace('_', ' ')}
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: '12px' }}>Sin acciones</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    gap: '10px'
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
  botonNuevo: {
    backgroundColor: '#70AD47',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  contenido: {
    padding: '30px'
  },
  titulo: {
    color: '#1F3864',
    margin: 0,
    marginBottom: '10px'
  },
  subtitulo: {
    color: '#666',
    marginTop: 0,
    marginBottom: '30px',
    fontSize: '15px'
  },
  tablaWrap: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    overflow: 'auto'
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  th: {
    textAlign: 'left',
    padding: '14px',
    backgroundColor: '#1F3864',
    color: 'white',
    fontSize: '13px'
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #eee',
    color: '#333'
  },
  badge: {
    color: 'white',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  botonAccion: {
    backgroundColor: '#1F3864',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  error: {
    color: '#C00000',
    marginBottom: '20px'
  },
  vacio: {
    color: '#666',
    textAlign: 'center',
    padding: '40px'
  }
}

export default Tickets
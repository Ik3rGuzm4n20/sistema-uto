import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerTickets, actualizarEstado, reasignarTecnico } from '../services/ticketService'
import { listarTecnicos } from '../services/usuarioService'


const Tickets = () => {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [tecnicos, setTecnicos] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    document.title = 'Tickets - Sistema UTO'
    cargarTickets()
    if (usuario?.rol === 'administrador') {
      cargarTecnicos()
    }
  }, [])

   const cargarTecnicos = async () => {
    try {
      const data = await listarTecnicos()
      setTecnicos(data.tecnicos)
    } catch (err) {
      console.error('No se pudieron cargar técnicos')
    }
  }

  const cargarTickets = async () => {
    try {
      const data = await obtenerTickets()
      setTickets(data.tickets)
    } catch (err) {
      console.error('ERROR REAL:', err)
      setError('No se pudieron cargar los tickets')
    } finally {
      setCargando(false)
    }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstado(id, nuevoEstado, `Cambiado a ${nuevoEstado} desde el panel`)
      cargarTickets()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado')
    }
  }

  const handleReasignar = async (id, tecnicoId) => {
    if (!tecnicoId) return
    try {
      await reasignarTecnico(id, tecnicoId, 'Reasignado desde el panel de administración')
      cargarTickets()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo reasignar el ticket')
    }
  }

  const handleCambiarEstadoAdmin = async (id, nuevoEstado) => {
    if (!nuevoEstado) return
    try {
      await actualizarEstado(id, nuevoEstado, `Cambiado a ${nuevoEstado} por administrador`)
      cargarTickets()
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
  const esAdmin = usuario?.rol === 'administrador'
  const nombresRoles = {
    administrador: 'Administrador',
    tecnico_n1: 'Técnico N1',
    tecnico_n2: 'Técnico N2',
    usuario_final: 'Usuario'
  }

  // Filtrar tickets según búsqueda (código, título o categoría)
  const ticketsFiltrados = tickets.filter((t) =>
    t.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const estadosDisponibles = ['abierto', 'en_proceso', 'escalado', 'resuelto', 'cerrado']

  return (
    <div style={estilos.contenedor}>
       <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <div style={estilos.navDerecha}>
          <span style={estilos.usuarioNav}>
            {usuario?.nombre} · <strong>{nombresRoles[usuario?.rol] || usuario?.rol}</strong>
          </span>
          {esAdmin && (
            <button onClick={() => navigate('/dashboard')} style={estilos.botonNav}>
              ← Dashboard
            </button>
          )}
          <button onClick={() => navigate('/tickets/nuevo')} style={estilos.botonNuevo}>
            + Nuevo Ticket
          </button>
          {!esAdmin && (
            <button onClick={() => { cerrarSesion(); navigate('/login') }} style={estilos.botonSalir}>
              Cerrar Sesión
            </button>
          )}
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

        {!cargando && tickets.length > 0 && (
          <input
            type="text"
            placeholder="🔍 Buscar por código, título o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={estilos.buscador}
          />
        )}

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
                  {esAdmin && <th style={estilos.th}>Técnico Asignado</th>}
                  {usuario?.rol === 'usuario_final' && <th style={estilos.th}>Atendido por</th>}
                  <th style={estilos.th}>Prioridad</th>
                  <th style={estilos.th}>Estado</th>
                  <th style={estilos.th}>SLA Límite</th>
                  {puedeCambiarEstado && !esAdmin && <th style={estilos.th}>Acción</th>}
                  {esAdmin && <th style={estilos.th}>Cambiar Estado</th>}
                  {esAdmin && <th style={estilos.th}>Reasignar Técnico</th>}
                </tr>
              </thead>
              <tbody>
                 {ticketsFiltrados.map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={estilos.td}>
                      <strong
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        style={estilos.linkCodigo}
                      >
                        {ticket.codigo}
                      </strong>
                    </td>
                    <td style={estilos.td}>{ticket.titulo}</td>
                    <td style={estilos.td}>
                      {ticket.categoria.charAt(0).toUpperCase() + ticket.categoria.slice(1)}
                    </td>
                    {esAdmin && (
                      <td style={estilos.td}>
                        {tecnicos.find(t => t.id === ticket.tecnico_asignado_id)?.nombre || 'Sin asignar'}
                      </td>
                    )}
                    {usuario?.rol === 'usuario_final' && (
                      <td style={estilos.td}>
                        {ticket.tecnico_nombre || 'Sin asignar'}
                      </td>
                    )}
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
                    {puedeCambiarEstado && !esAdmin && (
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

                    {esAdmin && (
                      <td style={estilos.td}>
                        <select
                          defaultValue=""
                          onChange={(e) => handleCambiarEstadoAdmin(ticket.id, e.target.value)}
                          style={estilos.selectAdmin}
                        >
                          <option value="">Cambiar a...</option>
                          {estadosDisponibles
                            .filter((e) => e !== ticket.estado)
                            .map((e) => (
                              <option key={e} value={e}>
                                {e.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                        </select>
                      </td>
                    )}

                    {esAdmin && (
                      <td style={estilos.td}>
                        <select
                          defaultValue=""
                          onChange={(e) => handleReasignar(ticket.id, e.target.value)}
                          style={estilos.selectAdmin}
                        >
                          <option value="">Reasignar a...</option>
                          {tecnicos.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({t.rol})
                            </option>
                          ))}
                        </select>
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
   usuarioNav: {
    color: '#BDD7EE',
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
  linkCodigo: {
    color: '#2E75B6',
    cursor: 'pointer',
    textDecoration: 'underline'
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
  },
  buscador: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #BDD7EE',
    fontSize: '14px',
    marginBottom: '20px',
    backgroundColor: 'white',
    color: '#333',
    boxSizing: 'border-box'
  },
  selectAdmin: {
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #BDD7EE',
    fontSize: '12px',
    backgroundColor: 'white',
    color: '#333',
    cursor: 'pointer'
  }
}

export default Tickets
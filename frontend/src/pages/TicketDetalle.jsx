import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerTicketPorId, actualizarEstado, reasignarTecnico } from '../services/ticketService'
import { listarComentarios, crearComentario } from '../services/comentarioService'
import { listarTecnicos } from '../services/usuarioService'

const TicketDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, cerrarSesion } = useAuth()

  const [ticket, setTicket] = useState(null)
  const [creador, setCreador] = useState(null)
  const [tecnico, setTecnico] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [esNotaInterna, setEsNotaInterna] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [tecnicos, setTecnicos] = useState([])

  const esStaff = ['administrador', 'tecnico_n1', 'tecnico_n2'].includes(usuario?.rol)
  const esAdmin = usuario?.rol === 'administrador'

  useEffect(() => {
    document.title = 'Detalle Ticket - Sistema UTO'
    cargarDatos()
    if (usuario?.rol === 'administrador') {
      cargarTecnicos()
    }
  }, [id])

  const cargarTecnicos = async () => {
    try {
      const data = await listarTecnicos()
      setTecnicos(data.tecnicos)
    } catch (err) {
      console.error('No se pudieron cargar técnicos')
    }
  }

  const handleReasignar = async (tecnicoId) => {
    if (!tecnicoId) return
    try {
      await reasignarTecnico(id, tecnicoId, 'Reasignado desde el detalle del ticket')
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo reasignar el ticket')
    }
  }

  const cargarDatos = async () => {
    try {
      const dataTicket = await obtenerTicketPorId(id)
      setTicket(dataTicket.ticket)
      setCreador(dataTicket.creador)
      setTecnico(dataTicket.tecnico)

      const dataComentarios = await listarComentarios(id)
      setComentarios(dataComentarios.comentarios)
    } catch (err) {
      setError('No se pudo cargar el ticket')
    } finally {
      setCargando(false)
    }
  }

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    if (!mensaje.trim()) return

    setEnviando(true)
    try {
      await crearComentario(id, mensaje, esNotaInterna)
      setMensaje('')
      setEsNotaInterna(false)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo enviar el comentario')
    } finally {
      setEnviando(false)
    }
  }

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!nuevoEstado) return
    try {
      await actualizarEstado(id, nuevoEstado, `Cambiado a ${nuevoEstado} desde el detalle del ticket`)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado')
    }
  }

  const colorPrioridad = {
    critica: '#C00000', alta: '#ED7D31', media: '#FFC000', baja: '#70AD47'
  }
  const colorEstado = {
    abierto: '#2E75B6', en_proceso: '#FFC000', escalado: '#C00000', resuelto: '#70AD47', cerrado: '#595959'
  }
  const estadosDisponibles = ['abierto', 'en_proceso', 'escalado', 'resuelto', 'cerrado']

  if (cargando) return <p style={{ padding: '30px' }}>Cargando...</p>
  if (error) return <p style={{ padding: '30px', color: '#C00000' }}>{error}</p>
  if (!ticket) return null

  return (
    <div style={estilos.contenedor}>
      <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {esAdmin && (
            <button onClick={() => navigate('/dashboard')} style={estilos.botonNav}>
              Dashboard
            </button>
          )}
          <button onClick={() => navigate('/tickets')} style={estilos.botonNav}>
            ← Volver a Tickets
          </button>
          {!esStaff && (
            <button onClick={() => { cerrarSesion(); navigate('/login') }} style={estilos.botonSalir}>
              Cerrar Sesión
            </button>
          )}
        </div>
      </nav>

      <div style={estilos.contenido}>
        {/* Encabezado del ticket */}
        <div style={estilos.card}>
          <div style={estilos.encabezado}>
            <div>
              <h1 style={estilos.codigo}>{ticket.codigo}</h1>
              <h2 style={estilos.tituloTicket}>{ticket.titulo}</h2>
            </div>
            <div style={estilos.badges}>
              <span style={{ ...estilos.badge, backgroundColor: colorPrioridad[ticket.prioridad] }}>
                {ticket.prioridad.toUpperCase()}
              </span>
              <span style={{ ...estilos.badge, backgroundColor: colorEstado[ticket.estado] }}>
                {ticket.estado.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <p style={estilos.descripcion}>{ticket.descripcion}</p>

          <div style={estilos.infoGrid}>
            <div><strong>Categoría:</strong> {ticket.categoria}</div>
            <div><strong>Tipo:</strong> {ticket.tipo}</div>
            <div><strong>Urgencia:</strong> {ticket.urgencia}</div>
            <div><strong>Impacto:</strong> {ticket.impacto}</div>
            <div><strong>Reportado por:</strong> {creador?.nombre || 'Desconocido'}</div>
            <div><strong>Técnico asignado:</strong> {tecnico?.nombre || 'Sin asignar'}</div>
            <div><strong>SLA límite:</strong> {new Date(ticket.sla_limite).toLocaleString('es-GT')}</div>
            <div><strong>Creado:</strong> {new Date(ticket.created_at).toLocaleString('es-GT')}</div>
          </div>

          {/* Cambiar estado (solo staff) */}
          {esStaff && (
            <div style={estilos.cambiarEstado}>
              <label style={estilos.label}>Cambiar estado:</label>
              <select
                defaultValue=""
                onChange={(e) => handleCambiarEstado(e.target.value)}
                style={estilos.selectEstado}
              >
                <option value="">Seleccionar...</option>
                {estadosDisponibles
                  .filter((e) => e !== ticket.estado)
                  .map((e) => (
                    <option key={e} value={e}>{e.replace('_', ' ').toUpperCase()}</option>
                  ))}
              </select>

              {/* Reasignar técnico (solo admin) */}
              {esAdmin && (
                <>
                  <label style={estilos.label}>Reasignar técnico:</label>
                  <select
                    defaultValue=""
                    onChange={(e) => handleReasignar(e.target.value)}
                    style={estilos.selectEstado}
                  >
                    <option value="">Seleccionar...</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.rol})
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
        </div>

        {/* Hilo de comentarios */}
        <div style={estilos.card}>
          <h2 style={estilos.subtituloHilo}>Hilo del Ticket ({comentarios.length})</h2>

          {comentarios.length === 0 && (
            <p style={estilos.sinComentarios}>Todavía no hay comentarios en este ticket.</p>
          )}

          <div style={estilos.hilo}>
            {comentarios.map((c) => (
              <div
                key={c.id}
                style={{
                  ...estilos.mensaje,
                  ...(c.es_nota_interna ? estilos.mensajeNota : {})
                }}
              >
                <div style={estilos.mensajeHeader}>
                  <strong>{c.usuario?.nombre || 'Usuario'}</strong>
                  {c.es_nota_interna && <span style={estilos.tagNota}>NOTA INTERNA</span>}
                  <span style={estilos.fecha}>
                    {new Date(c.created_at).toLocaleString('es-GT')}
                  </span>
                </div>
                <p style={estilos.mensajeTexto}>{c.mensaje}</p>
              </div>
            ))}
          </div>

          {/* Formulario para responder */}
          <form onSubmit={handleEnviarComentario} style={estilos.formulario}>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe una respuesta..."
              style={estilos.textarea}
              rows={3}
              required
            />
            <div style={estilos.formularioFooter}>
              {esStaff && (
                <label style={estilos.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={esNotaInterna}
                    onChange={(e) => setEsNotaInterna(e.target.checked)}
                  />
                  {' '}Nota interna (no visible para el usuario)
                </label>
              )}
              <button type="submit" style={estilos.botonEnviar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Publicar Respuesta'}
              </button>
            </div>
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
    width: '100%', 
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
  botonNav: { backgroundColor: '#2E75B6', 
    color: 'white', 
    border: 'none', 
    padding: '8px 16px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '14px' 
  },
  contenido: { 
    padding: '30px', 
    maxWidth: '900px', 
    margin: '0 auto' 
  },
  card: { 
    backgroundColor: 'white', 
    padding: '25px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', 
    marginBottom: '20px' 
  },
  encabezado: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '15px', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  codigo: { 
    color: '#1F3864', 
    margin: 0, 
    fontSize: '24px' 
  },
  tituloTicket: { 
    color: '#333', 
    margin: '5px 0 0', 
    fontSize: '18px', 
    fontWeight: 'normal' 
  },
  badges: { 
    display: 'flex', 
    gap: '8px' 
  },
  badge: { 
    color: 'white', 
    padding: '6px 12px', 
    borderRadius: '4px', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    height: 'fit-content' 
  },
  descripcion: { 
    color: '#555', 
    backgroundColor: '#F9F9F9', 
    padding: '15px', 
    borderRadius: '6px', 
    marginBottom: '15px', 
    lineHeight: '1.5' 
  },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: '#444' },
  cambiarEstado: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#444' },
  selectEstado: { padding: '8px', borderRadius: '6px', border: '1px solid #BDD7EE', backgroundColor: 'white', color: '#333', fontSize: '14px' },
  subtituloHilo: { 
    color: '#1F3864', 
    margin: '0 0 15px', 
    fontSize: '18px' 
  },
  sinComentarios: { 
    color: '#999', 
    fontSize: '14px', 
    fontStyle: 'italic' 
  },
  hilo: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    marginBottom: '20px' 
  },
  mensaje: { 
    backgroundColor: '#F2F2F2', 
    borderRadius: '6px', 
    padding: '12px 15px', 
    borderLeft: '4px solid #2E75B6' 
  },
  mensajeNota: { 
    backgroundColor: '#FFF2CC', 
    borderLeft: '4px solid #FFC000' 
  },
  mensajeHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginBottom: '6px', 
    flexWrap: 'wrap' 
  },
  tagNota: { 
    backgroundColor: '#FFC000', 
    color: '#7F6000', 
    fontSize: '10px', 
    fontWeight: 'bold', 
    padding: '2px 8px', 
    borderRadius: '4px' 
  },
  fecha: { 
    color: '#999', 
    fontSize: '12px', 
    marginLeft: 'auto' 
  },
  mensajeTexto: { 
    margin: 0, 
    color: '#333', 
    fontSize: '14px', 
    lineHeight: '1.5', 
    whiteSpace: 'pre-wrap' 
  },
  formulario: { 
    borderTop: '1px solid #eee', 
    paddingTop: '15px' 
  },
  textarea: { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '6px', 
    border: '1px solid #BDD7EE', 
    fontSize: '14px', 
    fontFamily: 'Arial, sans-serif', 
    resize: 'vertical', 
    backgroundColor: '#e7e7e7', 
    color: '#2b2727', 
    boxSizing: 'border-box' 
  },
  formularioFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: '10px', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  checkboxLabel: { 
    fontSize: '13px', 
    color: '#666', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px' 
  },
  botonEnviar: { 
    backgroundColor: '#1F3864', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '6px', 
    cursor: 'pointer', fontSize: '14px', 
    fontWeight: 'bold' 
  },
  botonSalir: {
    backgroundColor: '#C00000',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}

export default TicketDetalle
import api from './api'

// ── CREAR TICKET ───────────────────────────────────────────────────────────────
export const crearTicket = async (datosTicket) => {
  const response = await api.post('/tickets', datosTicket)
  return response.data
}

// ── OBTENER TICKETS ────────────────────────────────────────────────────────────
export const obtenerTickets = async () => {
  const response = await api.get('/tickets')
  return response.data
}

// ── OBTENER TICKET POR ID ──────────────────────────────────────────────────────
export const obtenerTicketPorId = async (id) => {
  const response = await api.get(`/tickets/${id}`)
  return response.data
}

// ── ACTUALIZAR ESTADO ──────────────────────────────────────────────────────────
export const actualizarEstado = async (id, estado, nota) => {
  const response = await api.patch(`/tickets/${id}/estado`, { estado, nota })
  return response.data
}

// ── DASHBOARD MÉTRICAS ─────────────────────────────────────────────────────────
export const obtenerDashboard = async () => {
  const response = await api.get('/tickets/dashboard')
  return response.data
}
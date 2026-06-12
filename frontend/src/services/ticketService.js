import api from './api'

// ── LOGIN ──────────────────────────────────────────────────────────────────────
export const login = async (correo, contrasena) => {
  const response = await api.post('/auth/login', { correo, contrasena })
  return response.data
}

// ── REGISTRO ───────────────────────────────────────────────────────────────────
export const registro = async (nombre, correo, contrasena, rol) => {
  const response = await api.post('/auth/registro', { nombre, correo, contrasena, rol })
  return response.data
}

// ── OBTENER PERFIL ─────────────────────────────────────────────────────────────
export const obtenerPerfil = async () => {
  const response = await api.get('/auth/perfil')
  return response.data
}

// ── DASHBOARD MÉTRICAS ─────────────────────────────────────────────────────────
export const obtenerDashboard = async () => {
  const response = await api.get('/tickets/dashboard')
  return response.data
}

// ── NUEVO TICKET ─────────────────────────────────────────────────────────
export const crearTicket = async (titulo, descripcion) => {
  const response = await api.post('/tickets', { titulo, descripcion })
  return response.data
}
import api from './api'

// ── LISTAR COMENTARIOS DE UN TICKET ────────────────────────────────────────────
export const listarComentarios = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/comentarios`)
  return response.data
}

// ── CREAR COMENTARIO ───────────────────────────────────────────────────────────
export const crearComentario = async (ticketId, mensaje, esNotaInterna) => {
  const response = await api.post(`/tickets/${ticketId}/comentarios`, {
    mensaje,
    es_nota_interna: esNotaInterna
  })
  return response.data
}
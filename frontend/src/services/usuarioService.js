import api from './api'

// ── LISTAR TÉCNICOS ────────────────────────────────────────────────────────────
export const listarTecnicos = async () => {
  const response = await api.get('/usuarios/tecnicos')
  return response.data
}
import { supabase } from '../config/supabase.js'

// ── LISTAR TÉCNICOS (para asignación/reasignación) ────────────────────────────
export const listarTecnicos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol')
      .in('rol', ['tecnico_n1', 'tecnico_n2'])
      .eq('estado', true)
      .order('nombre', { ascending: true })

    if (error) throw error

    res.json({ tecnicos: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── LISTAR TODOS LOS USUARIOS (solo admin) ─────────────────────────────────────
export const listarUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol, estado, created_at')
      .order('nombre', { ascending: true })

    if (error) throw error

    res.json({ usuarios: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
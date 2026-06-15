import { supabase } from '../config/supabase.js'
import { enviarCorreoNuevaRespuesta } from '../services/emailService.js'

// ── CREAR COMENTARIO ───────────────────────────────────────────────────────────
export const crearComentario = async (req, res) => {
  try {
    const { id } = req.params // id del ticket
    const { mensaje, es_nota_interna } = req.body
    const usuario_id = req.usuario.id
    const rol = req.usuario.rol

    // Solo técnicos y admin pueden crear notas internas
    const notaInterna = (rol === 'administrador' || rol === 'tecnico_n1' || rol === 'tecnico_n2')
      ? !!es_nota_interna
      : false

    const { data, error } = await supabase
      .from('comentarios')
      .insert([{
        ticket_id: id,
        usuario_id,
        mensaje,
        es_nota_interna: notaInterna
      }])
      .select()

    if (error) throw error

    // Registrar en bitácora
    await supabase.from('bitacora').insert([{
      ticket_id: id,
      usuario_id,
      accion: notaInterna ? 'NOTA_INTERNA_AGREGADA' : 'COMENTARIO_AGREGADO',
      descripcion: notaInterna ? 'Se agregó una nota interna' : 'Se agregó un comentario'
    }])

    // Enviar correo de notificación (si NO es nota interna)
    if (!notaInterna) {
      // Obtener datos del ticket y del autor del comentario
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

      const { data: autor } = await supabase
        .from('usuarios')
        .select('nombre')
        .eq('id', usuario_id)
        .single()

      // Determinar quién debe recibir el correo
      let destinatarioId = null
      if (rol === 'usuario_final') {
        // El usuario escribió → notificar al técnico asignado
        destinatarioId = ticket.tecnico_asignado_id
      } else {
        // El técnico/admin escribió → notificar al usuario que reportó
        destinatarioId = ticket.usuario_id
      }

      if (destinatarioId && destinatarioId !== usuario_id) {
        const { data: destinatario } = await supabase
          .from('usuarios')
          .select('nombre, correo')
          .eq('id', destinatarioId)
          .single()

        if (destinatario) {
          await enviarCorreoNuevaRespuesta(destinatario, ticket, mensaje, autor)
        }
      }
    }

    res.status(201).json({ comentario: data[0] })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── LISTAR COMENTARIOS DE UN TICKET ────────────────────────────────────────────
export const listarComentarios = async (req, res) => {
  try {
    const { id } = req.params // id del ticket
    const rol = req.usuario.rol

    let query = supabase
      .from('comentarios')
      .select('id, mensaje, es_nota_interna, created_at, usuario_id')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    // El usuario final NO ve notas internas
    if (rol === 'usuario_final') {
      query = query.eq('es_nota_interna', false)
    }

    const { data: comentarios, error } = await query
    if (error) throw error

    // Obtener nombres de los usuarios que comentaron
    const usuarioIds = [...new Set(comentarios.map(c => c.usuario_id))]
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .in('id', usuarioIds)

    // Combinar comentarios con el nombre del usuario
    const comentariosConUsuario = comentarios.map(c => ({
      ...c,
      usuario: usuarios.find(u => u.id === c.usuario_id)
    }))

    res.json({ comentarios: comentariosConUsuario })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
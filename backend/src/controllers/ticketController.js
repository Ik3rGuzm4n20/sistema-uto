import { supabase } from '../config/supabase.js'
import { enviarCorreoTicketAsignado, enviarCorreoCambioEstado } from '../services/emailService.js'

// ── CALCULAR PRIORIDAD ─────────────────────────────────────────────────────────
const calcularPrioridad = (impacto, urgencia) => {
  if (impacto === 'alto' && urgencia === 'critica') return 'critica'
  if (impacto === 'alto' && urgencia === 'alta') return 'critica'
  if (impacto === 'alto' && urgencia === 'media') return 'alta'
  if (impacto === 'medio' && urgencia === 'critica') return 'alta'
  if (impacto === 'medio' && urgencia === 'alta') return 'alta'
  if (impacto === 'medio' && urgencia === 'media') return 'media'
  if (impacto === 'bajo' && urgencia === 'critica') return 'media'
  return 'baja'
}

// ── CALCULAR SLA ───────────────────────────────────────────────────────────────
const calcularSLA = async (prioridad) => {
  const { data } = await supabase
    .from('sla_config')
    .select('tiempo_resolucion_horas')
    .eq('prioridad', prioridad)
    .single()

  const horas = data?.tiempo_resolucion_horas || 24
  const slaLimite = new Date()
  slaLimite.setHours(slaLimite.getHours() + horas)
  return slaLimite
}

// ── GENERAR CÓDIGO DE TICKET ───────────────────────────────────────────────────
const generarCodigo = (categoria) => {
  const prefijos = {
    red: 'RED', hardware: 'HW', software: 'SW',
    acceso: 'ACC', correo: 'COR', plataforma: 'PLT', otros: 'OTR'
  }
  const prefijo = prefijos[categoria] || 'TKT'
  const numero = Date.now().toString().slice(-4)
  return `${prefijo}-${numero}`
}

// ── CREAR TICKET ───────────────────────────────────────────────────────────────
export const crearTicket = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, tipo, urgencia, impacto } = req.body
    const usuario_id = req.usuario.id

    // Calcular prioridad automáticamente
    const prioridad = calcularPrioridad(impacto, urgencia)

    // Calcular SLA
    const sla_limite = await calcularSLA(prioridad)

    // Generar código único
    const codigo = generarCodigo(categoria)

    // Buscar técnico N1 disponible con menor carga
    const { data: tecnicos } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'tecnico_n1')
      .eq('estado', true)

    let tecnico_asignado_id = null
    if (tecnicos && tecnicos.length > 0) {
      tecnico_asignado_id = tecnicos[0].id
    }

    // Crear ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        codigo, titulo, descripcion, categoria,
        tipo, urgencia, impacto, prioridad,
        usuario_id, tecnico_asignado_id, sla_limite
      }])
      .select()

    if (error) throw error

    // Registrar en bitácora
    await supabase.from('bitacora').insert([{
      ticket_id: data[0].id,
      usuario_id,
      accion: 'TICKET_CREADO',
      descripcion: `Ticket ${codigo} creado con prioridad ${prioridad}`
    }])

    // Enviar correo al técnico si fue asignado
    if (tecnico_asignado_id && tecnicos.length > 0) {
      const { data: tecnico } = await supabase
        .from('usuarios')
        .select('nombre, correo')
        .eq('id', tecnico_asignado_id)
        .single()

      if (tecnico) {
        await enviarCorreoTicketAsignado(tecnico, data[0])
      }
    }

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: data[0]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── OBTENER TICKETS ────────────────────────────────────────────────────────────
export const obtenerTickets = async (req, res) => {
  try {
    const { rol, id } = req.usuario

    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    // Usuario final solo ve sus tickets
    if (rol === 'usuario_final') {
      query = query.eq('usuario_id', id)
    }

    // Técnico N1 ve los tickets asignados a él
    if (rol === 'tecnico_n1') {
      query = query.eq('tecnico_asignado_id', id)
    }

    const { data, error } = await query
    if (error) throw error

    res.json({ tickets: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── OBTENER TICKET POR ID ──────────────────────────────────────────────────────
export const obtenerTicketPorId = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json({ ticket: data })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── ACTUALIZAR ESTADO ──────────────────────────────────────────────────────────
export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { estado, nota } = req.body
    const usuario_id = req.usuario.id
    const rol = req.usuario.rol

    // Flujo permitido de estados (aplica solo a técnicos)
    const flujo = {
      abierto: ['en_proceso'],
      en_proceso: ['escalado', 'resuelto'],
      escalado: ['resuelto'],
      resuelto: ['cerrado']
    }

    // Obtener estado actual
    const { data: ticketActual } = await supabase
      .from('tickets')
      .select('estado, codigo')
      .eq('id', id)
      .single()

    // El administrador puede cambiar a cualquier estado
    // Los técnicos deben seguir el flujo definido
    if (rol !== 'administrador') {
      const estadosPermitidos = flujo[ticketActual.estado] || []
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          error: `No puedes cambiar de ${ticketActual.estado} a ${estado}`
        })
      }
    }

    // Actualizar estado
    const { data, error } = await supabase
      .from('tickets')
      .update({ estado, updated_at: new Date() })
      .eq('id', id)
      .select()

    if (error) throw error

    // Registrar en bitácora
    await supabase.from('bitacora').insert([{
      ticket_id: id,
      usuario_id,
      accion: `ESTADO_CAMBIADO_A_${estado.toUpperCase()}`,
      descripcion: nota || `Estado cambiado a ${estado}`
    }])

    // Enviar correo al usuario que reportó el ticket
    const { data: usuarioReporte } = await supabase
      .from('usuarios')
      .select('nombre, correo')
      .eq('id', data[0].usuario_id)
      .single()

    if (usuarioReporte) {
      await enviarCorreoCambioEstado(usuarioReporte, data[0])
    }

    res.json({
      message: `Ticket actualizado a ${estado}`,
      ticket: data[0]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── DASHBOARD MÉTRICAS ─────────────────────────────────────────────────────────
export const dashboard = async (req, res) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('estado, prioridad, created_at')

    if (error) throw error

    const hoy = new Date().toDateString()

    const metricas = {
      total: tickets.length,
      abiertos: tickets.filter(t => t.estado === 'abierto').length,
      en_proceso: tickets.filter(t => t.estado === 'en_proceso').length,
      resueltos_hoy: tickets.filter(t =>
        t.estado === 'resuelto' &&
        new Date(t.created_at).toDateString() === hoy
      ).length,
      criticos: tickets.filter(t => t.prioridad === 'critica').length,
      cerrados: tickets.filter(t => t.estado === 'cerrado').length,
    }

    res.json({ metricas })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── REASIGNAR TÉCNICO ──────────────────────────────────────────────────────────
export const reasignarTecnico = async (req, res) => {
  try {
    const { id } = req.params
    const { tecnico_asignado_id, justificacion } = req.body
    const usuario_id = req.usuario.id

    // Verificar que el técnico exista y tenga el rol correcto
    const { data: tecnico, error: errorTecnico } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol')
      .eq('id', tecnico_asignado_id)
      .in('rol', ['tecnico_n1', 'tecnico_n2'])
      .single()

    if (errorTecnico || !tecnico) {
      return res.status(400).json({ error: 'Técnico no válido' })
    }

    // Actualizar el ticket
    const { data, error } = await supabase
      .from('tickets')
      .update({ tecnico_asignado_id, updated_at: new Date() })
      .eq('id', id)
      .select()

    if (error) throw error

    // Registrar en bitácora
    await supabase.from('bitacora').insert([{
      ticket_id: id,
      usuario_id,
      accion: 'TICKET_REASIGNADO',
      descripcion: justificacion
        ? `Reasignado a ${tecnico.nombre}. Motivo: ${justificacion}`
        : `Reasignado a ${tecnico.nombre}`
    }])

    // Notificar al nuevo técnico por correo
    await enviarCorreoTicketAsignado(tecnico, data[0])

    res.json({
      message: `Ticket reasignado a ${tecnico.nombre}`,
      ticket: data[0]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
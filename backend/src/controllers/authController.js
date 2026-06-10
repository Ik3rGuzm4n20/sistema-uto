import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

// ── REGISTRO DE USUARIO ────────────────────────────────────────────────────────
export const registro = async (req, res) => {
  try {
    console.log('Body recibido:', req.body)
    const { nombre, correo, contrasena, rol } = req.body

    // Verificar si el correo ya existe
    const { data: usuarioExiste } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo', correo)
      .single()

    if (usuarioExiste) {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    const contrasenaHash = await bcrypt.hash(contrasena, salt)

    // Guardar usuario en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contrasena: contrasenaHash, rol }])
      .select()

    if (error) throw error

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: { id: data[0].id, nombre, correo, rol }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body

    // Buscar usuario por correo
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single()

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Verificar si la cuenta está bloqueada
    if (usuario.intentos_fallidos >= 5) {
      return res.status(403).json({ error: 'Cuenta bloqueada. Contacta al administrador' })
    }

    // Verificar si la cuenta está activa
    if (!usuario.estado) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador' })
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena)

    if (!contrasenaValida) {
      // Incrementar intentos fallidos
      await supabase
        .from('usuarios')
        .update({ intentos_fallidos: usuario.intentos_fallidos + 1 })
        .eq('id', usuario.id)

      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Resetear intentos fallidos al login exitoso
    await supabase
      .from('usuarios')
      .update({ intentos_fallidos: 0 })
      .eq('id', usuario.id)

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── OBTENER PERFIL ─────────────────────────────────────────────────────────────
export const perfil = async (req, res) => {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol, estado, created_at')
      .eq('id', req.usuario.id)
      .single()

    if (error) throw error

    res.json({ usuario })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
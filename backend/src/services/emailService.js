import { resend, EMAIL_FROM } from '../config/resend.js'

// ── CORREO: TICKET ASIGNADO AL TÉCNICO ────────────────────────────────────────
export const enviarCorreoTicketAsignado = async (tecnico, ticket) => {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: tecnico.correo,
      subject: `🎫 Nuevo ticket asignado: ${ticket.codigo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1F3864; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sistema UTO</h1>
            <p style="color: #BDD7EE; margin: 5px 0;">Gestión de Incidentes Tecnológicos</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1F3864;">Hola ${tecnico.nombre},</h2>
            <p>Se te ha asignado un nuevo ticket de soporte técnico.</p>
            
            <div style="background-color: white; border-left: 4px solid #2E75B6; padding: 15px; margin: 20px 0;">
              <p><strong>Código:</strong> ${ticket.codigo}</p>
              <p><strong>Título:</strong> ${ticket.titulo}</p>
              <p><strong>Categoría:</strong> ${ticket.categoria}</p>
              <p><strong>Prioridad:</strong> 
                <span style="color: ${ticket.prioridad === 'critica' ? '#C00000' : ticket.prioridad === 'alta' ? '#ED7D31' : '#70AD47'};">
                  ${ticket.prioridad.toUpperCase()}
                </span>
              </p>
              <p><strong>Descripción:</strong> ${ticket.descripcion}</p>
              <p><strong>SLA límite:</strong> ${new Date(ticket.sla_limite).toLocaleString('es-GT')}</p>
            </div>
            
            <p style="color: #666;">Por favor atiende este ticket a la brevedad posible.</p>
          </div>
          
          <div style="background-color: #1F3864; padding: 15px; text-align: center;">
            <p style="color: #BDD7EE; margin: 0; font-size: 12px;">
              Universidad Tecnológica del Occidente — DTI 2026
            </p>
          </div>
        </div>
      `
    })
    console.log(`✅ Correo enviado a ${tecnico.correo}`)
  } catch (error) {
    console.error('❌ Error enviando correo:', error)
  }
}

// ── CORREO: NOTIFICACIÓN AL USUARIO DE CAMBIO DE ESTADO ───────────────────────
export const enviarCorreoCambioEstado = async (usuario, ticket) => {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: usuario.correo,
      subject: `📋 Tu ticket ${ticket.codigo} fue actualizado`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1F3864; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sistema UTO</h1>
            <p style="color: #BDD7EE; margin: 5px 0;">Gestión de Incidentes Tecnológicos</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1F3864;">Hola ${usuario.nombre},</h2>
            <p>El estado de tu ticket ha sido actualizado.</p>
            
            <div style="background-color: white; border-left: 4px solid #70AD47; padding: 15px; margin: 20px 0;">
              <p><strong>Código:</strong> ${ticket.codigo}</p>
              <p><strong>Título:</strong> ${ticket.titulo}</p>
              <p><strong>Nuevo estado:</strong> 
                <span style="color: #2E75B6; font-weight: bold;">
                  ${ticket.estado.toUpperCase()}
                </span>
              </p>
            </div>            
            <p style="color: #666;">Puedes consultar el detalle de tu ticket en el sistema.</p>
          </div>
          
          <div style="background-color: #1F3864; padding: 15px; text-align: center;">
            <p style="color: #BDD7EE; margin: 0; font-size: 12px;">
              Universidad Tecnológica del Occidente — DTI 2026
            </p>
          </div>
        </div>
      `
    })
    console.log(`✅ Correo enviado a ${usuario.correo}`)
  } catch (error) {
    console.error('❌ Error enviando correo:', error)
  }
}

// ── CORREO: NUEVA RESPUESTA EN EL HILO ────────────────────────────────────────
export const enviarCorreoNuevaRespuesta = async (destinatario, ticket, mensaje, autor) => {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: destinatario.correo,
      subject: `💬 Nueva respuesta en tu ticket ${ticket.codigo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1F3864; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sistema UTO</h1>
            <p style="color: #BDD7EE; margin: 5px 0;">Gestión de Incidentes Tecnológicos</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #1F3864;">Hola ${destinatario.nombre},</h2>
            <p><strong>${autor.nombre}</strong> respondió en el ticket <strong>${ticket.codigo}</strong>:</p>
            
            <div style="background-color: white; border-left: 4px solid #2E75B6; padding: 15px; margin: 20px 0;">
              <p><strong>Ticket:</strong> ${ticket.titulo}</p>
              <p><strong>Estado actual:</strong> 
                <span style="color: #2E75B6; font-weight: bold;">
                  ${ticket.estado.replace('_', ' ').toUpperCase()}
                </span>
              </p>
              <p><strong>Mensaje:</strong></p>
              <p style="background-color: #F2F2F2; padding: 10px; border-radius: 4px;">${mensaje}</p>
            </div>
            
            <p style="color: #666;">Ingresa al sistema para responder.</p>
          </div>
          
          <div style="background-color: #1F3864; padding: 15px; text-align: center;">
            <p style="color: #BDD7EE; margin: 0; font-size: 12px;">
              Universidad Tecnológica del Occidente — DTI 2026
            </p>
          </div>
        </div>
      `
    })
    console.log(`✅ Correo de respuesta enviado a ${destinatario.correo}`)
  } catch (error) {
    console.error('❌ Error enviando correo de respuesta:', error)
  }
}
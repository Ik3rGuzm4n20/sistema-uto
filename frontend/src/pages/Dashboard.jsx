import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerDashboard } from '../services/ticketService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { obtenerTickets } from '../services/ticketService'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarMetricas()
  }, [])

  useEffect(() => {
    document.title = 'Dashboard - Sistema UTO'
  }, [])

  const cargarMetricas = async () => {
    try {
      const data = await obtenerDashboard()
      setMetricas(data.metricas)
    } catch (err) {
      setError('No se pudieron cargar las métricas')
    }
  }

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login')
  }
  const generarPDF = async () => {
    try {
      const doc = new jsPDF()
      const fecha = new Date().toLocaleString('es-GT')

      // Encabezado
      doc.setFillColor(31, 56, 100)
      doc.rect(0, 0, 210, 28, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Sistema UTO', 14, 12)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Gestión de Incidentes Tecnológicos', 14, 20)
      doc.text(`Generado: ${fecha}`, 210 - 14, 20, { align: 'right' })

      // Título del reporte
      doc.setTextColor(31, 56, 100)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte de Dashboard', 14, 40)

      // Métricas
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Métricas Generales del Sistema', 14, 50)

      const metricasData = [
        ['Total de Tickets', metricas?.total || 0],
        ['Tickets Abiertos', metricas?.abiertos || 0],
        ['En Proceso', metricas?.en_proceso || 0],
        ['Críticos', metricas?.criticos || 0],
        ['Resueltos Hoy', metricas?.resueltos_hoy || 0],
        ['Cerrados', metricas?.cerrados || 0],
      ]

      autoTable(doc, {
        startY: 55,
        head: [['Métrica', 'Cantidad']],
        body: metricasData,
        headStyles: { fillColor: [31, 56, 100], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        styles: { fontSize: 10 },
        columnStyles: { 1: { halign: 'center' } }
      })

      // Tabla de tickets
      const ticketsY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 56, 100)
      doc.text('Detalle de Tickets', 14, ticketsY)

      const { tickets } = await obtenerTickets()

      const ticketsData = tickets.map(t => [
        t.codigo,
        t.titulo.length > 30 ? t.titulo.substring(0, 30) + '...' : t.titulo,
        t.categoria,
        t.prioridad.toUpperCase(),
        t.estado.replace('_', ' ').toUpperCase(),
        new Date(t.sla_limite).toLocaleDateString('es-GT')
      ])

      const colorPrioridad = {
        'CRITICA': [192, 0, 0],
        'ALTA': [237, 125, 49],
        'MEDIA': [255, 192, 0],
        'BAJA': [112, 173, 71]
      }

      autoTable(doc, {
        startY: ticketsY + 5,
        head: [['Código', 'Título', 'Categoría', 'Prioridad', 'Estado', 'SLA Límite']],
        body: ticketsData,
        headStyles: { fillColor: [31, 56, 100], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const color = colorPrioridad[data.cell.text[0]] || [100, 100, 100]
            data.cell.styles.textColor = color
            data.cell.styles.fontStyle = 'bold'
          }
        }
      })

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Universidad Tecnológica del Occidente — DTI 2026 | Página ${i} de ${pageCount}`,
          105, 290, { align: 'center' }
        )
      }

      doc.save(`Reporte_UTO_${new Date().toISOString().slice(0, 10)}.pdf`)

    } catch (err) {
      console.error('Error generando PDF:', err)
      alert('No se pudo generar el reporte')
    }
  }

  const esAdmin = usuario?.rol === 'Administrador'
  const nombresRoles = {
    administrador: 'Administrador',
    tecnico_n1: 'Técnico N1',
    tecnico_n2: 'Técnico N2',
    usuario_final: 'Usuario'
  }

  return (
    <div style={estilos.contenedor}>
      {/* Navbar */}
      <nav style={estilos.navbar}>
        <h2 style={estilos.logoNav}>Sistema UTO</h2>
        <div style={estilos.navDerecha}>
          <span style={estilos.usuarioNav}>
            {usuario?.nombre} · <strong>{nombresRoles[usuario?.rol] || usuario?.rol}</strong>
          </span>
          <button onClick={() => navigate('/tickets')} style={estilos.botonNav}>
            Tickets
          </button>
          <button onClick={handleLogout} style={estilos.botonSalir}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={estilos.contenido}>
        <h1 style={estilos.titulo}>Dashboard</h1>
        <p style={estilos.subtitulo}>Métricas en tiempo real del sistema</p>

        {error && <p style={estilos.error}>{error}</p>}
        
        {metricas && (
          <div style={estilos.graficasGrid}>
            <div style={estilos.graficaCard}>
              <h3 style={estilos.tituloGrafica}>Tickets por Estado</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Abiertos', value: metricas.abiertos },
                      { name: 'En Proceso', value: metricas.en_proceso },
                      { name: 'Resueltos Hoy', value: metricas.resueltos_hoy },
                      { name: 'Cerrados', value: metricas.cerrados }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#2E75B6" />
                    <Cell fill="#FFC000" />
                    <Cell fill="#70AD47" />
                    <Cell fill="#595959" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={estilos.graficaCard}>
              <h3 style={estilos.tituloGrafica}>Tickets Críticos vs Total</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { nombre: 'Total', cantidad: metricas.total },
                    { nombre: 'Críticos', cantidad: metricas.criticos },
                    { nombre: 'Abiertos', cantidad: metricas.abiertos },
                    { nombre: 'Cerrados', cantidad: metricas.cerrados }
                  ]}
                >
                  <XAxis dataKey="nombre" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#1F3864" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {metricas && (
          <div style={estilos.grid}>
            <div style={{ ...estilos.card, borderLeft: '5px solid #2E75B6' }}>
              <p style={estilos.numero}>{metricas.total}</p>
              <p style={estilos.label}>Total Tickets</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #ED7D31' }}>
              <p style={estilos.numero}>{metricas.abiertos}</p>
              <p style={estilos.label}>Abiertos</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #FFC000' }}>
              <p style={estilos.numero}>{metricas.en_proceso}</p>
              <p style={estilos.label}>En Proceso</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #C00000' }}>
              <p style={estilos.numero}>{metricas.criticos}</p>
              <p style={estilos.label}>Críticos</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #C00000' }}>
              <p style={estilos.numero}>{metricas.escalados}</p>
              <p style={estilos.label}>Escalados</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #70AD47' }}>
              <p style={estilos.numero}>{metricas.resueltos_hoy}</p>
              <p style={estilos.label}>Resueltos Hoy</p>
            </div>

            <div style={{ ...estilos.card, borderLeft: '5px solid #595959' }}>
              <p style={estilos.numero}>{metricas.cerrados}</p>
              <p style={estilos.label}>Cerrados</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/tickets/nuevo')} style={estilos.botonCrear}>
            + Crear Nuevo Ticket
          </button>
          <button onClick={generarPDF} style={estilos.botonPDF}>
            📄 Descargar Reporte PDF
          </button>
        </div>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
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
  navDerecha: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  usuarioNav: {
    color: '#BDD7EE',
    fontSize: '14px'
  },
  botonNav: {
    backgroundColor: '#2E75B6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  botonSalir: {
    backgroundColor: '#C00000',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  contenido: {
    padding: '30px'
  },
  titulo: {
    color: '#1F3864',
    margin: 0,
    marginBottom: '15px'
  },
  subtitulo: {
    color: '#666',
    marginTop: '0px',
    marginBottom: '40px',
    fontSize: '16px'
  },
  graficasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  graficaCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  tituloGrafica: {
    color: '#1F3864',
    margin: 0,
    marginBottom: '15px',
    fontSize: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  numero: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1F3864',
    margin: 0
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px'
  },
  botonCrear: {
    backgroundColor: '#1F3864',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  botonPDF: {
    backgroundColor: '#C00000',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  error: {
    color: '#C00000',
    marginBottom: '20px'
  }
}

export default Dashboard
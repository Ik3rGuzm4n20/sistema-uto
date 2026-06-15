import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Bienvenida = () => {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Bienvenido - Sistema UTO'
  }, [])

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.card}>
        <h1 style={estilos.titulo}>Sistema UTO</h1>
        <p style={estilos.subtitulo}>Gestión de Incidentes Tecnológicos</p>

        <p style={estilos.pregunta}>¿Cómo deseas ingresar?</p>

        <div style={estilos.opciones}>
          <div style={estilos.opcionCard} onClick={() => navigate('/registro')}>
            <div style={estilos.icono}>👤</div>
            <h2 style={estilos.opcionTitulo}>Usuario / Personal UTO </h2>
            <p style={estilos.opcionDesc}>
              Reporta una falla técnica o solicitud de soporte y da seguimiento a tus tickets.
            </p>
          </div>

          <div style={estilos.divisor}></div>

          <div style={estilos.opcionCard} onClick={() => navigate('/login')}>
            <div style={estilos.icono}>🛠️</div>
            <h2 style={estilos.opcionTitulo}>Personal de TI</h2>
            <p style={estilos.opcionDesc}>
              Acceso para administradores y técnicos del Departamento de Sistemas.
            </p>
          </div>
        </div>

        <p style={estilos.footer}>© 2026 Universidad Tecnológica del Occidente</p>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: '#DEEAF1',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '700px',
    textAlign: 'center'
  },
  titulo: {
    color: '#1F3864',
    margin: 0,
    fontSize: '32px'
  },
  subtitulo: {
    color: '#2E75B6',
    fontSize: '14px',
    marginTop: '5px',
    marginBottom: '30px'
  },
  pregunta: {
    color: '#444',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '25px'
  },
  opciones: {
    display: 'flex',
    gap: '20px',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  opcionCard: {
    flex: '1',
    minWidth: '220px',
    border: '1px solid #BDD7EE',
    borderRadius: '8px',
    padding: '25px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    backgroundColor: '#F9FBFD'
  },
  divisor: {
    width: '1px',
    backgroundColor: '#eee',
    display: 'none'
  },
  icono: {
    fontSize: '36px',
    marginBottom: '10px'
  },
  opcionTitulo: {
    color: '#1F3864',
    fontSize: '17px',
    margin: '0 0 8px'
  },
  opcionDesc: {
    color: '#666',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.4'
  },
  footer: {
    color: '#999',
    fontSize: '12px',
    marginTop: '35px'
  }
}

export default Bienvenida
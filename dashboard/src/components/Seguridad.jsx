import React from 'react';
import { FaShieldAlt, FaLock, FaUserShield, FaExclamationTriangle, FaCheckCircle, FaServer } from 'react-icons/fa';

const Seguridad = () => {
  const securityStatus = [
    { 
      label: 'Estado General', 
      status: 'Protegido', 
      icon: <FaShieldAlt />, 
      color: 'success',
      details: 'Todos los sistemas funcionando correctamente'
    },
    { 
      label: 'Amenazas Activas', 
      status: '2 Amenazas', 
      icon: <FaExclamationTriangle />, 
      color: 'warning',
      details: 'Se requiere atención'
    },
    { 
      label: 'Último Escaneo', 
      status: 'Hace 2h', 
      icon: <FaCheckCircle />, 
      color: 'success',
      details: 'Completado sin incidencias'
    }
  ];

  const securityMetrics = [
    {
      title: 'Protección de Acceso',
      items: [
        { label: 'IAM Users', value: '45', status: 'OK', icon: <FaUserShield /> },
        { label: 'MFA Enabled', value: '98%', status: 'Warning', icon: <FaLock /> },
        { label: 'Security Groups', value: '12', status: 'OK', icon: <FaServer /> }
      ]
    }
  ];

  const recentIncidents = [
    {
      timestamp: '2024-01-20 14:30',
      type: 'Intento de acceso no autorizado',
      severity: 'high',
      status: 'Bloqueado',
      details: 'IP: 192.168.1.100'
    },
    {
      timestamp: '2024-01-20 13:15',
      type: 'Actualización de seguridad',
      severity: 'low',
      status: 'Completado',
      details: 'Security patches applied'
    },
    {
      timestamp: '2024-01-20 12:00',
      type: 'Cambio en Security Group',
      severity: 'medium',
      status: 'Revisión requerida',
      details: 'sg-12345: New inbound rule'
    }
  ];

  return (
    <div className="seguridad-container">
      {/* Status Cards */}
      <div className="security-status-grid">
        {securityStatus.map((item, index) => (
          <div key={index} className={`status-card ${item.color}`}>
            <div className="status-icon">{item.icon}</div>
            <div className="status-info">
              <h3>{item.label}</h3>
              <span className="status-value">{item.status}</span>
              <p className="status-details">{item.details}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security Metrics */}
      {securityMetrics.map((section, idx) => (
        <section key={idx} className="security-metrics-section">
          <h2>{section.title}</h2>
          <div className="security-metrics-grid">
            {section.items.map((item, index) => (
              <div key={index} className="security-metric-card">
                <div className="metric-icon">{item.icon}</div>
                <div className="metric-info">
                  <h3>{item.label}</h3>
                  <span className="metric-value">{item.value}</span>
                  <span className={`metric-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Recent Incidents */}
      <section className="recent-incidents">
        <h2>Incidentes Recientes</h2>
        <div className="incidents-list">
          {recentIncidents.map((incident, index) => (
            <div key={index} className={`incident-card severity-${incident.severity}`}>
              <div className="incident-header">
                <span className="incident-time">{incident.timestamp}</span>
                <span className={`incident-severity ${incident.severity}`}>
                  {incident.severity.toUpperCase()}
                </span>
              </div>
              <h3>{incident.type}</h3>
              <p className="incident-details">{incident.details}</p>
              <span className="incident-status">{incident.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Seguridad; 
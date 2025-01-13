import React, { useState, useRef } from 'react';
import { FaChartLine, FaTimes, FaBell, FaList, FaTachometerAlt } from 'react-icons/fa';
import '../styles/components/cloudwatch-manager.css';

const CloudWatchManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('metrics');
  const modalRef = useRef(null);

  const handleOverlayClick = (e) => {
    // Si el click fue en el overlay (fuera del modal) cerramos
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const availableMetrics = [
    {
      id: 'cpu',
      name: 'CPU Utilization',
      description: 'Uso de CPU de la instancia',
      unit: '%'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      description: 'Uso de memoria RAM',
      unit: 'GB'
    },
    {
      id: 'network',
      name: 'Network I/O',
      description: 'Tráfico de red entrante/saliente',
      unit: 'MB/s'
    },
    {
      id: 'disk',
      name: 'Disk I/O',
      description: 'Operaciones de lectura/escritura en disco',
      unit: 'IOPS'
    },
    {
      id: 'status',
      name: 'Status Check',
      description: 'Estado de la instancia',
      unit: 'Status'
    }
  ];

  // Datos de ejemplo para las alarmas
  const alarms = [
    {
      id: 'alarm1',
      name: 'CPU High Usage',
      description: 'Alerta cuando el CPU supera el 80%',
      metric: 'CPUUtilization',
      threshold: '80%',
      status: 'OK',
      lastUpdated: '2 min ago'
    },
    {
      id: 'alarm2',
      name: 'Memory Critical',
      description: 'Alerta cuando la memoria supera el 90%',
      metric: 'MemoryUtilization',
      threshold: '90%',
      status: 'ALARM',
      lastUpdated: '5 min ago'
    },
    {
      id: 'alarm3',
      name: 'Disk Space Low',
      description: 'Alerta cuando el espacio en disco es menor al 20%',
      metric: 'DiskSpaceAvailable',
      threshold: '20%',
      status: 'WARNING',
      lastUpdated: '15 min ago'
    }
  ];

  // Datos de ejemplo para los logs
  const logs = [
    {
      id: 'log1',
      timestamp: '2024-02-20 15:30:45',
      level: 'ERROR',
      service: 'EC2',
      message: 'Failed to start instance i-1234567890abcdef0'
    },
    {
      id: 'log2',
      timestamp: '2024-02-20 15:29:30',
      level: 'INFO',
      service: 'RDS',
      message: 'Database backup completed successfully'
    },
    {
      id: 'log3',
      timestamp: '2024-02-20 15:28:15',
      level: 'WARNING',
      service: 'S3',
      message: 'High latency detected in bucket operations'
    },
    {
      id: 'log4',
      timestamp: '2024-02-20 15:27:00',
      level: 'INFO',
      service: 'Lambda',
      message: 'Function executed successfully'
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div className="modal-content cloudwatch-manager">
        <div className="modal-header">
          <div className="header-title">
            <FaChartLine className="aws-icon" />
            <h2>CloudWatch Manager</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <FaChartLine /> Métricas
          </button>
          <button 
            className={`tab ${activeTab === 'alarms' ? 'active' : ''}`}
            onClick={() => setActiveTab('alarms')}
          >
            <FaBell /> Alarmas
          </button>
          <button 
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <FaList /> Logs
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'metrics' && (
            <div className="metrics-section">
              <h3>Métricas Disponibles</h3>
              <div className="metrics-grid">
                {availableMetrics.map(metric => (
                  <div key={metric.id} className="metric-card">
                    <h4>{metric.name}</h4>
                    <p className="metric-description">{metric.description}</p>
                    <span className="metric-unit">{metric.unit}</span>
                    <button className="add-metric-btn">
                      Añadir a Métricas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alarms' && (
            <div className="alarms-section">
              <div className="section-header">
                <h3>Alarmas Configuradas</h3>
                <button className="create-alarm-btn">
                  <FaBell /> Nueva Alarma
                </button>
              </div>
              <div className="alarms-grid">
                {alarms.map(alarm => (
                  <div key={alarm.id} className="alarm-card">
                    <div className={`alarm-status ${alarm.status.toLowerCase()}`}>
                      <FaBell />
                      <span>{alarm.status}</span>
                    </div>
                    <div className="alarm-content">
                      <h4>{alarm.name}</h4>
                      <p className="alarm-description">{alarm.description}</p>
                      <div className="alarm-details">
                        <span>Métrica: {alarm.metric}</span>
                        <span>Umbral: {alarm.threshold}</span>
                      </div>
                      <div className="alarm-footer">
                        <span className="last-updated">Actualizado: {alarm.lastUpdated}</span>
                        <div className="alarm-actions">
                          <button className="edit-btn">Editar</button>
                          <button className="delete-btn">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-section">
              <div className="section-header">
                <h3>CloudWatch Logs</h3>
                <div className="logs-filters">
                  <select className="log-level-filter">
                    <option value="all">Todos los niveles</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                  <select className="time-filter">
                    <option value="1h">Última hora</option>
                    <option value="24h">Últimas 24 horas</option>
                    <option value="7d">Últimos 7 días</option>
                  </select>
                </div>
              </div>

              <div className="logs-container">
                {logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <div className="log-timestamp">{log.timestamp}</div>
                    <div className={`log-level ${log.level.toLowerCase()}`}>
                      {log.level}
                    </div>
                    <div className="log-service">{log.service}</div>
                    <div className="log-message">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudWatchManager; 
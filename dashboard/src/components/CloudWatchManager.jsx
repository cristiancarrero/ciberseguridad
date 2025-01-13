import React, { useState } from 'react';
import { FaChartLine, FaBell, FaList, FaMicrochip, FaMemory, FaNetworkWired, FaHdd, FaCheckCircle } from 'react-icons/fa';
import InstanceSelectorModal from './cloudwatch/InstanceSelectorModal';
import '../styles/components/cloudwatch.css';

const CloudWatchManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('métricas');
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState(null);

  if (!isOpen) return null;

  const metrics = [
    {
      id: 'cpu',
      title: 'CPU Utilization',
      description: 'Uso de CPU de la instancia',
      unit: '%',
      icon: <FaMicrochip />,
      color: 'var(--accent-color)'
    },
    {
      id: 'memory',
      title: 'Memory Usage',
      description: 'Uso de memoria RAM',
      unit: 'GB',
      icon: <FaMemory />,
      color: 'var(--accent-color)'
    },
    {
      id: 'network',
      title: 'Network I/O',
      description: 'Tráfico de red entrante/saliente',
      unit: 'MB/s',
      icon: <FaNetworkWired />,
      color: 'var(--accent-color)'
    },
    {
      id: 'disk',
      title: 'Disk I/O',
      description: 'Operaciones de lectura/escritura en disco',
      unit: 'IOPS',
      icon: <FaHdd />,
      color: 'var(--accent-color)'
    },
    {
      id: 'status',
      title: 'Status Check',
      description: 'Estado de la instancia',
      unit: 'Status',
      icon: <FaCheckCircle />,
      color: 'var(--accent-color)'
    }
  ];

  const renderMetricsTab = () => (
    <div className="tab-content">
      <h2 className="content-title">Métricas Disponibles</h2>
      <div className="metrics-grid">
        {metrics.map(metric => (
          <div key={metric.id} className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: `${metric.color}20`, color: metric.color }}>
              {metric.icon}
            </div>
            <div className="metric-info">
              <div className="metric-header">
                <h3>{metric.title}</h3>
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <p className="metric-description">{metric.description}</p>
              <button 
                className="add-metric-btn"
                onClick={() => handleAddMetric(metric)}
                style={{ backgroundColor: metric.color }}
              >
                Añadir a Métricas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlarmsTab = () => (
    <div className="tab-content">
      <h2 className="content-title">Alarmas</h2>
      <div className="alarms-container">
        <div className="no-alarms">
          <FaBell className="no-data-icon" />
          <h3>No hay alarmas configuradas</h3>
          <p>Añade una alarma para monitorear tus recursos</p>
          <button className="add-alarm-btn">
            Crear Nueva Alarma
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="tab-content">
      <h2 className="content-title">Logs</h2>
      <div className="logs-container">
        <div className="logs-header">
          <select className="log-group-select">
            <option value="">Seleccionar grupo de logs</option>
            <option value="ec2">EC2 Logs</option>
            <option value="lambda">Lambda Logs</option>
          </select>
          <button className="refresh-logs-btn">
            Actualizar Logs
          </button>
        </div>
        <div className="logs-viewer">
          <div className="no-logs">
            <FaList className="no-data-icon" />
            <h3>No hay logs disponibles</h3>
            <p>Selecciona un grupo de logs para ver sus registros</p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleAddMetric = (metric) => {
    setSelectedMetricType(metric);
    setShowInstanceSelector(true);
  };

  const handleInstanceSelect = (instance) => {
    console.log('Instancia seleccionada:', instance);
    console.log('Para la métrica:', selectedMetricType);
    setShowInstanceSelector(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cloudwatch-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <FaChartLine className="header-icon" />
            <h2>CloudWatch Manager</h2>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'métricas' ? 'active' : ''}`}
            onClick={() => setActiveTab('métricas')}
          >
            <FaChartLine /> Métricas
          </button>
          <button 
            className={`tab ${activeTab === 'alarmas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alarmas')}
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

        {activeTab === 'métricas' && renderMetricsTab()}
        {activeTab === 'alarmas' && renderAlarmsTab()}
        {activeTab === 'logs' && renderLogsTab()}

        {showInstanceSelector && (
          <InstanceSelectorModal
            onClose={() => setShowInstanceSelector(false)}
            onSelect={handleInstanceSelect}
          />
        )}
      </div>
    </div>
  );
};

export default CloudWatchManager; 
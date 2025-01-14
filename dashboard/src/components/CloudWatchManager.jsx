import React, { useState, useEffect } from 'react';
import { FaChartLine, FaBell, FaList, FaMicrochip, FaMemory, FaNetworkWired, FaHdd, FaCheckCircle, FaEye, FaServer } from 'react-icons/fa';
import InstanceSelectorModal from './cloudwatch/InstanceSelectorModal';
import MetricModal from './cloudwatch/MetricModal';
import '../styles/components/cloudwatch.css';

const CloudWatchManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('métricas');
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  
  // Inicializar assignedInstances desde localStorage
  const [assignedInstances, setAssignedInstances] = useState(() => {
    const saved = localStorage.getItem('cloudwatch_assigned_instances');
    return saved ? JSON.parse(saved) : {
      cpu: null,
      network: null,
      disk: null,
      status: null
    };
  });

  // Guardar en localStorage cuando cambie assignedInstances
  useEffect(() => {
    localStorage.setItem('cloudwatch_assigned_instances', JSON.stringify(assignedInstances));
  }, [assignedInstances]);

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
      id: 'network',
      title: 'Network I/O',
      description: 'Tráfico de red entrante/saliente',
      unit: 'Bytes',
      icon: <FaNetworkWired />,
      color: 'var(--accent-color)'
    },
    {
      id: 'disk',
      title: 'Disk Operations',
      description: 'Operaciones de lectura en el volumen EBS',
      unit: 'Ops/s',
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
          <div key={metric.id} className={`metric-card ${assignedInstances[metric.id] ? 'has-instance' : ''}`}>
            <div className="metric-icon">
              {metric.icon}
            </div>
            <div className="metric-info">
              <h3>{metric.title}</h3>
              <span className="metric-unit">{metric.unit}</span>
            </div>
            <p className="metric-description">{metric.description}</p>
            
            {assignedInstances[metric.id] && (
              <div className="assigned-instance">
                <span className="instance-name">
                  <FaServer className="instance-icon" />
                  {assignedInstances[metric.id].name || assignedInstances[metric.id].id}
                </span>
              </div>
            )}

            <div className="metric-actions">
              <button 
                className="add-metric-btn"
                onClick={() => handleAddMetric(metric)}
              >
                {assignedInstances[metric.id] ? 'Cambiar Instancia' : 'Añadir a Métricas'}
              </button>
              <button 
                className="view-metric-btn"
                onClick={() => handleViewMetric(metric)}
                disabled={!assignedInstances[metric.id]}
              >
                <FaEye />
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
    const newAssignedInstances = {
      ...assignedInstances,
      [selectedMetricType.id]: instance
    };
    setAssignedInstances(newAssignedInstances);
    localStorage.setItem('cloudwatch_assigned_instances', JSON.stringify(newAssignedInstances));
    
    setShowInstanceSelector(false);
    if (selectedMetricType) {
      setSelectedMetric(selectedMetricType);
      setShowMetricModal(true);
    }
  };

  const handleViewMetric = (metric) => {
    if (assignedInstances[metric.id]) {
      setSelectedMetric(metric);
      setSelectedInstance(assignedInstances[metric.id]);
      setShowMetricModal(true);
    } else {
      setSelectedMetricType(metric);
      setShowInstanceSelector(true);
    }
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

        {showMetricModal && selectedMetric && selectedInstance && (
          <MetricModal
            metric={selectedMetric}
            instance={selectedInstance}
            onClose={() => setShowMetricModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CloudWatchManager; 
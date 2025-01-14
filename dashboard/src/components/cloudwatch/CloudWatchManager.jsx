import React, { useState, useEffect } from 'react';
import { FaChartLine, FaBell, FaList, FaMicrochip, FaMemory, FaNetworkWired, FaHdd, FaCheckCircle, FaEye, FaServer, FaEdit, FaTrash, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';
import InstanceSelectorModal from './InstanceSelectorModal';
import MetricModal from './MetricModal';
import '../../styles/components/cloudwatch.css';
import { initializeEC2Client } from '../../services/ec2Service';
import CreateAlarmModal from './CreateAlarmModal';
import AlarmForm from './AlarmForm';
import { initializeCloudWatchInstances } from '../../services/cloudwatchInstanceService';
import { initializeCloudWatchAlarms, createCloudWatchAlarm, deleteCloudWatchAlarm, getAlarmState } from '../../services/cloudwatchAlarms';

const CloudWatchManager = ({ isOpen, onClose, onAddMetric }) => {
  const [activeTab, setActiveTab] = useState('métricas');
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [alarms, setAlarms] = useState(() => {
    const savedAlarms = localStorage.getItem('cloudwatch_alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : [];
  });
  const [showCreateAlarmModal, setShowCreateAlarmModal] = useState(false);
  const [isCreatingAlarm, setIsCreatingAlarm] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  
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

  // Guardar alarmas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('cloudwatch_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
    if (awsConfig) {
      initializeEC2Client(awsConfig);
      initializeCloudWatchInstances(awsConfig);
      initializeCloudWatchAlarms(awsConfig);
    }
  }, []);

  // Añadir efecto para actualizar estados de alarmas
  useEffect(() => {
    const updateAlarmStates = async () => {
      try {
        const updatedAlarms = await Promise.all(
          alarms.map(async (alarm) => {
            const state = await getAlarmState(alarm.name);
            return {
              ...alarm,
              status: state === 'ALARM' ? 'ALARMA' :
                      state === 'OK' ? 'OK' :
                      'DATOS INSUFICIENTES'
            };
          })
        );
        setAlarms(updatedAlarms);
      } catch (error) {
        console.error('Error actualizando estados de alarmas:', error);
      }
    };

    if (isOpen && alarms.length > 0) {
      updateAlarmStates();
      const interval = setInterval(updateAlarmStates, 60000); // Actualizar cada minuto
      return () => clearInterval(interval);
    }
  }, [isOpen, alarms.length]);

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
      title: 'Disk Read Operations',
      description: 'Operaciones de lectura por segundo en el volumen EBS',
      unit: 'Ops/s',
      metricName: 'DiskReadOps',
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
              {assignedInstances[metric.id] && (
                <button 
                  className="add-to-dashboard-btn"
                  onClick={() => handleAddToDashboard(metric, assignedInstances[metric.id])}
                  title="Añadir al Dashboard"
                >
                  <FaChartLine />
                </button>
              )}
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
      {isCreatingAlarm ? (
        <AlarmForm 
          onBack={() => {
            setIsCreatingAlarm(false);
            setSelectedAlarm(null);
          }}
          onSubmit={(formData) => {
            if (selectedAlarm) {
              setAlarms(prev => prev.map(alarm => 
                alarm.id === selectedAlarm.id 
                  ? { ...alarm, ...formData }
                  : alarm
              ));
            } else {
              handleCreateAlarm(formData);
            }
            setSelectedAlarm(null);
          }}
          initialData={selectedAlarm}
        />
      ) : (
        <>
          <h2 className="content-title">Alarmas</h2>
          <div className="alarms-container">
            {alarms.length === 0 ? (
              <div className="no-alarms">
                <FaBell className="no-data-icon" />
                <h3>No hay alarmas configuradas</h3>
                <p>Añade una alarma para monitorear tus recursos</p>
                <button 
                  className="add-alarm-btn"
                  onClick={() => setIsCreatingAlarm(true)}
                >
                  Crear Nueva Alarma
                </button>
              </div>
            ) : (
              <>
                <div className="alarms-list">
                  {alarms.map(alarm => (
                    <div key={alarm.id} className="alarm-card">
                      <div className="alarm-actions">
                        <button 
                          className="alarm-action-btn"
                          onClick={() => handleEditAlarm(alarm)}
                          title="Editar alarma"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="alarm-action-btn delete"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                          title="Eliminar alarma"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="alarm-header">
                        <div className="alarm-title">
                          <FaBell className="alarm-icon" />
                          <h3>{alarm.name}</h3>
                        </div>
                        <span className={`status ${getStatusClass(alarm.status)}`}>
                          {alarm.status}
                        </span>
                      </div>
                      <div className="alarm-details">
                        <p><FaChartLine /> Métrica: {
                          alarm.metric === 'cpu' ? 'CPU Utilization' :
                          alarm.metric === 'memory' ? 'Memory Usage' :
                          alarm.metric === 'disk' ? 'Disk Usage' :
                          alarm.metric === 'network' ? 'Network I/O' :
                          alarm.metric
                        }</p>
                        <p><FaServer /> Instancia: {alarm.instanceName || alarm.instance}</p>
                        <p><FaExclamationTriangle /> Condición: {
                          alarm.condition === 'greater' ? 'Mayor que' :
                          alarm.condition === 'less' ? 'Menor que' :
                          alarm.condition === 'equal' ? 'Igual a' :
                          alarm.condition
                        } {alarm.threshold}%</p>
                        <p><FaEnvelope /> Notificaciones: {
                          alarm.email ? alarm.email.replace(/(.{3}).*(@.*)/, '$1***$2') : 'No configurado'
                        }</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="add-alarm-btn"
                  onClick={() => setIsCreatingAlarm(true)}
                >
                  Crear Nueva Alarma
                </button>
              </>
            )}
          </div>
        </>
      )}
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
    console.log('Nueva instancia seleccionada:', instance);
    const newAssignedInstances = {
      ...assignedInstances,
      [selectedMetricType.id]: {
        id: instance.id,
        name: instance.name || instance.id
      }
    };
    setAssignedInstances(newAssignedInstances);
    localStorage.setItem('cloudwatch_assigned_instances', JSON.stringify(newAssignedInstances));
    
    setShowInstanceSelector(false);
    if (selectedMetricType) {
      setSelectedMetric(selectedMetricType);
      setSelectedInstance(instance);
      setShowMetricModal(true);
    }
  };

  const handleViewMetric = (metric) => {
    if (assignedInstances[metric.id]) {
      console.log('Instancia seleccionada para ver métrica:', assignedInstances[metric.id]);
      setSelectedMetric(metric);
      setSelectedInstance({
        id: assignedInstances[metric.id].id,
        name: assignedInstances[metric.id].name
      });
      setShowMetricModal(true);
    } else {
      setSelectedMetricType(metric);
      setShowInstanceSelector(true);
    }
  };

  const handleAddToDashboard = (metric, instance) => {
    if (!instance || !instance.id) {
      console.error('ID de instancia no válido:', instance);
      return;
    }

    const newMetric = {
      title: metric.title,
      instanceId: instance.id,
      instanceName: instance.name,
      type: metric.id,
      value: '0',
      unit: metric.unit,
      metricName: metric.metricName || metric.id,
      icon: metric.icon
    };

    onAddMetric(newMetric);
    onClose();
  };

  const handleAssignInstance = (metricType, instance) => {
    setAssignedInstances(prev => ({
      ...prev,
      [metricType]: {
        id: instance.InstanceId,
        name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId
      }
    }));
  };

  const handleCreateAlarm = async (alarmData) => {
    try {
      await createCloudWatchAlarm(alarmData);
      const newAlarm = {
        ...alarmData,
        id: Date.now(),
        status: 'OK',
        createdAt: new Date().toISOString()
      };
      setAlarms(prev => [...prev, newAlarm]);
      setIsCreatingAlarm(false);
    } catch (error) {
      console.error('Error al crear la alarma:', error);
      alert('Error al crear la alarma en CloudWatch');
    }
  };

  const handleEditAlarm = (alarm) => {
    setSelectedAlarm(alarm);
    setIsCreatingAlarm(true);
  };

  const handleDeleteAlarm = async (alarmId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta alarma?')) {
      try {
        const alarm = alarms.find(a => a.id === alarmId);
        await deleteCloudWatchAlarm(alarm.name);
        setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
      } catch (error) {
        console.error('Error al eliminar la alarma:', error);
        alert('Error al eliminar la alarma de CloudWatch');
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ALARMA': return 'alarm';
      case 'OK': return 'ok';
      default: return 'insufficient';
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

        {showCreateAlarmModal && (
          <CreateAlarmModal
            onClose={() => setShowCreateAlarmModal(false)}
            onCreate={(data) => {
              console.log('Nueva alarma:', data);
              setShowCreateAlarmModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CloudWatchManager; 
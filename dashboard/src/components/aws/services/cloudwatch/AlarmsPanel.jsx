import React, { useState } from 'react';
import { FaBell, FaPlus, FaServer, FaExclamationTriangle, FaCheck, FaQuestionCircle, FaPencilAlt, FaTrash } from 'react-icons/fa';
import AlarmForm from './AlarmForm';

const AlarmsPanel = () => {
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [alarms] = useState([
    {
      id: 1,
      name: 'High CPU Usage',
      metric: 'CPUUtilization',
      instance: 'i-123456789',
      instanceName: 'Production Server',
      threshold: '80%',
      condition: 'greater',
      state: 'OK',
      email: 'admin@example.com'
    },
    {
      id: 2,
      name: 'Memory Alert',
      metric: 'MemoryUtilization',
      instance: 'i-987654321',
      instanceName: 'Database Server',
      threshold: '90%',
      condition: 'greater',
      state: 'ALARM',
      email: 'admin@example.com'
    }
  ]);

  const getStateIcon = (state) => {
    switch (state) {
      case 'OK':
        return <FaCheck className="state-icon ok" />;
      case 'ALARM':
        return <FaExclamationTriangle className="state-icon alarm" />;
      default:
        return <FaQuestionCircle className="state-icon unknown" />;
    }
  };

  return (
    <div className="alarms-panel">
      <div className="panel-actions">
        <button className="create-alarm-btn" onClick={() => setShowAlarmForm(true)}>
          <FaPlus /> Nueva Alarma
        </button>
      </div>

      <div className="alarms-grid">
        {alarms.map(alarm => (
          <div key={alarm.id} className="alarm-card">
            <div className="alarm-header">
              <div className="alarm-title">
                <div className="alarm-name">
                  <FaBell className="alarm-icon" />
                  <h3>{alarm.name}</h3>
                </div>
                <div className={`alarm-state ${alarm.state.toLowerCase()}`}>
                  {getStateIcon(alarm.state)}
                  <span>{alarm.state}</span>
                </div>
              </div>
            </div>

            <div className="alarm-content">
              <div className="instance-info">
                <div className="instance-icon">
                  <FaServer />
                </div>
                <div className="instance-details">
                  <div className="instance-name">{alarm.instanceName}</div>
                  <div className="instance-id">{alarm.instance}</div>
                </div>
              </div>

              <div className="metric-info">
                <div className="metric-item">
                  <span className="metric-label">Métrica</span>
                  <span className="metric-value">{alarm.metric}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Condición</span>
                  <span className="metric-value">
                    {alarm.condition === 'greater' ? 'Mayor que' : 'Menor que'} {alarm.threshold}
                  </span>
                </div>
              </div>
            </div>

            <div className="alarm-footer">
              <span className="notification-email">{alarm.email}</span>
              <div className="alarm-actions">
                <button className="action-btn edit" title="Editar">
                  <FaPencilAlt />
                </button>
                <button className="action-btn delete" title="Eliminar">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAlarmForm && (
        <AlarmForm
          onClose={() => setShowAlarmForm(false)}
          onSubmit={(data) => {
            console.log('Nueva alarma:', data);
            setShowAlarmForm(false);
          }}
        />
      )}
    </div>
  );
};

export default AlarmsPanel; 
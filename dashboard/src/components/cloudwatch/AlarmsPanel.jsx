import React, { useState } from 'react';
import { FaBell, FaPlus } from 'react-icons/fa';

const AlarmsPanel = () => {
  const [alarms] = useState([
    {
      id: 1,
      name: 'High CPU Usage',
      metric: 'CPUUtilization',
      threshold: '80%',
      state: 'OK',
      service: 'EC2'
    },
    {
      id: 2,
      name: 'Database Connections',
      metric: 'DatabaseConnections',
      threshold: '100',
      state: 'ALARM',
      service: 'RDS'
    }
  ]);

  return (
    <div className="alarms-panel">
      <div className="panel-header">
        <h3>Alarmas CloudWatch</h3>
        <button className="create-alarm-btn">
          <FaPlus /> Nueva Alarma
        </button>
      </div>

      <div className="alarms-list">
        {alarms.map(alarm => (
          <div key={alarm.id} className="alarm-item">
            <div className={`alarm-status ${alarm.state.toLowerCase()}`}>
              <FaBell />
            </div>
            <div className="alarm-info">
              <h4>{alarm.name}</h4>
              <div className="alarm-details">
                <span>{alarm.service} | {alarm.metric}</span>
                <span>Umbral: {alarm.threshold}</span>
              </div>
            </div>
            <div className="alarm-actions">
              <button>Editar</button>
              <button>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlarmsPanel; 
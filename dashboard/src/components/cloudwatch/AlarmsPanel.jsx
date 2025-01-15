import React, { useState, useEffect } from 'react';
import { FaTrash, FaBell, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { 
  listAlarms, 
  deleteAlarm, 
  createAlarm 
} from '../../services/cloudwatchAlarms';
import { logSystemEvent } from '../../services/cloudwatchLogs';

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAlarm = async (alarmName) => {
    try {
      setLoading(true);
      await deleteAlarm(alarmName);
      // Registrar la eliminación de la alarma
      await logSystemEvent('Alarma eliminada', {
        Nombre: alarmName,
        Acción: 'Eliminación',
        Usuario: 'Sistema',
        Fecha: new Date().toISOString()
      }, '/aws/ec2/aws-cloudwatch-alarms');
      
      // Actualizar la lista de alarmas
      const updatedAlarms = alarms.filter(alarm => alarm.AlarmName !== alarmName);
      setAlarms(updatedAlarms);
    } catch (error) {
      await logSystemEvent('Error al eliminar alarma', {
        Nombre: alarmName,
        Error: error.message,
        Fecha: new Date().toISOString()
      }, '/aws/ec2/aws-cloudwatch-alarms');
      setError(`Error al eliminar la alarma: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
              <button
                onClick={() => handleDeleteAlarm(alarm.name)}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AlarmsPanel; 
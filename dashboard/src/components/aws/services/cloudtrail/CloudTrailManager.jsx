import React, { useState, useEffect } from 'react';
import { FaHistory, FaUser, FaClock, FaServer, FaGlobe } from 'react-icons/fa';
import { getRecentActivity } from './cloudTrailService';
import './cloudtrail-manager.css';

const CloudTrailManager = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const events = await getRecentActivity();
      setActivities(events);
    } catch (err) {
      setError('Error al cargar el historial de actividades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cloudtrail-container">
      <div className="cloudtrail-header">
        <h2><FaHistory /> Registro de Actividad AWS</h2>
        <button onClick={loadActivities} className="refresh-button">
          Actualizar
        </button>
      </div>

      {loading && <div className="loading">Cargando actividades...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-card">
            <div className="activity-header">
              <span className="event-name">{activity.EventName}</span>
              <span className="event-time">
                <FaClock /> {new Date(activity.EventTime).toLocaleString()}
              </span>
            </div>
            
            <div className="activity-details">
              <div className="detail-item">
                <FaUser /> Usuario: {activity.Username || 'Sistema'}
              </div>
              <div className="detail-item">
                <FaServer /> Servicio: {activity.EventSource}
              </div>
              <div className="detail-item">
                <FaGlobe /> Región: {activity.AwsRegion}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudTrailManager; 
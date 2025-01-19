import React, { useState, useEffect } from 'react';
import { FaDocker, FaTimes, FaPlay, FaStop, FaTrash } from 'react-icons/fa';
import { getClusters, getServices, startService, stopService, deleteService } from '../../../../services/aws/ecs/ecsService';
import './styles/ecs-manager.css';

const ECSManager = ({ isOpen, onClose }) => {
  const [clusters, setClusters] = useState([]);
  const [services, setServices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadClusters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCluster) {
      loadServices(selectedCluster);
    }
  }, [selectedCluster]);

  const loadClusters = async () => {
    try {
      setIsLoading(true);
      const clustersList = await getClusters();
      setClusters(clustersList);
      if (clustersList.length > 0) {
        setSelectedCluster(clustersList[0].clusterArn);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar clusters: ' + err.message);
      console.error('Error cargando clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async (clusterArn) => {
    try {
      const servicesList = await getServices(clusterArn);
      setServices(prev => ({
        ...prev,
        [clusterArn]: servicesList
      }));
    } catch (err) {
      setError('Error al cargar servicios: ' + err.message);
    }
  };

  const handleStartService = async (clusterArn, serviceName) => {
    try {
      await startService(clusterArn, serviceName);
      await loadServices(clusterArn);
    } catch (err) {
      setError('Error al iniciar servicio: ' + err.message);
    }
  };

  const handleStopService = async (clusterArn, serviceName) => {
    try {
      await stopService(clusterArn, serviceName);
      await loadServices(clusterArn);
    } catch (err) {
      setError('Error al detener servicio: ' + err.message);
    }
  };

  const handleDeleteService = async (clusterArn, serviceName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el servicio ${serviceName}?`)) {
      try {
        await deleteService(clusterArn, serviceName);
        await loadServices(clusterArn);
      } catch (err) {
        setError('Error al eliminar servicio: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="ecs-manager-modal">
        <div className="modal-header">
          <h2><FaDocker /> Amazon ECS</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Cargando clusters...</div>
          ) : (
            <>
              <div className="cluster-selector">
                <select 
                  value={selectedCluster || ''} 
                  onChange={(e) => setSelectedCluster(e.target.value)}
                >
                  {clusters.map(cluster => (
                    <option key={cluster.clusterArn} value={cluster.clusterArn}>
                      {cluster.clusterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="services-list">
                {selectedCluster && services[selectedCluster]?.map(service => (
                  <div key={service.serviceArn} className="service-item">
                    <div className="service-info">
                      <h4>{service.serviceName}</h4>
                      <p>Estado: {service.status}</p>
                      <p>Tareas en ejecución: {service.runningCount}</p>
                      <p>Tareas deseadas: {service.desiredCount}</p>
                    </div>
                    <div className="service-actions">
                      <button
                        className="start-service-btn"
                        onClick={() => handleStartService(selectedCluster, service.serviceName)}
                        disabled={service.status === 'ACTIVE'}
                      >
                        <FaPlay /> Iniciar
                      </button>
                      <button
                        className="stop-service-btn"
                        onClick={() => handleStopService(selectedCluster, service.serviceName)}
                        disabled={service.status === 'INACTIVE'}
                      >
                        <FaStop /> Detener
                      </button>
                      <button
                        className="delete-service-btn"
                        onClick={() => handleDeleteService(selectedCluster, service.serviceName)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ECSManager; 
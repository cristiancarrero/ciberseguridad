import React, { useState, useEffect } from 'react';
import { FaServer, FaPlay, FaStop, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { listInstances, launchInstance, startInstance, stopInstance, terminateInstance } from '../services/ec2Service';
import '../styles/components/ec2manager.css';

const EC2Manager = ({ isOpen, onClose }) => {
  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [newInstanceData, setNewInstanceData] = useState({
    name: '',
    type: 't2.micro',
    keyPair: '',
    securityGroup: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadInstances();
    }
  }, [isOpen]);

  const loadInstances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const instancesList = await listInstances();
      setInstances(instancesList);
    } catch (error) {
      console.error('Error loading instances:', error);
      setError('Error al cargar las instancias. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchInstance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await launchInstance(newInstanceData);
      setIsLaunchModalOpen(false);
      await loadInstances();
    } catch (error) {
      console.error('Error launching instance:', error);
      setError('Error al lanzar la instancia. Por favor, verifique los datos e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInstance = async (instanceId) => {
    try {
      setIsLoading(true);
      setError(null);
      await startInstance(instanceId);
      await loadInstances();
    } catch (error) {
      console.error('Error starting instance:', error);
      setError('Error al iniciar la instancia. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopInstance = async (instanceId) => {
    try {
      setIsLoading(true);
      setError(null);
      await stopInstance(instanceId);
      await loadInstances();
    } catch (error) {
      console.error('Error stopping instance:', error);
      setError('Error al detener la instancia. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateInstance = async (instanceId) => {
    if (window.confirm('¿Está seguro de que desea terminar esta instancia? Esta acción no se puede deshacer.')) {
      try {
        setIsLoading(true);
        setError(null);
        await terminateInstance(instanceId);
        await loadInstances();
      } catch (error) {
        console.error('Error terminating instance:', error);
        setError('Error al terminar la instancia. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ec2-modal">
      <div className="modal-header">
        <div className="header-title">
          <FaServer className="ec2-icon" />
          <h2>Gestionar Instancias EC2</h2>
        </div>
        <button className="action-btn secondary" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="control-panel">
          <button 
            className="action-btn primary"
            onClick={() => setIsLaunchModalOpen(true)}
            disabled={isLoading}
          >
            <FaPlus />
            Lanzar Nueva Instancia
          </button>
        </div>

        <div className="instances-list">
          {isLoading ? (
            <div className="loading-message">
              Cargando...
            </div>
          ) : instances.length === 0 ? (
            <div className="no-instances">
              <FaServer className="empty-icon" />
              <p>No hay instancias disponibles</p>
            </div>
          ) : (
            instances.map((instance) => (
              <div key={instance.id} className="instance-card">
                <div className="instance-info">
                  <span className="instance-name">{instance.name}</span>
                  <span className="instance-type">{instance.type}</span>
                  <span className={`instance-status ${instance.status}`}>
                    {instance.status}
                  </span>
                </div>
                <div className="instance-actions">
                  {instance.status === 'stopped' && (
                    <button 
                      className="action-btn success"
                      onClick={() => handleStartInstance(instance.id)}
                      disabled={isLoading}
                    >
                      <FaPlay />
                    </button>
                  )}
                  {instance.status === 'running' && (
                    <button 
                      className="action-btn warning"
                      onClick={() => handleStopInstance(instance.id)}
                      disabled={isLoading}
                    >
                      <FaStop />
                    </button>
                  )}
                  <button 
                    className="action-btn danger"
                    onClick={() => handleTerminateInstance(instance.id)}
                    disabled={isLoading}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isLaunchModalOpen && (
        <div className="launch-modal">
          <div className="launch-modal-content">
            <h3>Lanzar Nueva Instancia</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={newInstanceData.name}
                onChange={(e) => setNewInstanceData({
                  ...newInstanceData,
                  name: e.target.value
                })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Tipo de Instancia</label>
              <select
                value={newInstanceData.type}
                onChange={(e) => setNewInstanceData({
                  ...newInstanceData,
                  type: e.target.value
                })}
                disabled={isLoading}
              >
                <option value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</option>
                <option value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</option>
                <option value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Key Pair</label>
              <input
                type="text"
                value={newInstanceData.keyPair}
                onChange={(e) => setNewInstanceData({
                  ...newInstanceData,
                  keyPair: e.target.value
                })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Grupo de Seguridad</label>
              <input
                type="text"
                value={newInstanceData.securityGroup}
                onChange={(e) => setNewInstanceData({
                  ...newInstanceData,
                  securityGroup: e.target.value
                })}
                disabled={isLoading}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="action-btn secondary"
                onClick={() => setIsLaunchModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                className="action-btn primary"
                onClick={handleLaunchInstance}
                disabled={isLoading}
              >
                Lanzar Instancia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EC2Manager; 
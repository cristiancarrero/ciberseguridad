import React, { useState, useEffect } from 'react';
import { FaServer, FaPlay, FaStop, FaTrash, FaPlus, FaTimes, FaInfoCircle, FaTerminal, FaCopy, FaCheck } from 'react-icons/fa';
import { listInstances, startInstance, stopInstance, terminateInstance, launchInstance } from '../services/ec2Service';
import '../styles/components/ec2manager.css';
import '../styles/components/connection-modal.css';
import SSHKeyManager from './SSHKeyManager';
import InstanceTerminal from './InstanceTerminal';

const INSTANCE_PRESETS = {
  basic: {
    name: "Instancia Básica (t2.micro)",
    type: "t2.micro",
    description: "Ideal para desarrollo y pruebas",
    specs: {
      vCPU: "1 vCPU",
      memory: "1 GB RAM",
      storage: "8 GB SSD"
    },
    imageId: "ami-0735c191cf914754d"
  },
  standard: {
    name: "Instancia Estándar (t2.small)",
    type: "t2.small",
    description: "Recomendada para aplicaciones en producción",
    specs: {
      vCPU: "1 vCPU",
      memory: "2 GB RAM",
      storage: "16 GB SSD"
    },
    imageId: "ami-0735c191cf914754d"
  }
};

const EC2Manager = ({ isOpen, onClose }) => {
  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [instancesError, setInstancesError] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('basic');
  const [instanceName, setInstanceName] = useState('');
  const [createError, setCreateError] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedInstanceForConnection, setSelectedInstanceForConnection] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [hasSSHKey, setHasSSHKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInstances();
    }
  }, [isOpen]);

  const loadInstances = async () => {
    try {
      setIsLoading(true);
      setInstancesError(null);
      const instancesList = await listInstances();
      setInstances(instancesList);
    } catch (error) {
      setInstancesError('Error al cargar las instancias: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInstance = async (instanceId) => {
    try {
      setIsLoading(true);
      await startInstance(instanceId);
      await loadInstances();
    } catch (error) {
      setError('Error al iniciar la instancia: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopInstance = async (instanceId) => {
    if (window.confirm('¿Deseas detener esta instancia? Podrás volver a iniciarla más tarde.')) {
      try {
        setIsLoading(true);
        await stopInstance(instanceId);
        await loadInstances();
      } catch (error) {
        setInstancesError('Error al detener la instancia: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTerminateInstance = async (instanceId) => {
    if (window.confirm('¿Estás seguro de que quieres ELIMINAR esta instancia? Esta acción no se puede deshacer y la instancia se eliminará permanentemente.')) {
      try {
        setIsLoading(true);
        
        // Primero eliminamos la instancia de la lista local para feedback inmediato
        setInstances(prevInstances => prevInstances.filter(instance => instance.id !== instanceId));
        
        // Luego intentamos terminarla en AWS
        try {
          await terminateInstance(instanceId);
        } catch (error) {
          // Si hay error al terminar en AWS, probablemente ya está terminada
          console.log('La instancia ya podría estar terminada:', error);
        }

        // Cerrar modales si es necesario
        if (showDetails && selectedInstance?.id === instanceId) {
          setShowDetails(false);
          setSelectedInstance(null);
        }

        // Si era la última instancia, mostrar el estado inicial
        if (instances.length <= 1) {
          setShowCreateModal(false);
          setSelectedInstance(null);
          setShowDetails(false);
        }

      } catch (error) {
        setInstancesError('Error al eliminar la instancia: ' + error.message);
        // Recargar la lista para asegurar que mostramos el estado correcto
        await loadInstances();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleShowDetails = (instance) => {
    setSelectedInstance(instance);
    setShowDetails(true);
  };

  const handleCreateInstance = () => {
    setShowCreateModal(true);
  };

  const handleLaunchInstance = async () => {
    try {
      setIsLoading(true);
      setCreateError(null);

      const selectedConfig = INSTANCE_PRESETS[selectedPreset];
      const instanceData = {
        name: instanceName,
        type: selectedConfig.type,
        imageId: selectedConfig.imageId,
        keyName: 'vockey',
        securityGroup: 'default'
      };

      console.log('Creando instancia con configuración:', instanceData);
      
      await launchInstance(instanceData);
      await loadInstances();
      setShowCreateModal(false);
      setInstanceName('');
      
    } catch (error) {
      console.error('Error al crear la instancia:', error);
      setCreateError('Error al crear la instancia: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace clic en el overlay y no en su contenido
    if (e.target.className === 'modal-overlay') {
      if (showCreateModal) {
        // Si el modal de creación está abierto, cerrarlo primero
        setShowCreateModal(false);
      } else if (showDetails) {
        // Si los detalles están abiertos, cerrarlos primero
        setShowDetails(false);
      } else {
        // Si no hay modales secundarios abiertos, cerrar el modal principal
        onClose();
      }
    }
  };

  const handleShowConnectionInstructions = (instance) => {
    setSelectedInstanceForConnection(instance);
    setShowConnectionModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content ec2-manager">
        <div className="modal-header">
          <h2><FaServer /> Gestor de Instancias EC2</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="instances-list">
            {isLoading ? (
              <div className="loading">Cargando instancias...</div>
            ) : instances.length === 0 ? (
              <div className="no-instances">
                <FaServer />
                <p>No hay instancias disponibles</p>
                <button 
                  className="create-instance-btn"
                  onClick={handleCreateInstance}
                >
                  <FaPlus /> Crear Nueva Instancia
                </button>
              </div>
            ) : (
              <>
                <div className="create-instance-button-container">
                  <button 
                    className="create-instance-btn"
                    onClick={handleCreateInstance}
                  >
                    <FaPlus /> Crear Nueva Instancia
                  </button>
                </div>

                {instances.filter(instance => instance.state !== 'terminated').map(instance => (
                  <div key={instance.id} className="instance-card">
                    <div className="instance-info">
                      <h3>{instance.name || instance.id}</h3>
                      <div className="instance-details">
                        <span className={`status ${instance.state}`}>
                          {instance.state}
                        </span>
                        <span className="type">{instance.type}</span>
                        <span className="ip">{instance.publicIp}</span>
                      </div>
                    </div>
                    <div className="instance-actions">
                      <button
                        className="action-btn info"
                        onClick={() => handleShowDetails(instance)}
                        title="Ver detalles"
                      >
                        <FaInfoCircle />
                      </button>
                      {instance.state === 'stopped' && (
                        <button
                          className="action-btn start"
                          onClick={() => handleStartInstance(instance.id)}
                          disabled={isLoading}
                          title="Iniciar instancia"
                        >
                          <FaPlay />
                        </button>
                      )}
                      {instance.state === 'running' && (
                        <button
                          className="action-btn stop"
                          onClick={() => handleStopInstance(instance.id)}
                          disabled={isLoading}
                          title="Detener instancia (temporal)"
                        >
                          <FaStop />
                        </button>
                      )}
                      <button
                        className="action-btn terminate"
                        onClick={() => handleTerminateInstance(instance.id)}
                        disabled={isLoading}
                        title="Eliminar instancia permanentemente"
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="action-btn connect"
                        onClick={() => {
                          setSelectedInstanceForConnection(instance);
                          if (!hasSSHKey) {
                            // Si no hay clave SSH, mostrar el modal para subirla
                            setShowConnectionModal(true);
                          } else {
                            // Si ya hay clave, mostrar el modal con las opciones
                            setShowConnectionModal(true);
                          }
                        }}
                        title="Conectar a terminal"
                      >
                        <FaTerminal />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {showDetails && selectedInstance && (
          <div className="instance-details-modal" onClick={e => e.stopPropagation()}>
            <div className="details-content">
              <h3>Detalles de la Instancia</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">ID:</span>
                  <span className="value">{selectedInstance.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Tipo:</span>
                  <span className="value">{selectedInstance.type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">IP Pública:</span>
                  <span className="value">{selectedInstance.publicIp}</span>
                </div>
                <div className="detail-item">
                  <span className="label">IP Privada:</span>
                  <span className="value">{selectedInstance.privateIp}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Plataforma:</span>
                  <span className="value">{selectedInstance.platform}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Lanzamiento:</span>
                  <span className="value">
                    {new Date(selectedInstance.launchTime).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="security-groups">
                <h4>Grupos de Seguridad:</h4>
                <ul>
                  {selectedInstance.securityGroups.map(sg => (
                    <li key={sg.GroupId}>{sg.GroupName}</li>
                  ))}
                </ul>
              </div>
              <button 
                className="close-details-btn"
                onClick={() => setShowDetails(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="create-instance-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2><FaPlus /> Crear Nueva Instancia EC2</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="modal-body">
                {createError && (
                  <div className="error-message">
                    {createError}
                  </div>
                )}

                <div className="preset-selector">
                  <div 
                    className={`preset-card ${selectedPreset === 'basic' ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset('basic')}
                  >
                    <div className="preset-header">
                      <FaServer />
                      <h3>
                        Instancia Básica <span className="instance-type">t2.micro</span>
                      </h3>
                    </div>
                    <p className="preset-description">{INSTANCE_PRESETS.basic.description}</p>
                    <div className="preset-specs">
                      <div className="spec-item">
                        <span className="label">CPU:</span>
                        <span className="value">{INSTANCE_PRESETS.basic.specs.vCPU}</span>
                      </div>
                      <div className="spec-item">
                        <span className="label">Memoria:</span>
                        <span className="value">{INSTANCE_PRESETS.basic.specs.memory}</span>
                      </div>
                      <div className="spec-item">
                        <span className="label">Almacenamiento:</span>
                        <span className="value">{INSTANCE_PRESETS.basic.specs.storage}</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`preset-card ${selectedPreset === 'standard' ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset('standard')}
                  >
                    <div className="preset-header">
                      <FaServer />
                      <h3>
                        Instancia Estándar <span className="instance-type">t2.small</span>
                      </h3>
                    </div>
                    <p className="preset-description">{INSTANCE_PRESETS.standard.description}</p>
                    <div className="preset-specs">
                      <div className="spec-item">
                        <span className="label">CPU:</span>
                        <span className="value">{INSTANCE_PRESETS.standard.specs.vCPU}</span>
                      </div>
                      <div className="spec-item">
                        <span className="label">Memoria:</span>
                        <span className="value">{INSTANCE_PRESETS.standard.specs.memory}</span>
                      </div>
                      <div className="spec-item">
                        <span className="label">Almacenamiento:</span>
                        <span className="value">{INSTANCE_PRESETS.standard.specs.storage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="instance-name-input">
                  <label>Nombre de la Instancia</label>
                  <input 
                    type="text" 
                    placeholder="Mi Instancia EC2"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="create-btn"
                    onClick={handleLaunchInstance}
                    disabled={!instanceName || isLoading}
                  >
                    {isLoading ? 'Creando...' : 'Crear Instancia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConnectionModal && selectedInstanceForConnection && (
          <div className="connection-instructions-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2><FaTerminal /> Conectar a la Instancia</h2>
                <button className="close-btn" onClick={() => setShowConnectionModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {!hasSSHKey ? (
                  <SSHKeyManager 
                    onClose={() => setShowConnectionModal(false)}
                    onKeyUpdate={(hasKey) => {
                      setHasSSHKey(hasKey);
                      if (hasKey) {
                        setShowTerminal(true);
                        setShowConnectionModal(false);
                      }
                    }}
                  />
                ) : (
                  <div className="connection-ready">
                    <div className="key-status">
                      <FaCheck className="key-icon" />
                      <span>Clave SSH cargada</span>
                    </div>
                    <div className="connection-actions">
                      <button 
                        className="connect-terminal-btn"
                        onClick={() => {
                          setShowConnectionModal(false);
                          setShowTerminal(true);
                        }}
                      >
                        <FaTerminal /> Abrir Terminal
                      </button>
                      <button 
                        className="remove-key-btn"
                        onClick={() => {
                          sessionStorage.removeItem('ssh_key');
                          setHasSSHKey(false);
                        }}
                      >
                        <FaTrash /> Eliminar Clave SSH
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showTerminal && selectedInstanceForConnection && (
          <InstanceTerminal
            instance={selectedInstanceForConnection}
            onClose={() => setShowTerminal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EC2Manager; 
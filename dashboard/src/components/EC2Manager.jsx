import React, { useState, useEffect } from 'react';
import { FaServer, FaPlay, FaStop, FaTrash, FaPlus, FaTimes, FaInfoCircle, FaTerminal, FaCopy } from 'react-icons/fa';
import { listInstances, startInstance, stopInstance, terminateInstance, launchInstance } from '../services/ec2Service';
import '../styles/components/ec2manager.css';

const INSTANCE_PRESETS = {
  basic: {
    name: "Instancia Básica",
    type: "t2.micro",
    description: "Ideal para desarrollo y pruebas",
    specs: {
      vCPU: "1 vCPU",
      memory: "1 GB RAM",
      storage: "8 GB SSD"
    },
    imageId: "ami-0735c191cf914754d", // Amazon Linux 2
    tags: {
      Environment: "Development",
      Project: "Testing"
    }
  },
  standard: {
    name: "Instancia Estándar",
    type: "t2.small",
    description: "Recomendada para aplicaciones en producción",
    specs: {
      vCPU: "1 vCPU",
      memory: "2 GB RAM",
      storage: "16 GB SSD"
    },
    imageId: "ami-0735c191cf914754d", // Amazon Linux 2
    tags: {
      Environment: "Production",
      Project: "Main"
    }
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
        securityGroup: 'default',
        tags: {
          Environment: selectedConfig.tags.Environment,
          Project: selectedConfig.tags.Project,
          Name: instanceName
        }
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
                        onClick={() => handleShowConnectionInstructions(instance)}
                        title="Ver instrucciones de conexión"
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
                      <h3>{INSTANCE_PRESETS.basic.name}</h3>
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
                      <h3>{INSTANCE_PRESETS.standard.name}</h3>
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
                <div className="instance-info-summary">
                  <p><strong>ID:</strong> {selectedInstanceForConnection.id}</p>
                  <p><strong>IP Pública:</strong> {selectedInstanceForConnection.publicIp}</p>
                  <p><strong>Estado:</strong> <span className={`status ${selectedInstanceForConnection.state}`}>{selectedInstanceForConnection.state}</span></p>
                </div>

                <div className="connection-steps">
                  <h3>Pasos para conectarse:</h3>
                  <ol>
                    <li>
                      <strong>Descarga la clave privada:</strong>
                      <ul>
                        <li>En AWS Details, busca la sección "SSH key"</li>
                        <li>Haz clic en el botón "Download PEM"</li>
                        <li>Guarda el archivo vockey.pem en un lugar seguro</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Configura los permisos de la clave:</strong>
                      <pre>chmod 400 vockey.pem</pre>
                      <small>* En Windows, este paso no es necesario si usas PuTTY</small>
                    </li>
                    <li>
                      <strong>Conéctate usando SSH:</strong>
                      <pre>ssh -i vockey.pem ec2-user@{selectedInstanceForConnection.publicIp}</pre>
                      <button 
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(
                          `ssh -i vockey.pem ec2-user@${selectedInstanceForConnection.publicIp}`
                        )}
                      >
                        <FaCopy /> Copiar comando
                      </button>
                    </li>
                  </ol>
                </div>

                <div className="connection-notes">
                  <h4>Notas importantes:</h4>
                  <ul>
                    <li>Asegúrate de estar en el directorio donde guardaste vockey.pem</li>
                    <li>En Windows:
                      <ul>
                        <li>Usa Git Bash o WSL para usar el comando SSH directamente</li>
                        <li>O usa PuTTY con el archivo PPK (descarga "Download PPK" en ese caso)</li>
                      </ul>
                    </li>
                    <li>La instancia debe estar en estado "running"</li>
                    <li>Espera 1-2 minutos después de iniciar la instancia antes de conectarte</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EC2Manager; 
import React, { useState, useEffect } from 'react';
import { FaServer, FaSpinner, FaCheck, FaTimes, FaSync, FaExclamationTriangle, FaPlug, FaInfoCircle, FaUnlink } from 'react-icons/fa';
import { getAllEC2Instances, enableSSMOnInstance, disableSSMOnInstance, checkSSMStatus } from '../../../../services/ssmService';
import './styles/ec2-manager.css';
import { toast } from 'react-hot-toast';

const EC2Manager = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingInstance, setProcessingInstance] = useState(null);
  const [initializingInstances, setInitializingInstances] = useState(new Set());

  useEffect(() => {
    loadInstances();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadInstances();
    }, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  const loadInstances = async () => {
    try {
      // No establecer loading en true para actualizaciones periódicas
      if (!instances.length) setLoading(true);
      
      const instancesData = await getAllEC2Instances();
      
      // Obtener el estado de SSM para cada instancia
      const instancesWithStatus = await Promise.all(
        instancesData.map(async (instance) => {
          const ssmStatus = await checkSSMStatus(instance.instanceId);
          // Si la instancia está gestionada, la quitamos del set de inicialización
          if (ssmStatus.isManaged && ssmStatus.status === 'Managed') {
            setInitializingInstances(prev => {
              const newSet = new Set(prev);
              newSet.delete(instance.instanceId);
              return newSet;
            });
          }
          return { ...instance, ssmStatus };
        })
      );
      
      setInstances(instancesWithStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSSM = async (instanceId) => {
    try {
      setProcessingInstance(instanceId);
      await enableSSMOnInstance(instanceId);
      setInitializingInstances(prev => new Set(prev).add(instanceId));
      
      // Actualizamos el estado de SSM para esta instancia específica
      const newStatus = await checkSSMStatus(instanceId);
      
      // Actualizamos la lista de instancias con el nuevo estado
      setInstances(prevInstances => 
        prevInstances.map(instance => 
          instance.instanceId === instanceId 
            ? { ...instance, ssmStatus: newStatus }
            : instance
        )
      );

      // Mostramos mensaje de éxito
      toast.success('SSM habilitado. La instancia aparecerá en Fleet Manager en unos minutos.');
      
    } catch (error) {
      console.error("Error enabling SSM:", error);
      toast.error('Error al habilitar SSM');
    } finally {
      setProcessingInstance(null);
    }
  };

  const handleDisableSSM = async (instanceId) => {
    try {
      setProcessingInstance(instanceId);
      await disableSSMOnInstance(instanceId);
      
      // Actualizamos el estado de SSM para esta instancia específica
      const newStatus = await checkSSMStatus(instanceId);
      
      // Actualizamos la lista de instancias con el nuevo estado
      setInstances(prevInstances => 
        prevInstances.map(instance => 
          instance.instanceId === instanceId 
            ? { ...instance, ssmStatus: newStatus }
            : instance
        )
      );

      toast.success('SSM deshabilitado correctamente');
      
    } catch (error) {
      console.error("Error disabling SSM:", error);
      toast.error('Error al deshabilitar SSM');
    } finally {
      setProcessingInstance(null);
    }
  };

  return (
    <div className="ec2-manager">
      <div className="ec2-header">
        <h3>Gestión de Instancias EC2</h3>
        <button onClick={loadInstances} className="refresh-button">
          <FaSync className={loading ? 'fa-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <div className="info-message">
        <FaInfoCircle />
        <span>
          Después de habilitar SSM, la instancia tardará unos minutos en aparecer en Fleet Manager. 
          Puedes verificar el estado en AWS Systems Manager > Fleet Manager.
        </span>
      </div>

      {loading ? (
        <div className="loading-state">
          <FaSpinner className="fa-spin" />
          <p>Cargando instancias...</p>
        </div>
      ) : (
        <div className="instances-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>IP Pública</th>
                <th>Estado SSM</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instances.map(instance => (
                <tr key={instance.instanceId}>
                  <td>{instance.instanceId}</td>
                  <td>{instance.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${instance.state}`}>
                      {instance.state}
                    </span>
                  </td>
                  <td>{instance.type}</td>
                  <td>{instance.publicIp || '-'}</td>
                  <td>
                    <span className={`ssm-status ${instance.ssmStatus.isManaged ? 'managed' : 'not-managed'}`}>
                      {instance.ssmStatus.status}
                      {initializingInstances.has(instance.instanceId) && (
                        <div className="initializing-note">
                          Inicializando... Verifica en Fleet Manager
                        </div>
                      )}
                    </span>
                  </td>
                  <td>
                    {!instance.ssmStatus.isManaged ? (
                      <button
                        className="enable-ssm-button"
                        onClick={() => handleEnableSSM(instance.instanceId)}
                        disabled={processingInstance === instance.instanceId}
                      >
                        {processingInstance === instance.instanceId ? (
                          <>
                            <FaSpinner className="fa-spin" />
                            <span>Habilitando...</span>
                          </>
                        ) : (
                          <>
                            <FaPlug />
                            <span>Habilitar SSM</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="disable-ssm-button"
                        onClick={() => handleDisableSSM(instance.instanceId)}
                        disabled={processingInstance === instance.instanceId}
                      >
                        {processingInstance === instance.instanceId ? (
                          <>
                            <FaSpinner className="fa-spin" />
                            <span>Deshabilitando...</span>
                          </>
                        ) : (
                          <>
                            <FaUnlink />
                            <span>Deshabilitar SSM</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EC2Manager; 
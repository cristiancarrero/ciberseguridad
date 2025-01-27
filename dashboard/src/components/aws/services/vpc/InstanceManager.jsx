import React, { useState, useEffect } from 'react';
import { 
  FaServer, 
  FaExchangeAlt, 
  FaPlus, 
  FaTrash,
  FaNetworkWired,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import { 
  getVPCInstances,
  moveInstanceToSubnet,
  terminateVPCInstance
} from './vpcInstanceService';

const InstanceManager = ({ vpcs, subnets, onUpdate }) => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVpc, setSelectedVpc] = useState('all');
  const [showMoveDialog, setShowMoveDialog] = useState(null);
  const [targetSubnet, setTargetSubnet] = useState('');

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const instanceList = await getVPCInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Error al cargar instancias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveInstance = async (instanceId) => {
    if (!targetSubnet) return;
    try {
      await moveInstanceToSubnet(instanceId, targetSubnet);
      setShowMoveDialog(null);
      setTargetSubnet('');
      await loadInstances();
      onUpdate();
    } catch (error) {
      console.error('Error al mover instancia:', error);
    }
  };

  const handleTerminateInstance = async (instanceId) => {
    if (!window.confirm('¿Estás seguro de que deseas terminar esta instancia?')) return;
    try {
      await terminateVPCInstance(instanceId);
      await loadInstances();
      onUpdate();
    } catch (error) {
      console.error('Error al terminar instancia:', error);
    }
  };

  const filteredInstances = selectedVpc === 'all' 
    ? instances 
    : instances.filter(instance => {
        const subnet = subnets.find(s => s.SubnetId === instance.SubnetId);
        return subnet?.VpcId === selectedVpc;
      });

  const renderMoveDialog = (instance) => (
    <div className="move-dialog">
      <h4>Mover Instancia</h4>
      <div className="form-group">
        <label>Subnet Destino</label>
        <select
          value={targetSubnet}
          onChange={(e) => setTargetSubnet(e.target.value)}
          required
        >
          <option value="">Seleccionar subnet</option>
          {subnets
            .filter(subnet => subnet.VpcId === selectedVpc)
            .map(subnet => (
              <option key={subnet.SubnetId} value={subnet.SubnetId}>
                {subnet.Tags?.find(tag => tag.Key === 'Name')?.Value || subnet.SubnetId}
                {' - '}{subnet.CidrBlock}
              </option>
            ))}
        </select>
      </div>
      <div className="dialog-actions">
        <button
          className="action-button save-button"
          onClick={() => handleMoveInstance(instance.InstanceId)}
        >
          Mover
        </button>
        <button
          className="action-button cancel-button"
          onClick={() => setShowMoveDialog(null)}
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="instances-container">
      <div className="instances-filter">
        <label>Filtrar por VPC:</label>
        <select 
          value={selectedVpc} 
          onChange={(e) => setSelectedVpc(e.target.value)}
        >
          <option value="all">Todas las VPCs</option>
          {vpcs.map(vpc => (
            <option key={vpc.VpcId} value={vpc.VpcId}>
              {vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc.VpcId}
            </option>
          ))}
        </select>
      </div>

      <div className="instance-list">
        {filteredInstances.map(instance => (
          <div key={instance.InstanceId} className="instance-card">
            <div className="instance-header">
              <div className="instance-name">
                <FaServer />
                {instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre'}
              </div>
              <span className={`instance-status ${instance.State.Name}`}>
                {instance.State.Name}
              </span>
            </div>

            <div className="instance-content">
              <div className="instance-details">
                <div className="instance-detail-item">
                  <span className="detail-label">Instance ID</span>
                  <span className="detail-value">{instance.InstanceId}</span>
                </div>
                <div className="instance-detail-item">
                  <span className="detail-label">Tipo</span>
                  <span className="detail-value">{instance.InstanceType}</span>
                </div>
                <div className="instance-detail-item">
                  <span className="detail-label">VPC</span>
                  <span className="detail-value">{instance.VpcId}</span>
                </div>
                <div className="instance-detail-item">
                  <span className="detail-label">Subnet</span>
                  <span className="detail-value">{instance.SubnetId}</span>
                </div>
                <div className="instance-detail-item">
                  <span className="detail-label">IP Privada</span>
                  <span className="detail-value">{instance.PrivateIpAddress}</span>
                </div>
                {instance.PublicIpAddress && (
                  <div className="instance-detail-item">
                    <span className="detail-label">IP Pública</span>
                    <span className="detail-value">{instance.PublicIpAddress}</span>
                  </div>
                )}
              </div>

              <div className="instance-actions">
                {instance.State.Name === 'stopped' && (
                  <button 
                    className="instance-action-button start"
                    onClick={() => handleStartInstance(instance.InstanceId)}
                  >
                    <FaPlay /> Iniciar
                  </button>
                )}
                {instance.State.Name === 'running' && (
                  <button 
                    className="instance-action-button stop"
                    onClick={() => handleStopInstance(instance.InstanceId)}
                  >
                    <FaStop /> Detener
                  </button>
                )}
                <button 
                  className="instance-action-button terminate"
                  onClick={() => handleTerminateInstance(instance.InstanceId)}
                >
                  <FaTrash /> Terminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstanceManager; 
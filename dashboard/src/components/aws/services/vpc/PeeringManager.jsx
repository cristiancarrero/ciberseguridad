import React, { useState } from 'react';
import { 
  FaNetworkWired, 
  FaPlus, 
  FaTrash,
  FaCheck,
  FaTimes 
} from 'react-icons/fa';
import { 
  createVPCPeering, 
  acceptVPCPeering, 
  deleteVPCPeering, 
  getVPCPeerings 
} from './vpcService';

const PeeringManager = ({ vpcs, peeringConnections, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    requesterVpcId: '',
    accepterVpcId: ''
  });

  const handleCreatePeering = async (e) => {
    e.preventDefault();
    try {
      await createVPCPeering(formData.requesterVpcId, formData.accepterVpcId);
      setShowCreateForm(false);
      setFormData({ requesterVpcId: '', accepterVpcId: '' });
      onUpdate();
    } catch (error) {
      console.error('Error al crear VPC Peering:', error);
    }
  };

  const handleAcceptPeering = async (peeringConnectionId) => {
    try {
      await acceptVPCPeering(peeringConnectionId);
      onUpdate();
    } catch (error) {
      console.error('Error al aceptar VPC Peering:', error);
    }
  };

  const handleDeletePeering = async (peeringConnectionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta conexión de peering?')) return;
    try {
      await deleteVPCPeering(peeringConnectionId);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar VPC Peering:', error);
    }
  };

  const renderCreateForm = () => (
    <form onSubmit={handleCreatePeering} className="create-vpc-form">
      <div className="form-group">
        <label>VPC Solicitante</label>
        <select
          value={formData.requesterVpcId}
          onChange={(e) => setFormData({...formData, requesterVpcId: e.target.value})}
          required
        >
          <option value="">Seleccionar VPC</option>
          {vpcs.map(vpc => (
            <option key={vpc.VpcId} value={vpc.VpcId}>
              {vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc.VpcId}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>VPC Aceptante</label>
        <select
          value={formData.accepterVpcId}
          onChange={(e) => setFormData({...formData, accepterVpcId: e.target.value})}
          required
        >
          <option value="">Seleccionar VPC</option>
          {vpcs.filter(vpc => vpc.VpcId !== formData.requesterVpcId).map(vpc => (
            <option key={vpc.VpcId} value={vpc.VpcId}>
              {vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc.VpcId}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="action-button create-button">
          <FaPlus /> Crear Peering
        </button>
        <button 
          type="button" 
          className="action-button cancel-button"
          onClick={() => setShowCreateForm(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <div className="peering-manager">
      <div className="section-header">
        <h3>VPC Peering Connections</h3>
        <button
          className="action-button create-button"
          onClick={() => setShowCreateForm(true)}
        >
          <FaPlus /> Nueva Conexión
        </button>
      </div>

      {showCreateForm && renderCreateForm()}

      <div className="peering-list">
        {peeringConnections?.map(peering => {
          const requesterVpc = vpcs.find(vpc => vpc.VpcId === peering.RequesterVpcInfo.VpcId);
          const accepterVpc = vpcs.find(vpc => vpc.VpcId === peering.AccepterVpcInfo.VpcId);
          
          return (
            <div key={peering.VpcPeeringConnectionId} className="peering-item">
              <div className="peering-header">
                <h4>Peering ID: {peering.VpcPeeringConnectionId}</h4>
                <span className={`peering-status ${peering.Status.Code.toLowerCase()}`}>
                  {peering.Status.Code}
                </span>
              </div>
              
              <div className="peering-details">
                <div className="vpc-info">
                  <h5>VPC Solicitante</h5>
                  <p>{requesterVpc?.Tags?.find(tag => tag.Key === 'Name')?.Value || requesterVpc?.VpcId}</p>
                  <p>CIDR: {peering.RequesterVpcInfo.CidrBlock}</p>
                </div>
                <FaNetworkWired className="peering-icon" />
                <div className="vpc-info">
                  <h5>VPC Aceptante</h5>
                  <p>{accepterVpc?.Tags?.find(tag => tag.Key === 'Name')?.Value || accepterVpc?.VpcId}</p>
                  <p>CIDR: {peering.AccepterVpcInfo.CidrBlock}</p>
                </div>
              </div>

              <div className="peering-actions">
                {peering.Status.Code === 'pending-acceptance' && (
                  <button
                    className="action-button accept-button"
                    onClick={() => handleAcceptPeering(peering.VpcPeeringConnectionId)}
                  >
                    <FaCheck /> Aceptar
                  </button>
                )}
                <button
                  className="action-button delete-button"
                  onClick={() => handleDeletePeering(peering.VpcPeeringConnectionId)}
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeeringManager; 
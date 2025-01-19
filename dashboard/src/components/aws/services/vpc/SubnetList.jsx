import React, { useState } from 'react';
import { FaPlus, FaTrash, FaNetworkWired } from 'react-icons/fa';
import { createSubnet, deleteSubnet } from './vpcService';

const SubnetList = ({ subnets, vpcs, onUpdate, isLoading }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vpcId: '',
    cidrBlock: '',
    availabilityZone: ''
  });

  const handleCreateSubnet = async (e) => {
    e.preventDefault();
    try {
      await createSubnet(formData);
      setShowCreateForm(false);
      setFormData({ name: '', vpcId: '', cidrBlock: '', availabilityZone: '' });
      onUpdate();
    } catch (error) {
      console.error('Error creating subnet:', error);
    }
  };

  const handleDeleteSubnet = async (subnetId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta subnet?')) return;
    try {
      await deleteSubnet(subnetId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting subnet:', error);
    }
  };

  const renderCreateForm = () => (
    <form onSubmit={handleCreateSubnet} className="create-vpc-form">
      <div className="form-group">
        <label>VPC</label>
        <select
          value={formData.vpcId}
          onChange={(e) => setFormData({...formData, vpcId: e.target.value})}
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
        <label>Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Mi Subnet"
          required
        />
      </div>
      <div className="form-group">
        <label>CIDR Block</label>
        <input
          type="text"
          value={formData.cidrBlock}
          onChange={(e) => setFormData({...formData, cidrBlock: e.target.value})}
          pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$"
          placeholder="10.0.1.0/24"
          required
        />
      </div>
      <div className="form-group">
        <label>Zona de Disponibilidad</label>
        <select
          value={formData.availabilityZone}
          onChange={(e) => setFormData({...formData, availabilityZone: e.target.value})}
          required
        >
          <option value="">Seleccionar zona</option>
          <option value="us-west-2a">us-west-2a</option>
          <option value="us-west-2b">us-west-2b</option>
          <option value="us-west-2c">us-west-2c</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="action-button create-button">
          <FaPlus /> Crear Subnet
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
    <div>
      <div className="vpc-controls">
        {!showCreateForm ? (
          <button 
            className="action-button create-button"
            onClick={() => setShowCreateForm(true)}
          >
            <FaPlus /> Nueva Subnet
          </button>
        ) : renderCreateForm()}
      </div>

      <div className="vpc-list">
        {subnets.length === 0 ? (
          <div className="no-vpcs">
            <FaNetworkWired className="no-vpcs-icon" />
            <p>No hay Subnets configuradas</p>
          </div>
        ) : (
          subnets.map(subnet => {
            const vpc = vpcs.find(vpc => vpc.VpcId === subnet.VpcId);
            return (
              <div key={subnet.SubnetId} className="vpc-item">
                <div className="vpc-header">
                  <h3 className="vpc-title">
                    {subnet.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre'}
                  </h3>
                  <span className={`vpc-status ${subnet.State.toLowerCase()}`}>
                    {subnet.State}
                  </span>
                </div>
                <div className="vpc-details">
                  <div className="detail-item">
                    <span className="detail-label">Subnet ID</span>
                    <span className="detail-value">{subnet.SubnetId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">VPC</span>
                    <span className="detail-value">
                      {vpc?.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc?.VpcId || 'Desconocido'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">CIDR Block</span>
                    <span className="detail-value">{subnet.CidrBlock}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Zona de Disponibilidad</span>
                    <span className="detail-value">{subnet.AvailabilityZone}</span>
                  </div>
                </div>
                <div className="vpc-actions">
                  <button 
                    className="action-button delete-button"
                    onClick={() => handleDeleteSubnet(subnet.SubnetId)}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubnetList; 
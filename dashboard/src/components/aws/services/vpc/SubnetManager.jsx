import React, { useState } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaNetworkWired,
  FaServer,
  FaGlobe
} from 'react-icons/fa';

const SubnetManager = ({ subnets, vpcs, availabilityZones, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vpcId: '',
    cidrBlock: '',
    availabilityZone: '',
    mapPublicIpOnLaunch: false,
    tags: []
  });

  const handleCreateSubnet = async (e) => {
    e.preventDefault();
    try {
      await createSubnet(formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        vpcId: '',
        cidrBlock: '',
        availabilityZone: '',
        mapPublicIpOnLaunch: false,
        tags: []
      });
      onUpdate();
    } catch (error) {
      console.error('Error al crear subnet:', error);
    }
  };

  const handleDeleteSubnet = async (subnetId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta subnet?')) return;
    try {
      await deleteSubnet(subnetId);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar subnet:', error);
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
          {availabilityZones.map(az => (
            <option key={az.ZoneName} value={az.ZoneName}>
              {az.ZoneName} ({az.ZoneId})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.mapPublicIpOnLaunch}
            onChange={(e) => setFormData({...formData, mapPublicIpOnLaunch: e.target.checked})}
          />
          Auto-asignar IP pública
        </label>
      </div>
      <div className="form-group">
        <label>Tags</label>
        <div className="tags-container">
          {formData.tags.map((tag, index) => (
            <div key={index} className="tag-item">
              <input
                type="text"
                value={tag.Key}
                onChange={(e) => {
                  const newTags = [...formData.tags];
                  newTags[index].Key = e.target.value;
                  setFormData({...formData, tags: newTags});
                }}
                placeholder="Clave"
              />
              <input
                type="text"
                value={tag.Value}
                onChange={(e) => {
                  const newTags = [...formData.tags];
                  newTags[index].Value = e.target.value;
                  setFormData({...formData, tags: newTags});
                }}
                placeholder="Valor"
              />
              <button
                type="button"
                onClick={() => {
                  const newTags = formData.tags.filter((_, i) => i !== index);
                  setFormData({...formData, tags: newTags});
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              tags: [...formData.tags, { Key: '', Value: '' }]
            })}
            className="add-tag-button"
          >
            <FaPlus /> Añadir Tag
          </button>
        </div>
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

  const renderSubnetList = () => (
    <div className="vpc-list">
      {subnets.length === 0 ? (
        <div className="no-vpcs">
          <FaNetworkWired className="no-vpcs-icon" />
          <p>No hay Subnets configuradas</p>
          <button 
            className="action-button create-button"
            onClick={() => setShowCreateForm(true)}
          >
            <FaPlus /> Crear primera Subnet
          </button>
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
                <div className="vpc-status-actions">
                  <span className={`vpc-status ${subnet.State.toLowerCase()}`}>
                    {subnet.State}
                  </span>
                  <div className="vpc-actions">
                    <button 
                      className="action-button edit-button"
                      onClick={() => {/* TODO: Implementar edición */}}
                      title="Editar configuración"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteSubnet(subnet.SubnetId)}
                      title="Eliminar Subnet"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              <div className="vpc-details">
                <div className="detail-item">
                  <span className="detail-label">Subnet ID</span>
                  <span className="detail-value">{subnet.SubnetId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">VPC</span>
                  <span className="detail-value">
                    {vpc?.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc?.VpcId}
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
                <div className="detail-item">
                  <span className="detail-label">IP Pública Automática</span>
                  <span className="detail-value">
                    {subnet.MapPublicIpOnLaunch ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">IPs Disponibles</span>
                  <span className="detail-value">{subnet.AvailableIpAddressCount}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="vpc-manager-content">
      <div className="vpc-controls">
        {!showCreateForm && (
          <button 
            className="action-button create-button"
            onClick={() => setShowCreateForm(true)}
          >
            <FaPlus /> Nueva Subnet
          </button>
        )}
      </div>

      {showCreateForm && renderCreateForm()}
      {renderSubnetList()}
    </div>
  );
};

export default SubnetManager; 
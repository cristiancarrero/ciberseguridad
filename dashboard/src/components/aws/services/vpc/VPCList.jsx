import React, { useState } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaTags, 
  FaNetworkWired as VPCIcon,
  FaCog,
  FaInfo
} from 'react-icons/fa';
import { 
  updateVPCSettings, 
  updateVPCTags, 
  deleteVPC 
} from './vpcService';

const VPCList = ({ vpcs, onUpdate, onDelete, onCreate, onModify, showCreateButton = true }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cidrBlock: '10.0.0.0/16',
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: []
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedVPC, setSelectedVPC] = useState(null);
  const [settings, setSettings] = useState({
    enableDnsHostnames: false,
    enableDnsSupport: false
  });
  const [tags, setTags] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate(formData);
    setShowCreateForm(false);
    setFormData({
      name: '',
      cidrBlock: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: []
    });
  };

  const handleModify = async (vpc, newData) => {
    await onModify(vpc.VpcId, newData);
    setShowEditForm(null);
  };

  const handleSettingsClick = (vpc) => {
    setSelectedVPC(vpc);
    setSettings({
      enableDnsHostnames: vpc.EnableDnsHostnames,
      enableDnsSupport: vpc.EnableDnsSupport
    });
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateVPCSettings(selectedVPC.VpcId, settings);
      setShowSettingsModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error al guardar ajustes:', error);
    }
  };

  const handleTagsClick = (vpc) => {
    setSelectedVPC(vpc);
    setTags(vpc.Tags || []);
    setShowTagsModal(true);
  };

  const handleSaveTags = async () => {
    try {
      await updateVPCTags(selectedVPC.VpcId, tags);
      setShowTagsModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error al guardar tags:', error);
    }
  };

  const handleDeleteClick = async (vpc) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta VPC? Esta acción no se puede deshacer.')) {
      try {
        await deleteVPC(vpc.VpcId);
        onUpdate();
      } catch (error) {
        console.error('Error al eliminar VPC:', error);
      }
    }
  };

  const renderCreateForm = () => (
    <form onSubmit={handleSubmit} className="create-vpc-form">
      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Mi VPC"
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
          placeholder="10.0.0.0/16"
          required
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.enableDnsHostnames}
            onChange={(e) => setFormData({...formData, enableDnsHostnames: e.target.checked})}
          />
          Habilitar DNS Hostnames
        </label>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.enableDnsSupport}
            onChange={(e) => setFormData({...formData, enableDnsSupport: e.target.checked})}
          />
          Habilitar DNS Support
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
          <FaPlus /> Crear VPC
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

  const renderVPCDetails = (vpc) => (
    <>
      <div className="vpc-details-section">
        <h4><FaInfo /> Información Básica</h4>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">VPC ID</span>
            <span className="detail-value">{vpc.VpcId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CIDR Block</span>
            <span className="detail-value">{vpc.CidrBlock}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado</span>
            <span className={`status-value ${vpc.State.toLowerCase()}`}>
              {vpc.State}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">DNS Hostnames</span>
            <span className={`status-value ${vpc.EnableDnsHostnames ? 'available' : 'disabled'}`}>
              {vpc.EnableDnsHostnames ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">DNS Support</span>
            <span className={`status-value ${vpc.EnableDnsSupport ? 'available' : 'disabled'}`}>
              {vpc.EnableDnsSupport ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        </div>
      </div>

      <div className="tags-section">
        <h4><FaTags /> Tags</h4>
        <div className="tags-container">
          <div className="tags-list">
            {vpc.Tags?.length > 0 ? (
              vpc.Tags.map((tag, index) => (
                <div key={index} className="tag-badge">
                  <span className="tag-key">{tag.Key}</span>
                  <span className="tag-value">{tag.Value}</span>
                </div>
              ))
            ) : (
              <p className="no-tags">No hay tags configurados</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="vpc-manager-content">
      {showCreateButton && (
        <div className="vpc-controls">
          {!showCreateForm && (
            <button 
              className="action-button create-button"
              onClick={() => setShowCreateForm(true)}
            >
              <FaPlus /> Nueva VPC
            </button>
          )}
        </div>
      )}

      {showCreateForm && renderCreateForm()}

      <div className="vpc-list">
        {vpcs.length === 0 ? (
          <div className="no-vpcs">
            <VPCIcon className="no-vpcs-icon" />
            <p>No hay VPCs configuradas</p>
            <button 
              className="action-button create-button"
              onClick={() => setShowCreateForm(true)}
            >
              <FaPlus /> Crear primera VPC
            </button>
          </div>
        ) : (
          vpcs.map(vpc => (
            <div key={vpc.VpcId} className="vpc-item">
              <div className="vpc-header">
                <div className="vpc-title-container">
                  <h3 className="vpc-title">
                    {vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre'}
                  </h3>
                  <span className={`vpc-status ${vpc.State.toLowerCase()}`}>
                    {vpc.State}
                  </span>
                </div>
                <div className="vpc-actions">
                  <button
                    className="action-button edit-button"
                    onClick={() => handleSettingsClick(vpc)}
                    title="Ajustes de VPC"
                  >
                    <FaCog />
                  </button>
                  <button
                    className="action-button tag-button"
                    onClick={() => handleTagsClick(vpc)}
                    title="Gestionar tags"
                  >
                    <FaTags />
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteClick(vpc)}
                    title="Eliminar VPC"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              {renderVPCDetails(vpc)}
            </div>
          ))
        )}
      </div>

      {showSettingsModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Ajustes de VPC</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableDnsHostnames}
                  onChange={(e) => setSettings({
                    ...settings,
                    enableDnsHostnames: e.target.checked
                  })}
                />
                Habilitar DNS Hostnames
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableDnsSupport}
                  onChange={(e) => setSettings({
                    ...settings,
                    enableDnsSupport: e.target.checked
                  })}
                />
                Habilitar DNS Support
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveSettings}>Guardar</button>
              <button onClick={() => setShowSettingsModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showTagsModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Gestionar Tags</h3>
            {tags.map((tag, index) => (
              <div key={index} className="tag-form-group">
                <input
                  type="text"
                  value={tag.key}
                  onChange={(e) => {
                    const newTags = [...tags];
                    newTags[index].key = e.target.value;
                    setTags(newTags);
                  }}
                  placeholder="Key"
                />
                <input
                  type="text"
                  value={tag.value}
                  onChange={(e) => {
                    const newTags = [...tags];
                    newTags[index].value = e.target.value;
                    setTags(newTags);
                  }}
                  placeholder="Value"
                />
                <button onClick={() => {
                  const newTags = tags.filter((_, i) => i !== index);
                  setTags(newTags);
                }}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={() => setTags([...tags, { key: '', value: '' }])}>
              Añadir Tag
            </button>
            <div className="modal-actions">
              <button onClick={handleSaveTags}>Guardar</button>
              <button onClick={() => setShowTagsModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VPCList; 
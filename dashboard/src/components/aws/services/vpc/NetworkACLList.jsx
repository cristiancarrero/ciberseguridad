import React, { useState } from 'react';
import { FaPlus, FaTrash, FaShieldAlt, FaEdit } from 'react-icons/fa';
import { createNetworkAcl, deleteNetworkAcl, updateNetworkAclEntry } from './vpcService';

const NetworkACLList = ({ networkAcls, vpcs, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditRules, setShowEditRules] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    vpcId: ''
  });
  const [ruleForm, setRuleForm] = useState({
    ruleNumber: '',
    protocol: '-1',
    ruleAction: 'allow',
    cidrBlock: '0.0.0.0/0',
    egress: false,
    portFrom: '',
    portTo: ''
  });

  const handleCreateACL = async (e) => {
    e.preventDefault();
    try {
      await createNetworkAcl(formData);
      setShowCreateForm(false);
      setFormData({ name: '', vpcId: '' });
      onUpdate();
    } catch (error) {
      console.error('Error creating Network ACL:', error);
    }
  };

  const handleDeleteACL = async (networkAclId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta ACL?')) return;
    try {
      await deleteNetworkAcl(networkAclId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting Network ACL:', error);
    }
  };

  const handleAddRule = async (networkAclId, e) => {
    e.preventDefault();
    try {
      await updateNetworkAclEntry({
        networkAclId,
        ruleNumber: parseInt(ruleForm.ruleNumber),
        protocol: ruleForm.protocol,
        ruleAction: ruleForm.ruleAction,
        cidrBlock: ruleForm.cidrBlock,
        egress: ruleForm.egress,
        ...(ruleForm.portFrom && ruleForm.portTo && {
          portRange: {
            from: parseInt(ruleForm.portFrom),
            to: parseInt(ruleForm.portTo)
          }
        })
      });
      setShowEditRules(null);
      setRuleForm({
        ruleNumber: '',
        protocol: '-1',
        ruleAction: 'allow',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        portFrom: '',
        portTo: ''
      });
      onUpdate();
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const renderCreateForm = () => (
    <form onSubmit={handleCreateACL} className="create-vpc-form">
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
          placeholder="Mi ACL"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="action-button create-button">
          <FaPlus /> Crear ACL
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

  const renderRuleForm = (networkAclId) => (
    <form onSubmit={(e) => handleAddRule(networkAclId, e)} className="rule-form">
      <div className="form-group">
        <label>Número de Regla</label>
        <input
          type="number"
          value={ruleForm.ruleNumber}
          onChange={(e) => setRuleForm({...ruleForm, ruleNumber: e.target.value})}
          min="1"
          max="32766"
          required
        />
      </div>
      <div className="form-group">
        <label>Protocolo</label>
        <select
          value={ruleForm.protocol}
          onChange={(e) => setRuleForm({...ruleForm, protocol: e.target.value})}
        >
          <option value="-1">Todos</option>
          <option value="6">TCP</option>
          <option value="17">UDP</option>
          <option value="1">ICMP</option>
        </select>
      </div>
      <div className="form-group">
        <label>Acción</label>
        <select
          value={ruleForm.ruleAction}
          onChange={(e) => setRuleForm({...ruleForm, ruleAction: e.target.value})}
        >
          <option value="allow">Permitir</option>
          <option value="deny">Denegar</option>
        </select>
      </div>
      <div className="form-group">
        <label>CIDR Block</label>
        <input
          type="text"
          value={ruleForm.cidrBlock}
          onChange={(e) => setRuleForm({...ruleForm, cidrBlock: e.target.value})}
          pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$"
          required
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={ruleForm.egress}
            onChange={(e) => setRuleForm({...ruleForm, egress: e.target.checked})}
          />
          Regla de Salida
        </label>
      </div>
      {(ruleForm.protocol === '6' || ruleForm.protocol === '17') && (
        <>
          <div className="form-group">
            <label>Puerto Desde</label>
            <input
              type="number"
              value={ruleForm.portFrom}
              onChange={(e) => setRuleForm({...ruleForm, portFrom: e.target.value})}
              min="0"
              max="65535"
            />
          </div>
          <div className="form-group">
            <label>Puerto Hasta</label>
            <input
              type="number"
              value={ruleForm.portTo}
              onChange={(e) => setRuleForm({...ruleForm, portTo: e.target.value})}
              min="0"
              max="65535"
            />
          </div>
        </>
      )}
      <div className="form-actions">
        <button type="submit" className="action-button create-button">
          <FaPlus /> Añadir Regla
        </button>
        <button 
          type="button" 
          className="action-button cancel-button"
          onClick={() => setShowEditRules(null)}
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
            <FaPlus /> Nueva ACL
          </button>
        ) : renderCreateForm()}
      </div>

      <div className="vpc-list">
        {networkAcls.length === 0 ? (
          <div className="no-vpcs">
            <FaShieldAlt className="no-vpcs-icon" />
            <p>No hay ACLs configuradas</p>
          </div>
        ) : (
          networkAcls.map(acl => {
            const vpc = vpcs.find(vpc => vpc.VpcId === acl.VpcId);
            return (
              <div key={acl.NetworkAclId} className="vpc-item">
                <div className="vpc-header">
                  <h3 className="vpc-title">
                    {acl.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre'}
                  </h3>
                  <span className="vpc-status">
                    {acl.IsDefault ? 'Default' : 'Custom'}
                  </span>
                </div>
                <div className="vpc-details">
                  <div className="detail-item">
                    <span className="detail-label">ACL ID</span>
                    <span className="detail-value">{acl.NetworkAclId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">VPC</span>
                    <span className="detail-value">
                      {vpc?.Tags?.find(tag => tag.Key === 'Name')?.Value || vpc?.VpcId || 'Desconocido'}
                    </span>
                  </div>
                </div>
                <div className="vpc-actions">
                  <button 
                    className="action-button edit-button"
                    onClick={() => setShowEditRules(acl.NetworkAclId)}
                  >
                    <FaEdit /> Editar Reglas
                  </button>
                  {!acl.IsDefault && (
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteACL(acl.NetworkAclId)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  )}
                </div>
                {showEditRules === acl.NetworkAclId && (
                  <div className="rules-section">
                    <h4>Añadir Nueva Regla</h4>
                    {renderRuleForm(acl.NetworkAclId)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NetworkACLList; 
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaShieldAlt,
  FaArrowRight,
  FaArrowLeft,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';
import { 
  createSecurityGroup,
  deleteSecurityGroup,
  updateSecurityGroupRules,
  getSecurityGroups,
  createNetworkAcl,
  deleteNetworkAcl
} from './vpcService';

const SecurityManager = ({ vpcs, networkAcls, securityGroups, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRulesForm, setShowRulesForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vpcId: '',
    ingressRules: [],
    egressRules: []
  });

  const [aclFormData, setAclFormData] = useState({
    name: '',
    vpcId: '',
    ingressRules: [],
    egressRules: []
  });

  const handleCreateSecurityGroup = async (e) => {
    e.preventDefault();
    try {
      await createSecurityGroup(formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        vpcId: '',
        ingressRules: [],
        egressRules: []
      });
      onUpdate();
    } catch (error) {
      console.error('Error al crear Security Group:', error);
    }
  };

  const handleDeleteSecurityGroup = async (groupId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este Security Group?')) return;
    try {
      await deleteSecurityGroup(groupId);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar Security Group:', error);
    }
  };

  const handleUpdateRules = async (groupId, rules, isIngress) => {
    try {
      await updateSecurityGroupRules(groupId, rules, isIngress);
      setShowRulesForm(null);
      onUpdate();
    } catch (error) {
      console.error('Error al actualizar reglas:', error);
    }
  };

  const handleCreateAcl = async (e) => {
    e.preventDefault();
    try {
      await createNetworkAcl(aclFormData);
      setShowCreateForm(false);
      setAclFormData({
        name: '',
        vpcId: '',
        ingressRules: [],
        egressRules: []
      });
      onUpdate();
    } catch (error) {
      console.error('Error al crear Network ACL:', error);
    }
  };

  const handleDeleteAcl = async (aclId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta ACL?')) return;
    try {
      await deleteNetworkAcl(aclId);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar Network ACL:', error);
    }
  };

  const renderRuleForm = (rules, isIngress, groupId) => (
    <div className="rules-form">
      <h4>{isIngress ? 'Reglas de Entrada' : 'Reglas de Salida'}</h4>
      {rules.map((rule, index) => (
        <div key={index} className="rule-item">
          <select
            value={rule.protocol}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].protocol = e.target.value;
              setFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
          >
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
            <option value="icmp">ICMP</option>
            <option value="-1">Todos</option>
          </select>
          <input
            type="text"
            value={rule.fromPort}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].fromPort = e.target.value;
              setFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
            placeholder="Puerto desde"
          />
          <input
            type="text"
            value={rule.toPort}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].toPort = e.target.value;
              setFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
            placeholder="Puerto hasta"
          />
          <input
            type="text"
            value={rule.cidrIp}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].cidrIp = e.target.value;
              setFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
            placeholder="CIDR IP"
          />
          <button
            type="button"
            className="action-button delete-button"
            onClick={() => {
              const newRules = rules.filter((_, i) => i !== index);
              setFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
          >
            <FaTrash />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="action-button add-rule-button"
        onClick={() => {
          const newRule = {
            protocol: 'tcp',
            fromPort: '',
            toPort: '',
            cidrIp: '0.0.0.0/0'
          };
          setFormData(prev => ({
            ...prev,
            [isIngress ? 'ingressRules' : 'egressRules']: [...rules, newRule]
          }));
        }}
      >
        <FaPlus /> Añadir Regla
      </button>
      <div className="form-actions">
        <button
          type="button"
          className="action-button save-button"
          onClick={() => handleUpdateRules(groupId, rules, isIngress)}
        >
          Guardar Cambios
        </button>
        <button
          type="button"
          className="action-button cancel-button"
          onClick={() => setShowRulesForm(null)}
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  const renderAclRuleForm = (rules, isIngress, aclId) => (
    <div className="rules-form">
      <h4>{isIngress ? 'Reglas de Entrada' : 'Reglas de Salida'}</h4>
      {rules.map((rule, index) => (
        <div key={index} className="rule-item">
          <input
            type="number"
            value={rule.RuleNumber}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].RuleNumber = parseInt(e.target.value);
              setAclFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
            placeholder="Número de regla"
            min="1"
            max="32766"
          />
          <select
            value={rule.Protocol}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].Protocol = e.target.value;
              setAclFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
          >
            <option value="-1">Todos</option>
            <option value="6">TCP</option>
            <option value="17">UDP</option>
            <option value="1">ICMP</option>
          </select>
          <select
            value={rule.RuleAction}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].RuleAction = e.target.value;
              setAclFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
          >
            <option value="allow">Permitir</option>
            <option value="deny">Denegar</option>
          </select>
          <input
            type="text"
            value={rule.CidrBlock}
            onChange={(e) => {
              const newRules = [...rules];
              newRules[index].CidrBlock = e.target.value;
              setAclFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
            placeholder="CIDR IP"
          />
          <button
            type="button"
            className="action-button delete-button"
            onClick={() => {
              const newRules = rules.filter((_, i) => i !== index);
              setAclFormData(prev => ({
                ...prev,
                [isIngress ? 'ingressRules' : 'egressRules']: newRules
              }));
            }}
          >
            <FaTrash />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="action-button add-rule-button"
        onClick={() => {
          const newRule = {
            RuleNumber: rules.length + 100,
            Protocol: '-1',
            RuleAction: 'allow',
            CidrBlock: '0.0.0.0/0'
          };
          setAclFormData(prev => ({
            ...prev,
            [isIngress ? 'ingressRules' : 'egressRules']: [...rules, newRule]
          }));
        }}
      >
        <FaPlus /> Añadir Regla
      </button>
    </div>
  );

  return (
    <div className="security-container">
      <div className="security-tabs">
        <button 
          className={`security-tab-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Security Groups
        </button>
        <button 
          className={`security-tab-button ${activeTab === 'acls' ? 'active' : ''}`}
          onClick={() => setActiveTab('acls')}
        >
          Network ACLs
        </button>
      </div>

      <div className="security-group-list">
        {securityGroups.map(group => (
          <div key={group.GroupId} className="security-group-item">
            <div className="security-group-header">
              <div className="security-group-title">
                <FaShieldAlt />
                {group.GroupName}
                <span className="security-group-id">{group.GroupId}</span>
              </div>
              <div className="security-actions">
                <button className="add-rule-button">
                  <FaPlus /> Añadir Regla
                </button>
              </div>
            </div>

            <div className="security-rules">
              <div className="rules-section">
                <div className="rules-header">
                  <h4 className="rules-title">
                    <FaArrowDown /> Reglas de Entrada
                  </h4>
                </div>
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Protocolo</th>
                      <th>Puerto</th>
                      <th>Origen</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.IpPermissions.map((rule, index) => (
                      <tr key={index}>
                        <td>
                          <span className="rule-type">
                            {rule.IpProtocol === '-1' ? 'Todo el tráfico' : 
                             rule.FromPort === rule.ToPort ? `Puerto ${rule.FromPort}` : 
                             `Puertos ${rule.FromPort}-${rule.ToPort}`}
                          </span>
                        </td>
                        <td>
                          <span className="rule-protocol">
                            {rule.IpProtocol === '-1' ? 'Todos' : 
                             rule.IpProtocol.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="rule-port">
                            {rule.IpProtocol === '-1' ? 'Todos' :
                             rule.FromPort === rule.ToPort ? rule.FromPort : 
                             `${rule.FromPort}-${rule.ToPort}`}
                          </span>
                        </td>
                        <td>
                          <span className="rule-source">
                            {rule.IpRanges && rule.IpRanges.length > 0 ? 
                             rule.IpRanges.map(range => range.CidrIp).join(', ') : 
                             '0.0.0.0/0'}
                          </span>
                        </td>
                        <td>
                          <span className="rule-description">
                            {rule.IpRanges && rule.IpRanges[0]?.Description || 'Sin descripción'}
                          </span>
                        </td>
                        <td>
                          <div className="rule-actions">
                            <button className="rule-action-button edit" title="Editar regla">
                              <FaEdit />
                            </button>
                            <button className="rule-action-button delete" title="Eliminar regla">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rules-section">
                <div className="rules-header">
                  <h4 className="rules-title">
                    <FaArrowUp /> Reglas de Salida
                  </h4>
                </div>
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Protocolo</th>
                      <th>Puerto</th>
                      <th>Destino</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Reglas de salida */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityManager; 
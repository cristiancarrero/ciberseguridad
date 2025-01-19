import React, { useState, useEffect } from 'react';
import { 
  FaNetworkWired, 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaSpinner,
  FaExclamationTriangle,
  FaNetworkWired as VPCIcon,
  FaSubway as SubnetIcon,
  FaShieldAlt as ACLIcon,
  FaServer as EC2Icon,
  FaGlobe as InternetIcon,
  FaExchangeAlt as PeeringIcon,
  FaRoute as RouteIcon
} from 'react-icons/fa';
import { getVPCs, createVPC, deleteVPC, getSubnets, getNetworkAcls, modifyVPC, getAvailabilityZones, getSecurityGroups, getVPCInstances, getInternetGateways, getNatGateways, getRouteTables, getVPCPeerings } from './vpcService';
import VPCList from './VPCList';
import SubnetManager from './SubnetManager';
import NetworkACLList from './NetworkACLList';
import SecurityManager from './SecurityManager';
import InstanceManager from './InstanceManager';
import ConnectivityManager from './ConnectivityManager';
import LoadingSpinner from '../../../common/LoadingSpinner';
import './vpc-manager.css';
import PeeringManager from './PeeringManager';

const VPCManager = ({ isOpen, onClose }) => {
  // Estados
  const [activeTab, setActiveTab] = useState('vpcs');
  const [vpcs, setVpcs] = useState([]);
  const [subnets, setSubnets] = useState([]);
  const [networkAcls, setNetworkAcls] = useState([]);
  const [securityGroups, setSecurityGroups] = useState([]);
  const [instances, setInstances] = useState([]);
  const [internetGateways, setInternetGateways] = useState([]);
  const [natGateways, setNatGateways] = useState([]);
  const [routeTables, setRouteTables] = useState([]);
  const [availabilityZones, setAvailabilityZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cidrBlock: '10.0.0.0/16',
    enableDnsHostnames: true,
    enableDnsSupport: true
  });
  const [peeringConnections, setPeeringConnections] = useState([]);

  // Cargar datos
  useEffect(() => {
    if (isOpen) {
      setIsInitialLoading(true);
      loadData();
    }
  }, [isOpen]);

  // Efecto separado para cargar datos adicionales al cambiar de pestaña
  useEffect(() => {
    if (isOpen && !isInitialLoading) {
      loadTabData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setError(null);
    try {
      // Siempre cargar VPCs ya que se necesitan para Subnets y ACLs
      const vpcList = await getVPCs();
      setVpcs(vpcList);

      // Cargar datos específicos según la pestaña activa
      await loadTabData();
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      switch (activeTab) {
        case 'subnets':
          const subnetList = await getSubnets();
          setSubnets(subnetList);
          const azList = await getAvailabilityZones();
          setAvailabilityZones(azList);
          break;
        case 'security':
          const aclList = await getNetworkAcls();
          setNetworkAcls(aclList);
          const sgList = await getSecurityGroups();
          setSecurityGroups(sgList);
          break;
        case 'instances':
          const instanceList = await getVPCInstances();
          setInstances(instanceList);
          break;
        case 'connectivity':
          const igwList = await getInternetGateways();
          setInternetGateways(igwList);
          const natList = await getNatGateways();
          setNatGateways(natList);
          const routeList = await getRouteTables();
          setRouteTables(routeList);
          break;
        case 'peering':
          const peeringList = await getVPCPeerings();
          setPeeringConnections(peeringList);
          break;
      }
    } catch (err) {
      console.error(`Error cargando ${activeTab}:`, err);
      setError(`Error al cargar ${activeTab}: ${err.message}`);
    }
  };

  // Renderizado condicional del contenido según la pestaña activa
  const renderContent = () => {
    if (isInitialLoading) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'vpcs':
        return (
          <>
            <div className="vpc-controls">
              {!showCreateForm && (
                <button 
                  className="action-button create-button"
                  onClick={() => setShowCreateForm(true)}
                >
                  <FaPlus /> Nueva VPC
                </button>
              )}
              {showCreateForm && renderCreateVPCForm()}
            </div>
            <VPCList 
              vpcs={vpcs}
              onUpdate={loadData}
              onDelete={handleDeleteVPC}
              onCreate={handleCreateVPC}
              onModify={handleModifyVPC}
              showCreateButton={false}
            />
          </>
        );
      case 'subnets':
        return <SubnetManager 
          subnets={subnets}
          vpcs={vpcs}
          onUpdate={loadTabData}
          availabilityZones={availabilityZones}
        />;
      case 'security':
        return <SecurityManager 
          vpcs={vpcs}
          networkAcls={networkAcls}
          securityGroups={securityGroups}
          onUpdate={loadTabData}
        />;
      case 'instances':
        return <InstanceManager 
          vpcs={vpcs}
          subnets={subnets}
          instances={instances}
          onUpdate={loadTabData}
        />;
      case 'connectivity':
        return <ConnectivityManager 
          vpcs={vpcs}
          internetGateways={internetGateways}
          natGateways={natGateways}
          routeTables={routeTables}
          onUpdate={loadTabData}
        />;
      case 'peering':
        return <PeeringManager 
          vpcs={vpcs}
          peeringConnections={peeringConnections}
          onUpdate={loadTabData}
        />;
      default:
        return null;
    }
  };

  // Manejadores de eventos
  const handleModifyVPC = async (vpcId, newData) => {
    setIsLoading(true);
    setError(null);
    try {
      await modifyVPC(vpcId, newData);
      await loadData();
    } catch (err) {
      setError(`Error al modificar VPC: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVPC = async () => {
    try {
      setIsLoading(true);
      const vpcConfig = {
        name: formData.name || 'Nueva VPC',
        cidrBlock: formData.cidrBlock || '172.31.0.0/16'
      };
      
      // Validar que tenemos un nombre
      if (!formData.name.trim()) {
        throw new Error('El nombre de la VPC es requerido');
      }
      
      // Crear la VPC
      await createVPC(vpcConfig);
      
      // Recargar la lista de VPCs
      await loadData();
      
      // Limpiar el formulario pero mantener el modal abierto
      setShowCreateForm(false);
      setFormData({
        name: '',
        cidrBlock: '10.0.0.0/16',
        enableDnsHostnames: true,
        enableDnsSupport: true
      });
    } catch (error) {
      console.error('Error al crear VPC:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVPC = async (vpcId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta VPC?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await deleteVPC(vpcId);
      await loadData();
    } catch (err) {
      setError(`Error al eliminar VPC: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Componentes de renderizado
  const renderTabs = () => (
    <div className="vpc-tabs">
      <button 
        className={`tab-button ${activeTab === 'vpcs' ? 'active' : ''}`}
        onClick={() => setActiveTab('vpcs')}
      >
        <VPCIcon /> VPCs
      </button>
      <button 
        className={`tab-button ${activeTab === 'subnets' ? 'active' : ''}`}
        onClick={() => setActiveTab('subnets')}
      >
        <SubnetIcon /> Subnets
      </button>
      <button 
        className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
        onClick={() => setActiveTab('security')}
      >
        <ACLIcon /> Seguridad
      </button>
      <button 
        className={`tab-button ${activeTab === 'instances' ? 'active' : ''}`}
        onClick={() => setActiveTab('instances')}
      >
        <EC2Icon /> Instancias
      </button>
      <button 
        className={`tab-button ${activeTab === 'connectivity' ? 'active' : ''}`}
        onClick={() => setActiveTab('connectivity')}
      >
        <InternetIcon /> Conectividad
      </button>
      <button 
        className={`tab-button ${activeTab === 'peering' ? 'active' : ''}`}
        onClick={() => setActiveTab('peering')}
      >
        <PeeringIcon /> VPC Peering
      </button>
    </div>
  );

  const renderCreateVPCForm = () => {
    return (
      <div className="vpc-form">
        <h3>Crear Nueva VPC</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nombre de la VPC"
            required
          />
        </div>
        <div className="form-group">
          <label>CIDR Block</label>
          <input
            type="text"
            value={formData.cidrBlock}
            onChange={(e) => setFormData({...formData, cidrBlock: e.target.value})}
            placeholder="10.0.0.0/16"
          />
        </div>
        <div className="form-actions">
          <button 
            className="action-button cancel-button"
            onClick={() => setShowCreateForm(false)}
          >
            Cancelar
          </button>
          <button 
            className="action-button create-button"
            onClick={handleCreateVPC}
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear VPC'}
          </button>
        </div>
      </div>
    );
  };

  const renderVPCList = () => (
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
              <h3 className="vpc-title">
                {vpc.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre'}
              </h3>
              <span className={`vpc-status ${vpc.State.toLowerCase()}`}>
                {vpc.State}
              </span>
            </div>
            <div className="vpc-details">
              <div className="detail-item">
                <span className="detail-label">VPC ID</span>
                <span className="detail-value">{vpc.VpcId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CIDR Block</span>
                <span className="detail-value">{vpc.CidrBlock}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">DNS Hostnames</span>
                <span className="detail-value">
                  {vpc.EnableDnsHostnames ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">DNS Support</span>
                <span className="detail-value">
                  {vpc.EnableDnsSupport ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
            </div>
            <div className="vpc-actions">
              <button 
                className="action-button delete-button"
                onClick={() => handleDeleteVPC(vpc.VpcId)}
              >
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="vpc-manager-modal">
        <div className="modal-header">
          <h2><FaNetworkWired /> Gestor de VPC</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="vpc-tabs">
          {renderTabs()}
        </div>

        <div className="modal-content">
          <div className="content-container">
            {error && (
              <div className="error-message">
                <FaExclamationTriangle className="error-icon" />
                {error}
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VPCManager; 
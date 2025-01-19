import React, { useState } from 'react';
import { 
  FaGlobe, 
  FaNetworkWired, 
  FaRoute, 
  FaPlus, 
  FaTrash,
  FaEdit 
} from 'react-icons/fa';
import { 
  createInternetGateway,
  attachInternetGateway,
  detachInternetGateway,
  deleteInternetGateway,
  createNatGateway,
  deleteNatGateway,
  createRouteTable,
  deleteRouteTable,
  createRoute,
  associateRouteTable
} from './vpcService';

const ConnectivityManager = ({ vpcs, internetGateways, natGateways, routeTables, subnets, onUpdate }) => {
  const [activeSection, setActiveSection] = useState('igw');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVpc, setSelectedVpc] = useState('');
  const [selectedSubnet, setSelectedSubnet] = useState('');

  const handleCreateIGW = async () => {
    try {
      const igw = await createInternetGateway();
      if (selectedVpc) {
        await attachInternetGateway(igw.InternetGatewayId, selectedVpc);
      }
      setShowCreateForm(false);
      setSelectedVpc('');
      onUpdate();
    } catch (error) {
      console.error('Error al crear Internet Gateway:', error);
    }
  };

  const handleCreateNAT = async () => {
    if (!selectedVpc || !selectedSubnet) return;
    try {
      await createNatGateway({
        SubnetId: selectedSubnet,
        VpcId: selectedVpc
      });
      setShowCreateForm(false);
      setSelectedVpc('');
      setSelectedSubnet('');
      onUpdate();
    } catch (error) {
      console.error('Error al crear NAT Gateway:', error);
    }
  };

  const handleCreateRouteTable = async () => {
    if (!selectedVpc) return;
    try {
      await createRouteTable(selectedVpc);
      setShowCreateForm(false);
      setSelectedVpc('');
      onUpdate();
    } catch (error) {
      console.error('Error al crear Route Table:', error);
    }
  };

  const handleDeleteIGW = async (internetGatewayId) => {
    try {
      await deleteInternetGateway(internetGatewayId);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar Internet Gateway:', error);
    }
  };

  const renderIGWSection = () => (
    <div className="igw-section">
      <div className="igw-header">
        <h3 className="igw-title">
          <FaGlobe /> Internet Gateways
        </h3>
        <button className="new-igw-button">
          <FaPlus /> Nuevo IGW
        </button>
      </div>

      <div className="igw-list">
        {internetGateways.map(igw => (
          <div key={igw.InternetGatewayId} className="igw-card">
            <div className="igw-card-header">
              <div className="igw-info">
                <FaGlobe className="igw-icon" />
                <span className="igw-id">{igw.InternetGatewayId}</span>
              </div>
              <button 
                className="igw-delete"
                onClick={() => handleDeleteIGW(igw.InternetGatewayId)}
                title="Eliminar Internet Gateway"
              >
                <FaTrash />
              </button>
            </div>
            
            <div className="igw-card-content">
              <div className="igw-details">
                <div className="igw-detail-item">
                  <div className="igw-detail-label">VPC</div>
                  <div className="igw-detail-value">{igw.VpcId || 'No asociado'}</div>
                </div>
                {/* Otros detalles que quieras mostrar */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ... Continuará con las secciones de NAT Gateway y Route Tables ...

  return (
    <div className="connectivity-manager">
      <div className="section-tabs">
        <button
          className={`tab-button ${activeSection === 'igw' ? 'active' : ''}`}
          onClick={() => setActiveSection('igw')}
        >
          <FaGlobe /> Internet Gateways
        </button>
        <button
          className={`tab-button ${activeSection === 'nat' ? 'active' : ''}`}
          onClick={() => setActiveSection('nat')}
        >
          <FaNetworkWired /> NAT Gateways
        </button>
        <button
          className={`tab-button ${activeSection === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveSection('routes')}
        >
          <FaRoute /> Route Tables
        </button>
      </div>

      {activeSection === 'igw' && renderIGWSection()}
      {/* Implementaremos las otras secciones a continuación */}
    </div>
  );
};

export default ConnectivityManager; 
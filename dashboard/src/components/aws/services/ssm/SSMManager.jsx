import React, { useState, useEffect } from 'react';
import { FaCog, FaServer, FaTools, FaClipboardCheck, FaBoxes, FaDesktop } from 'react-icons/fa';
import './styles/ssm-manager.css';
import { checkPermissions } from '../../../../services/ssmService';
import PatchManager from './PatchManager';
import InventoryManager from './InventoryManager';
import AutomationManager from './AutomationManager';
import ComplianceManager from './ComplianceManager';
import SessionManager from './SessionManager';
import EC2Manager from './EC2Manager';

const SSMManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [status, setStatus] = useState('active');
  const [selectedInstance, setSelectedInstance] = useState(null);

  useEffect(() => {
    const initializeSSM = async () => {
      if (isOpen) {
        try {
          const permissions = await checkPermissions();
          if (permissions) {
            setStatus('active');
          } else {
            console.warn('No se tienen suficientes permisos');
            setStatus('limited');
          }
        } catch (error) {
          console.error('Error initializing SSM:', error);
          setStatus('error');
        }
      }
    };

    initializeSSM();
  }, [isOpen]);

  const handleInstanceSelect = (instance) => {
    setSelectedInstance(instance);
  };

  const renderTabContent = () => {
    if (status === 'error') {
      return (
        <div className="error-state">
          <FaCog className="error-icon" />
          <h3>Error al cargar Systems Manager</h3>
          <p>No se pudo inicializar el servicio. Por favor, verifica tus permisos e inténtalo de nuevo.</p>
        </div>
      );
    }

    return (
      <div className="tab-content">
        {activeTab === 'ec2' && <EC2Manager 
          onInstanceSelect={handleInstanceSelect}
          selectedInstance={selectedInstance}
        />}
        {activeTab === 'inventory' && <InventoryManager 
          onInstanceSelect={handleInstanceSelect}
          selectedInstance={selectedInstance}
        />}
        {activeTab === 'patch' && <PatchManager 
          selectedInstance={selectedInstance}
          onInstanceSelect={handleInstanceSelect}
        />}
        {activeTab === 'automation' && <AutomationManager />}
        {activeTab === 'compliance' && <ComplianceManager />}
        {activeTab === 'sessions' && <SessionManager />}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-icon">
            <FaCog />
          </div>
          <h2>AWS Systems Manager</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'ec2' ? 'active' : ''}`}
            onClick={() => setActiveTab('ec2')}
          >
            <FaDesktop />
            <span>Instancias EC2</span>
          </button>
          <button 
            className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <FaServer />
            <span>Inventario</span>
          </button>
          <button 
            className={`tab ${activeTab === 'patch' ? 'active' : ''}`}
            onClick={() => setActiveTab('patch')}
          >
            <FaTools />
            <span>Parches</span>
          </button>
          <button 
            className={`tab ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
          >
            <FaBoxes />
            <span>Automatización</span>
          </button>
          <button 
            className={`tab ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            <FaClipboardCheck />
            <span>Cumplimiento</span>
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default SSMManager; 
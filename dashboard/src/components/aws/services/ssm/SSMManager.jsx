import React, { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import './styles/ssm-manager.css';
import { checkPermissions } from '../../../../services/ssmService';
import PatchManager from './PatchManager';
import InventoryManager from './InventoryManager';
import AutomationManager from './AutomationManager';
import ComplianceManager from './ComplianceManager';
import SessionManager from './SessionManager';

const SSMManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('patches');
  const [status, setStatus] = useState('active');

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
        {activeTab === 'patches' && <PatchManager />}
        {activeTab === 'inventory' && <InventoryManager />}
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
            className={activeTab === 'patches' ? 'active' : ''} 
            onClick={() => setActiveTab('patches')}
          >
            Parches
          </button>
          <button 
            className={activeTab === 'inventory' ? 'active' : ''} 
            onClick={() => setActiveTab('inventory')}
          >
            Inventario
          </button>
          <button 
            className={activeTab === 'automation' ? 'active' : ''} 
            onClick={() => setActiveTab('automation')}
          >
            Automatización
          </button>
          <button 
            className={activeTab === 'compliance' ? 'active' : ''} 
            onClick={() => setActiveTab('compliance')}
          >
            Cumplimiento
          </button>
          <button 
            className={activeTab === 'sessions' ? 'active' : ''} 
            onClick={() => setActiveTab('sessions')}
          >
            Sesiones
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default SSMManager; 
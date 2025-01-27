import React, { useState } from 'react';
import { FaMicrosoft } from 'react-icons/fa';
import './styles/azure-view.css';

const AzureView = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="azure-view">
      {!isConnected ? (
        <div className="azure-not-connected">
          <FaMicrosoft className="azure-big-icon" />
          <h2>No conectado a Azure</h2>
          <p>Conecta tu cuenta de Azure para ver y gestionar tus servicios.</p>
          <button className="connect-azure-btn">
            Conectar con Azure
          </button>
        </div>
      ) : (
        <div className="azure-services">
          <div className="service-category">
            <h3>Servicios de Computación</h3>
            <div className="services-grid">
              {/* Virtual Machines */}
              <div className="azure-service-widget">
                <div className="widget-header">
                  <div className="service-icon">
                    <FaServer />
                  </div>
                  <div className="service-status active">
                    Conectado
                  </div>
                </div>
                <h3 className="service-title">Virtual Machines</h3>
                <div className="service-stats">
                  <div className="stat-item">
                    <span className="stat-label">VMs Activas</span>
                    <span className="stat-value">3</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total VMs</span>
                    <span className="stat-value">5</span>
                  </div>
                </div>
                <button className="service-action-btn">
                  Gestionar
                </button>
              </div>

              {/* App Services */}
              <div className="azure-service-widget">
                {/* ... similar structure for App Services ... */}
              </div>

              {/* Container Instances */}
              <div className="azure-service-widget">
                {/* ... similar structure for Container Instances ... */}
              </div>
            </div>
          </div>

          <div className="service-category">
            <h3>Seguridad y Redes</h3>
            <div className="services-grid">
              {/* Key Vault */}
              <div className="azure-service-widget">
                {/* ... similar structure for Key Vault ... */}
              </div>

              {/* Virtual Network */}
              <div className="azure-service-widget">
                {/* ... similar structure for Virtual Network ... */}
              </div>

              {/* Security Center */}
              <div className="azure-service-widget">
                {/* ... similar structure for Security Center ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AzureView; 
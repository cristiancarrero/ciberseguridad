import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import './styles/gcp-view.css';

const GCPView = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="gcp-view">
      {!isConnected ? (
        <div className="gcp-not-connected">
          <FaGoogle className="gcp-big-icon" />
          <h2>No conectado a Google Cloud</h2>
          <p>Conecta tu cuenta de Google Cloud para ver y gestionar tus servicios.</p>
          <button className="connect-gcp-btn">
            Conectar con Google Cloud
          </button>
        </div>
      ) : (
        <div className="gcp-services">
          <div className="service-category">
            <h3>Compute Services</h3>
            <div className="services-grid">
              {/* Compute Engine */}
              <div className="gcp-service-widget">
                <div className="widget-header">
                  <div className="service-icon">
                    <FaServer />
                  </div>
                  <div className="service-status active">
                    Conectado
                  </div>
                </div>
                <h3 className="service-title">Compute Engine</h3>
                <div className="service-stats">
                  <div className="stat-item">
                    <span className="stat-label">Instancias Activas</span>
                    <span className="stat-value">4</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Instancias</span>
                    <span className="stat-value">6</span>
                  </div>
                </div>
                <button className="service-action-btn">
                  Gestionar
                </button>
              </div>

              {/* Cloud Run */}
              <div className="gcp-service-widget">
                {/* ... similar structure for Cloud Run ... */}
              </div>

              {/* Kubernetes Engine */}
              <div className="gcp-service-widget">
                {/* ... similar structure for GKE ... */}
              </div>
            </div>
          </div>

          <div className="service-category">
            <h3>Security & Identity</h3>
            <div className="services-grid">
              {/* Cloud IAM */}
              <div className="gcp-service-widget">
                {/* ... similar structure for Cloud IAM ... */}
              </div>

              {/* Security Command Center */}
              <div className="gcp-service-widget">
                {/* ... similar structure for Security Command Center ... */}
              </div>

              {/* Cloud KMS */}
              <div className="gcp-service-widget">
                {/* ... similar structure for Cloud KMS ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCPView; 
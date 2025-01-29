import React from 'react';
import { FaAws, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import '../../../styles/components/aws-connect-modal.css'; 

const AwsDisconnectModal = ({ isOpen, onClose, onDisconnect }) => {
  if (!isOpen) return null;

  return (
    <div className="aws-connect-overlay" onClick={onClose}>
      <div className="aws-connect-modal" onClick={e => e.stopPropagation()}>
        <div className="aws-connect-header">
          <h2><FaAws /> Desconectar de AWS</h2>
          <button className="aws-connect-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="aws-connect-body">
          <div className="warning-message">
            <FaExclamationTriangle /> ¿Estás seguro de que quieres desconectarte de AWS?
            Perderás el acceso a todos los servicios hasta que vuelvas a conectarte.
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="connect-btn"
              onClick={onDisconnect}
            >
              Desconectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwsDisconnectModal; 
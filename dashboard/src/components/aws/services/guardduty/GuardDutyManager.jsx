import React from 'react';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import './styles/guardduty-manager.css';

function GuardDutyManager({ isOpen, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container guardduty-manager">
        <div className="modal-header">
          <div className="header-title">
            <FaShieldAlt className="header-icon" />
            <h2>Amazon GuardDuty</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="service-unavailable">
            <FaExclamationTriangle className="warning-icon" />
            <h3>Servicio No Disponible</h3>
            <p>Amazon GuardDuty no está disponible en este entorno de laboratorio.</p>
            <p>Este servicio requiere permisos adicionales que no están incluidos en el LabRole.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardDutyManager; 
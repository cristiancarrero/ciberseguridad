import React from 'react';
import { FaAws, FaTimes } from 'react-icons/fa';

const AwsConnectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <FaAws />
            <h2>Conectar con AWS</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="accessKey">Access Key ID</label>
            <input 
              type="text" 
              id="accessKey" 
              placeholder="Introduce tu Access Key ID"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secretKey">Secret Access Key</label>
            <input 
              type="password" 
              id="secretKey" 
              placeholder="Introduce tu Secret Access Key"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="region">Región</label>
            <select id="region">
              <option value="">Selecciona una región</option>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="eu-central-1">EU (Frankfurt)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
            </select>
          </div>

          <div className="form-info">
            <p>
              <strong>Nota de Seguridad:</strong> Tus credenciales se almacenarán de forma segura y encriptada.
              Te recomendamos crear un usuario IAM específico con los permisos necesarios.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn primary">
            Conectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwsConnectModal; 
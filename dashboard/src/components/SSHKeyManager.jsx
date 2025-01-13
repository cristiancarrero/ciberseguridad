import React, { useState } from 'react';
import { FaKey } from 'react-icons/fa';
import '../styles/components/ssh-key-manager.css';

const SSHKeyManager = ({ onClose, onKeyUpdate }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      setError('Por favor, introduce una clave RSA privada válida');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      sessionStorage.setItem('ssh_key', privateKey);
      onKeyUpdate(true);
      onClose();
    } catch (error) {
      setError('Error al procesar la clave: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="ssh-key-modal">
      <div className="ssh-key-content">
        <div className="ssh-key-header">
          <FaKey className="key-icon" />
          <h2>Clave SSH requerida</h2>
        </div>
        <div className="ssh-key-body">
          <p>Introduce tu clave RSA privada para conectarte a las instancias</p>
          {error && <div className="error-message">{error}</div>}
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="-----BEGIN RSA PRIVATE KEY-----..."
            rows={15}
          />
          <div className="ssh-key-actions">
            <button 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="connect-btn"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSHKeyManager; 
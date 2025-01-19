import React, { useState } from 'react';
import { connectToAWS } from '../../services/awsService';
import { parseAWSCredentials } from '../../utils/awsUtils';
import { FaAws, FaTimes, FaInfo } from 'react-icons/fa';

const AWSConnectModal = ({ isOpen, onClose, onConnect }) => {
  const [credentialsText, setCredentialsText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setError('');
      setIsLoading(true);

      // Parsear las credenciales del texto ingresado
      const credentials = parseAWSCredentials(credentialsText);

      // Conectar a AWS con las credenciales
      await connectToAWS(credentials);

      onConnect(true);
      onClose();
    } catch (error) {
      setError(error.message || 'Error al conectar con AWS');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaAws /> Conectar con AWS Academy</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="info-message">
            <FaInfo /> Pega las credenciales de AWS Academy en cualquier campo para autocompletar.
          </div>

          <textarea
            value={credentialsText}
            onChange={(e) => setCredentialsText(e.target.value)}
            placeholder="Pega tus credenciales aquí..."
            rows={10}
            className="credentials-input"
          />

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              onClick={handleConnect}
              disabled={isLoading || !credentialsText.trim()}
              className="connect-button"
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSConnectModal; 
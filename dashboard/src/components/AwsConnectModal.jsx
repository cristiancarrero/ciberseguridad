import React, { useState } from 'react';
import { initializeAWS } from '../services/awsService';
import { FaAws, FaTimes, FaKey, FaLock, FaGlobe } from 'react-icons/fa';

const AwsConnectModal = ({ isOpen, onClose, onConnect, isConnected }) => {
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: '',
    region: 'us-west-2'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasteCredentials = (e) => {
    const text = e.clipboardData.getData('text');
    try {
      // Parsear las credenciales del formato AWS CLI
      const accessKeyMatch = text.match(/aws_access_key_id=([A-Z0-9]+)/);
      const secretKeyMatch = text.match(/aws_secret_access_key=([A-Za-z0-9+/=]+)/);
      const sessionTokenMatch = text.match(/aws_session_token=([A-Za-z0-9+/=]+)/);

      if (accessKeyMatch || secretKeyMatch || sessionTokenMatch) {
        e.preventDefault(); // Prevenir el pegado normal
        
        const newCredentials = {
          ...credentials,
          ...(accessKeyMatch && { accessKeyId: accessKeyMatch[1] }),
          ...(secretKeyMatch && { secretAccessKey: secretKeyMatch[1] }),
          ...(sessionTokenMatch && { sessionToken: sessionTokenMatch[1] })
        };

        setCredentials(newCredentials);
        
        // Log para debugging
        console.log('Credenciales parseadas:', {
          accessKeyId: newCredentials.accessKeyId,
          secretAccessKey: newCredentials.secretAccessKey ? '***' : undefined,
          sessionToken: newCredentials.sessionToken ? '***' : undefined
        });
      }
    } catch (err) {
      console.error('Error al parsear las credenciales:', err);
      setError('Error al parsear las credenciales. Asegúrate de que el formato es correcto.');
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Guardar las credenciales en localStorage
      const awsCredentials = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      };
      
      localStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
      localStorage.setItem('awsRegion', credentials.region);
      localStorage.setItem('awsConnected', 'true');

      // Limpiar el formulario
      setCredentials({
        accessKeyId: '',
        secretAccessKey: '',
        sessionToken: '',
        region: 'us-west-2'
      });

      // Notificar al componente padre
      onConnect(true);
    } catch (error) {
      console.error('Error al conectar con AWS:', error);
      setError('Error al conectar con AWS');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('awsConnected');
    onConnect(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content aws-modal">
        <div className="modal-header">
          <div className="header-title">
            <FaAws className="aws-icon" />
            <h2>{isConnected ? 'Desconectar de AWS Academy' : 'Conectar con AWS Academy'}</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {isConnected ? (
            <div className="disconnect-content">
              <div className="credentials-help">
                <div className="help-icon">⚠️</div>
                <p>Al desconectarte, perderás acceso a todos los servicios de AWS hasta que vuelvas a conectarte.</p>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={handleDisconnect}
                  className="connect-btn warning"
                >
                  Desconectar
                </button>
                <button onClick={onClose} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="credentials-help">
                <div className="help-icon">ℹ️</div>
                <p>Pega las credenciales de AWS Academy en cualquier campo para autocompletar todos los campos necesarios.</p>
              </div>

              <div className="form-group">
                <label>
                  <FaKey className="input-icon" />
                  Access Key ID
                </label>
                <input
                  type="text"
                  name="accessKeyId"
                  value={credentials.accessKeyId}
                  onChange={handleInputChange}
                  onPaste={handlePasteCredentials}
                  placeholder="ASIA..."
                  className="aws-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaLock className="input-icon" />
                  Secret Access Key
                </label>
                <input
                  type="password"
                  name="secretAccessKey"
                  value={credentials.secretAccessKey}
                  onChange={handleInputChange}
                  onPaste={handlePasteCredentials}
                  placeholder="Introduce tu Secret Access Key"
                  className="aws-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaKey className="input-icon" />
                  Session Token
                </label>
                <textarea
                  name="sessionToken"
                  value={credentials.sessionToken}
                  onChange={handleInputChange}
                  onPaste={handlePasteCredentials}
                  placeholder="Pega aquí el Session Token de AWS Academy"
                  rows="3"
                  className="aws-textarea"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" />
                  Región
                </label>
                <select
                  name="region"
                  value={credentials.region}
                  onChange={handleInputChange}
                  className="aws-select"
                >
                  <option value="">Selecciona una región</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="us-east-1">US East (N. Virginia)</option>
                </select>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  onClick={handleConnect} 
                  disabled={loading || !credentials.accessKeyId || !credentials.secretAccessKey || !credentials.sessionToken || !credentials.region}
                  className={`connect-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Conectando...' : 'Conectar'}
                </button>
                <button onClick={onClose} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>

        {!isConnected && (
          <div className="modal-footer">
            <div className="security-note">
              <span className="note-icon">🔒</span>
              <p>
                Estas credenciales son temporales y expiran después de cierto tiempo. 
                Necesitarás actualizarlas cuando caduquen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AwsConnectModal; 
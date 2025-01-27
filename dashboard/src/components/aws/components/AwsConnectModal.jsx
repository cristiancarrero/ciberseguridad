import React, { useState, useEffect, useRef } from 'react';
import { FaAws, FaTimes, FaInfo, FaKey, FaLock, FaGlobe } from 'react-icons/fa';
import '../../../styles/components/aws-connect-modal.css';

const AwsConnectModal = ({ isOpen, onClose, onConnect }) => {
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: '',
    region: 'us-west-2'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      // Limpiar estados al desmontar
      setError('');
      setIsLoading(false);
      setCredentials({
        accessKeyId: '',
        secretAccessKey: '',
        sessionToken: '',
        region: 'us-west-2'
      });
    };
  }, []);

  const handleInputChange = (text, field) => {
    // Intentar autocompletar si se pega el texto completo de credenciales
    if (text.includes('[default]')) {
      try {
        const lines = text.split('\n');
        const accessKeyId = lines.find(l => l.includes('aws_access_key_id'))?.split('=')[1]?.trim();
        const secretKey = lines.find(l => l.includes('aws_secret_access_key'))?.split('=')[1]?.trim();
        const sessionToken = lines.find(l => l.includes('aws_session_token'))?.split('=')[1]?.trim();
        
        if (accessKeyId && secretKey && sessionToken) {
          setCredentials({
            ...credentials,
            accessKeyId,
            secretAccessKey: secretKey,
            sessionToken,
            region: 'us-west-2'
          });
          return;
        }
      } catch (e) {
        console.error('Error parsing credentials:', e);
      }
    }
    
    setCredentials(prev => ({...prev, [field]: text}));
  };

  const handlePasteCredentials = (e) => {
    const text = e.clipboardData.getData('text');
    console.log('Texto pegado:', text);
    
    if (text.includes('[default]') || text.includes('aws_access_key_id=')) {
      try {
        // Dividir el texto en líneas
        const lines = text.split('\n');

        // Extraer las credenciales usando el formato correcto
        const accessKeyId = lines.find(l => l.includes('aws_access_key_id='))?.split('=')[1]?.trim();
        const secretKey = lines.find(l => l.includes('aws_secret_access_key='))?.split('=')[1]?.trim();
        const sessionToken = lines.find(l => l.includes('aws_session_token='))?.split('=')[1]?.trim();
        
        console.log('Credenciales encontradas:', { accessKeyId, secretKey, sessionToken });
        
        if (accessKeyId && secretKey && sessionToken) {
          setCredentials({
            ...credentials,
            accessKeyId,
            secretAccessKey: secretKey,
            sessionToken,
            region: 'us-west-2'
          });
          e.preventDefault();
        }
      } catch (err) {
        console.error('Error parsing credentials:', err);
      }
    }
  };

  // Asegurarnos de que el evento paste se maneje en todos los campos
  const handlePaste = (e) => {
    handlePasteCredentials(e);
  };

  // Añadir validación antes de conectar
  const validateCredentials = () => {
    if (!credentials.accessKeyId.startsWith('ASIA')) {
      throw new Error('El Access Key ID debe comenzar con ASIA para credenciales de AWS Academy');
    }
    
    if (!credentials.secretAccessKey || !credentials.sessionToken) {
      throw new Error('Todos los campos son requeridos');
    }
    
    return true;
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevenir múltiples clicks

    setError('');
    setIsLoading(true);

    try {
      const success = await onConnect(credentials);
      if (success) {
        onClose();
      } else {
        throw new Error('No se pudo establecer la conexión con AWS');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      if (mounted.current) { // Usar una ref para verificar si el componente está montado
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="aws-connect-overlay" onClick={onClose}>
      <div className="aws-connect-modal" onClick={e => e.stopPropagation()}>
        <div className="aws-connect-header">
          <h2><FaAws /> Conectar con AWS Academy</h2>
          <button className="aws-connect-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="aws-connect-body">
          <div className="info-message">
            <FaInfo /> Pega las credenciales de AWS Academy en cualquier campo para autocompletar todos los campos necesarios.
          </div>

          <div className="form-group">
            <label><FaKey /> Access Key ID</label>
            <input
              type="text"
              value={credentials.accessKeyId}
              onChange={(e) => handleInputChange(e.target.value, 'accessKeyId')}
              onPaste={handlePaste}
              placeholder="ASIA..."
              className="aws-input"
            />
          </div>

          <div className="form-group">
            <label><FaLock /> Secret Access Key</label>
            <input
              type="password"
              value={credentials.secretAccessKey}
              onChange={(e) => handleInputChange(e.target.value, 'secretAccessKey')}
              onPaste={handlePaste}
              placeholder="Introduce tu Secret Access Key"
              className="aws-input"
            />
          </div>

          <div className="form-group">
            <label><FaKey /> Session Token</label>
            <textarea
              value={credentials.sessionToken}
              onChange={(e) => handleInputChange(e.target.value, 'sessionToken')}
              onPaste={handlePaste}
              placeholder="Pega aquí el Session Token de AWS Academy"
              className="aws-textarea"
            />
          </div>

          <div className="form-group">
            <label><FaGlobe /> Región</label>
            <select
              value={credentials.region}
              onChange={(e) => handleInputChange(e.target.value, 'region')}
              className="aws-select"
            >
              <option value="us-west-2">US West (Oregon)</option>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>

          <div className="warning-message">
            <FaLock /> Estas credenciales son temporales y expiran después de cierto tiempo. Necesitarás actualizarlas cuando caduquen.
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className={`connect-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwsConnectModal; 
import React, { useState, useEffect } from 'react';
import { FaKey, FaUpload, FaCheck } from 'react-icons/fa';

const SSHKeyManager = ({ onKeyUpdate }) => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // Verificar si ya hay una clave almacenada en la sesión
    const storedKey = sessionStorage.getItem('ssh_key');
    setHasKey(!!storedKey);
    if (storedKey) {
      onKeyUpdate(true);
    }
  }, [onKeyUpdate]);

  const handleKeyUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const pemContent = e.target.result;
        sessionStorage.setItem('ssh_key', pemContent);
        setHasKey(true);
        onKeyUpdate(true);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error al cargar la clave SSH:', error);
      alert('Error al cargar el archivo PEM. Asegúrate de que es un archivo válido.');
    }
  };

  return (
    <div className="ssh-key-manager">
      {!hasKey ? (
        <div className="key-upload-container">
          <div className="key-upload-content">
            <FaKey size={24} />
            <h3>Clave SSH requerida</h3>
            <p>Sube tu archivo vockey.pem para conectarte a las instancias</p>
            <label className="upload-button">
              <FaUpload /> Seleccionar archivo PEM
              <input
                type="file"
                accept=".pem"
                onChange={handleKeyUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="key-status">
          <FaCheck className="key-icon" />
          <span>Clave SSH cargada</span>
        </div>
      )}
    </div>
  );
};

export default SSHKeyManager; 
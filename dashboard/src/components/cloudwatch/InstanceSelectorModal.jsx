import React, { useState, useEffect } from 'react';
import { getCloudWatchInstances } from '../../services/cloudwatchInstanceService';

const InstanceSelectorModal = ({ onClose, onSelect }) => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState(null);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const instanceList = await getCloudWatchInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Error al cargar instancias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedInstance) {
      onSelect(selectedInstance);
    }
  };

  // Renderizamos el modal usando un portal para asegurar que aparezca sobre todo
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="instance-selector-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Seleccionar Instancia</h3>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>

          <div className="modal-content">
            {loading ? (
              <div className="loading-state">Cargando instancias...</div>
            ) : instances.length === 0 ? (
              <div className="empty-state">No hay instancias disponibles</div>
            ) : (
              <div className="instance-list">
                {instances.map(instance => (
                  <div
                    key={instance.id}
                    className={`instance-option ${selectedInstance?.id === instance.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInstance(instance)}
                  >
                    <input
                      type="radio"
                      checked={selectedInstance?.id === instance.id}
                      onChange={() => setSelectedInstance(instance)}
                    />
                    <div className="instance-info">
                      <span className="instance-name">{instance.name}</span>
                      <span className="instance-id">{instance.id}</span>
                      <span className="instance-type">{instance.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="confirm-btn"
              disabled={!selectedInstance}
              onClick={handleConfirm}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstanceSelectorModal; 
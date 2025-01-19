import React, { useState, useEffect } from 'react';
import { FaServer, FaSearch } from 'react-icons/fa';
import { listInstances } from '../../../../services/ec2Service';

const InstanceSelectorModal = ({ onClose, onSelect }) => {
  const [instances, setInstances] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const instanceList = await listInstances();
      const formattedInstances = instanceList.map(instance => ({
        id: instance.id,
        name: instance.name,
        type: instance.type
      }));
      setInstances(formattedInstances);
    } catch (error) {
      console.error('Error al cargar instancias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstances = instances.filter(instance =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="instance-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="instance-selector-header">
          <h3>
            <FaServer />
            Seleccionar Instancia
          </h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="instance-selector-content">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar instancia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="instances-list-container">
            {loading ? (
              <div className="loading-state">Cargando instancias...</div>
            ) : filteredInstances.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? 'No se encontraron instancias' : 'No hay instancias disponibles'}
              </div>
            ) : (
              filteredInstances.map(instance => (
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
                  <div>
                    <span className="instance-name">{instance.name}</span>
                    <span className="instance-type">{instance.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="instance-selector-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="confirm-btn"
            disabled={!selectedInstance}
            onClick={() => selectedInstance && onSelect(selectedInstance)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstanceSelectorModal; 
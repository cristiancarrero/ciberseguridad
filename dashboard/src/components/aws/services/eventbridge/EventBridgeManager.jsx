import React, { useState, useEffect } from 'react';
import { FaBolt, FaTimes, FaPlay, FaStop, FaTrash } from 'react-icons/fa';
import { getEventBuses, getRules, enableRule, disableRule, deleteRule } from '../../../../services/aws/eventbridge/eventbridgeService';
import './styles/eventbridge-manager.css';

const EventBridgeManager = ({ isOpen, onClose }) => {
  const [eventBuses, setEventBuses] = useState([]);
  const [rules, setRules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState('default');

  useEffect(() => {
    if (isOpen) {
      loadEventBridgeData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedBus) {
      loadRules(selectedBus);
    }
  }, [selectedBus]);

  const loadEventBridgeData = async () => {
    try {
      setIsLoading(true);
      const busesList = await getEventBuses();
      setEventBuses(busesList);
      setError(null);
    } catch (err) {
      setError('Error al cargar Event Buses: ' + err.message);
      console.error('Error cargando Event Buses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRules = async (busName) => {
    try {
      const rulesList = await getRules(busName);
      setRules(prev => ({
        ...prev,
        [busName]: rulesList
      }));
    } catch (err) {
      setError('Error al cargar reglas: ' + err.message);
    }
  };

  const handleEnableRule = async (busName, ruleName) => {
    try {
      await enableRule(busName, ruleName);
      await loadRules(busName);
    } catch (err) {
      setError('Error al habilitar regla: ' + err.message);
    }
  };

  const handleDisableRule = async (busName, ruleName) => {
    try {
      await disableRule(busName, ruleName);
      await loadRules(busName);
    } catch (err) {
      setError('Error al deshabilitar regla: ' + err.message);
    }
  };

  const handleDeleteRule = async (busName, ruleName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la regla ${ruleName}?`)) {
      try {
        await deleteRule(busName, ruleName);
        await loadRules(busName);
      } catch (err) {
        setError('Error al eliminar regla: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="eventbridge-manager-modal">
        <div className="modal-header">
          <h2><FaBolt /> Amazon EventBridge</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Cargando Event Buses...</div>
          ) : (
            <>
              <div className="bus-selector">
                <select 
                  value={selectedBus} 
                  onChange={(e) => setSelectedBus(e.target.value)}
                >
                  {eventBuses.map(bus => (
                    <option key={bus.Name} value={bus.Name}>
                      {bus.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rules-list">
                {selectedBus && rules[selectedBus]?.map(rule => (
                  <div key={rule.Name} className="rule-item">
                    <div className="rule-info">
                      <h4>{rule.Name}</h4>
                      <p>Estado: {rule.State}</p>
                      <p>Descripción: {rule.Description || 'Sin descripción'}</p>
                    </div>
                    <div className="rule-actions">
                      <button
                        className="enable-rule-btn"
                        onClick={() => handleEnableRule(selectedBus, rule.Name)}
                        disabled={rule.State === 'ENABLED'}
                      >
                        <FaPlay /> Habilitar
                      </button>
                      <button
                        className="disable-rule-btn"
                        onClick={() => handleDisableRule(selectedBus, rule.Name)}
                        disabled={rule.State === 'DISABLED'}
                      >
                        <FaStop /> Deshabilitar
                      </button>
                      <button
                        className="delete-rule-btn"
                        onClick={() => handleDeleteRule(selectedBus, rule.Name)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventBridgeManager; 
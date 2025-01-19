import React, { useState, useEffect } from 'react';
import { FaCog, FaTimes, FaPlay, FaStop, FaTrash } from 'react-icons/fa';
import { getRules, getEvaluations, startRule, stopRule, deleteRule } from '../../../../services/aws/config/configService';
import './styles/config-manager.css';

const ConfigManager = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadConfigData();
    }
  }, [isOpen]);

  const loadConfigData = async () => {
    try {
      setIsLoading(true);
      const [rulesList, evaluationsList] = await Promise.all([
        getRules(),
        getEvaluations()
      ]);
      
      setRules(rulesList);
      
      // Organizar evaluaciones por regla
      const evaluationsByRule = evaluationsList.reduce((acc, evaluation) => {
        if (!acc[evaluation.ConfigRuleName]) {
          acc[evaluation.ConfigRuleName] = [];
        }
        acc[evaluation.ConfigRuleName].push(evaluation);
        return acc;
      }, {});
      
      setEvaluations(evaluationsByRule);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de Config: ' + err.message);
      console.error('Error cargando Config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRule = async (ruleName) => {
    try {
      await startRule(ruleName);
      await loadConfigData();
    } catch (err) {
      setError('Error al iniciar regla: ' + err.message);
    }
  };

  const handleStopRule = async (ruleName) => {
    try {
      await stopRule(ruleName);
      await loadConfigData();
    } catch (err) {
      setError('Error al detener regla: ' + err.message);
    }
  };

  const handleDeleteRule = async (ruleName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la regla ${ruleName}?`)) {
      try {
        await deleteRule(ruleName);
        await loadConfigData();
      } catch (err) {
        setError('Error al eliminar regla: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="config-manager-modal">
        <div className="modal-header">
          <h2><FaCog /> AWS Config</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Cargando reglas de Config...</div>
          ) : (
            <div className="rules-list">
              {rules.map(rule => (
                <div key={rule.ConfigRuleName} className="rule-item">
                  <div className="rule-info">
                    <h4>{rule.ConfigRuleName}</h4>
                    <p>Estado: {rule.ConfigRuleState}</p>
                    <p>Tipo: {rule.Source.Owner}</p>
                    <div className="evaluations-summary">
                      <h5>Evaluaciones:</h5>
                      {evaluations[rule.ConfigRuleName]?.map((evaluation, index) => (
                        <div key={index} className="evaluation-item">
                          <p>Recurso: {evaluation.ResourceId}</p>
                          <p>Resultado: {evaluation.ComplianceType}</p>
                          <p>Fecha: {new Date(evaluation.ResultRecordedTime).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rule-actions">
                    <button
                      className="start-rule-btn"
                      onClick={() => handleStartRule(rule.ConfigRuleName)}
                      disabled={rule.ConfigRuleState === 'ACTIVE'}
                    >
                      <FaPlay /> Iniciar
                    </button>
                    <button
                      className="stop-rule-btn"
                      onClick={() => handleStopRule(rule.ConfigRuleName)}
                      disabled={rule.ConfigRuleState === 'INACTIVE'}
                    >
                      <FaStop /> Detener
                    </button>
                    <button
                      className="delete-rule-btn"
                      onClick={() => handleDeleteRule(rule.ConfigRuleName)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigManager; 
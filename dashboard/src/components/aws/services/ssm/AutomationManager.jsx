import React, { useState, useEffect } from 'react';
import { FaCog, FaPlay, FaHistory, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import './styles/automation-manager.css';
import { 
  getAutomationDocuments,
  startAutomation,
  getAutomationExecutions
} from '../../../../services/ssmService';

const AutomationManager = () => {
  const [documents, setDocuments] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
    loadExecutions();

    // Actualizar ejecuciones cada minuto
    const interval = setInterval(loadExecutions, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getAutomationDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Error al cargar los documentos de automatización');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const execs = await getAutomationExecutions();
      setExecutions(execs);
    } catch (err) {
      console.error('Error loading executions:', err);
    }
  };

  const handleStartAutomation = async (document) => {
    try {
      setLoading(true);
      await startAutomation(document.name);
      await loadExecutions();
    } catch (err) {
      setError('Error al iniciar la automatización');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="automation-manager">
      <div className="automation-header">
        <h2><FaCog /> Automatización</h2>
      </div>

      <div className="automation-content">
        <div className="documents-section">
          <h3>Documentos Disponibles</h3>
          {loading ? (
            <div className="loading-state">
              <FaSpinner className="fa-spin" />
              <p>Cargando documentos...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map(doc => (
                <div key={doc.name} className="document-card">
                  <div className="document-info">
                    <h4>{doc.name}</h4>
                    <p>{doc.description}</p>
                    <small>Versión: {doc.version}</small>
                  </div>
                  <div className="document-actions">
                    <button
                      className="run-button"
                      onClick={() => handleStartAutomation(doc)}
                      disabled={loading}
                    >
                      <FaPlay /> Ejecutar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="executions-section">
          <h3>Ejecuciones Recientes</h3>
          <div className="executions-list">
            {executions.map(execution => (
              <div key={execution.executionId} className="execution-card">
                <div className="execution-header">
                  <span className={`status ${execution.status.toLowerCase()}`}>
                    {execution.status}
                  </span>
                  <span className="time">
                    {new Date(execution.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="execution-details">
                  <p>Documento: {execution.documentName}</p>
                  <p>ID: {execution.executionId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationManager; 
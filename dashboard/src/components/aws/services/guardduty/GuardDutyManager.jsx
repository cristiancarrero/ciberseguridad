import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaTimes } from 'react-icons/fa';
import { getDetectors, getFindings } from '../../../../services/aws/guardduty/guarddutyService';
import './styles/guardduty-manager.css';

const GuardDutyManager = ({ isOpen, onClose }) => {
  const [detectors, setDetectors] = useState([]);
  const [findings, setFindings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadGuardDutyData();
    }
  }, [isOpen]);

  const loadGuardDutyData = async () => {
    try {
      setIsLoading(true);
      const detectorsList = await getDetectors();
      const allFindings = [];
      
      // Obtener hallazgos para cada detector
      for (const detectorId of detectorsList) {
        const detectorFindings = await getFindings(detectorId);
        allFindings.push(...detectorFindings);
      }

      setDetectors(detectorsList);
      setFindings(allFindings);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de GuardDuty: ' + err.message);
      console.error('Error cargando GuardDuty:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="guardduty-manager-modal">
        <div className="modal-header">
          <h2><FaShieldAlt /> AWS GuardDuty</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Cargando datos de GuardDuty...</div>
          ) : (
            <>
              <div className="section">
                <h3>Detectores Activos</h3>
                <div className="detectors-list">
                  {detectors.map(detectorId => (
                    <div key={detectorId} className="detector-item">
                      <div className="detector-info">
                        <h4>Detector ID: {detectorId}</h4>
                        <p>Estado: Activo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Hallazgos de Seguridad</h3>
                <div className="findings-list">
                  {findings.map(finding => (
                    <div key={finding.Id} className="finding-item">
                      <div className="finding-info">
                        <h4>{finding.Title}</h4>
                        <p>Severidad: {finding.Severity}</p>
                        <p>Tipo: {finding.Type}</p>
                        <p>Región: {finding.Region}</p>
                        <p>Fecha: {new Date(finding.CreatedAt).toLocaleString()}</p>
                      </div>
                      <div className="finding-description">
                        <p>{finding.Description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardDutyManager; 
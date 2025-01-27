import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSync } from 'react-icons/fa';
import './styles/compliance-manager.css';

const ComplianceManager = () => {
  const [resources, setResources] = useState([
    {
      id: 'i-1234567890',
      name: 'prod-web-server-01',
      type: 'EC2 Instance',
      compliance: 'Compliant',
      lastCheck: '2024-03-15 10:30:00',
      patches: '100%',
      antivirus: 'Active',
      policies: '15/15'
    },
    {
      id: 'i-0987654321',
      name: 'prod-db-server-01',
      type: 'EC2 Instance',
      compliance: 'Non-Compliant',
      lastCheck: '2024-03-15 10:29:00',
      patches: '85%',
      antivirus: 'Active',
      policies: '13/15'
    }
  ]);

  return (
    <div className="compliance-manager">
      <div className="compliance-header">
        <h3>Estado de Cumplimiento</h3>
        <button className="scan-button">
          <FaSync /> Escanear Ahora
        </button>
      </div>

      <div className="compliance-summary">
        <div className="summary-card">
          <FaCheckCircle className="summary-icon compliant" />
          <div className="summary-info">
            <span className="count">12</span>
            <span className="label">Conformes</span>
          </div>
        </div>
        <div className="summary-card">
          <FaExclamationTriangle className="summary-icon warning" />
          <div className="summary-info">
            <span className="count">3</span>
            <span className="label">Con Advertencias</span>
          </div>
        </div>
        <div className="summary-card">
          <FaTimesCircle className="summary-icon non-compliant" />
          <div className="summary-info">
            <span className="count">1</span>
            <span className="label">No Conformes</span>
          </div>
        </div>
      </div>

      <div className="compliance-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Parches</th>
              <th>Antivirus</th>
              <th>Políticas</th>
              <th>Última Revisión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.id}</td>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>
                  <span className={`status ${resource.compliance.toLowerCase()}`}>
                    {resource.compliance}
                  </span>
                </td>
                <td>{resource.patches}</td>
                <td>{resource.antivirus}</td>
                <td>{resource.policies}</td>
                <td>{resource.lastCheck}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button" title="Ver detalles">
                      Ver
                    </button>
                    <button className="action-button" title="Remediar">
                      Remediar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceManager; 
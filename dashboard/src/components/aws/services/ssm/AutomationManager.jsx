import React, { useState } from 'react';
import { FaPlay, FaHistory, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import './styles/automation-manager.css';

const AutomationManager = () => {
  const [automations] = useState([
    {
      id: 'AUTO-001',
      name: 'AWS-UpdateLinuxAmi',
      status: 'Success',
      startTime: '2024-03-15 10:30',
      target: 'i-0123456789abcdef0',
      type: 'AMI Update'
    },
    {
      id: 'AUTO-002',
      name: 'AWS-RestartEC2Instance',
      status: 'In Progress',
      startTime: '2024-03-15 11:45',
      target: 'i-0123456789abcdef1',
      type: 'Instance Management'
    }
  ]);

  return (
    <div className="automation-manager">
      <div className="automation-header">
        <h3>Automatización</h3>
        <div className="automation-actions">
          <button className="automation-button new">
            <FaPlay /> Nueva Automatización
          </button>
          <button className="automation-button history">
            <FaHistory /> Historial
          </button>
        </div>
      </div>

      <div className="automation-summary">
        <div className="summary-card success">
          <span className="count">5</span>
          <span className="label">Completadas</span>
        </div>
        <div className="summary-card running">
          <span className="count">2</span>
          <span className="label">En Progreso</span>
        </div>
        <div className="summary-card failed">
          <span className="count">1</span>
          <span className="label">Fallidas</span>
        </div>
      </div>

      <div className="automation-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Objetivo</th>
              <th>Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {automations.map(automation => (
              <tr key={automation.id}>
                <td>{automation.id}</td>
                <td>{automation.name}</td>
                <td>
                  <span className="type-badge">{automation.type}</span>
                </td>
                <td>
                  <span className={`status-badge ${automation.status.toLowerCase().replace(' ', '-')}`}>
                    {automation.status === 'In Progress' ? (
                      <><FaSpinner className="fa-spin" /> En Progreso</>
                    ) : automation.status === 'Success' ? (
                      <><FaCheck /> Completado</>
                    ) : (
                      <><FaTimes /> Fallido</>
                    )}
                  </span>
                </td>
                <td>{automation.target}</td>
                <td>{automation.startTime}</td>
                <td>
                  <button 
                    className="action-button view"
                    title="Ver detalles"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutomationManager; 
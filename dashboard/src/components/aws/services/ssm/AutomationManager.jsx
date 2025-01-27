import React, { useState } from 'react';
import { FaPlay, FaStop, FaClock, FaHistory } from 'react-icons/fa';
import './styles/automation-manager.css';

const AutomationManager = () => {
  const [automations, setAutomations] = useState([
    {
      id: 'auto-001',
      name: 'Daily-Backup',
      description: 'Backup diario de instancias EC2',
      status: 'Running',
      lastRun: '2024-03-15 10:00:00',
      nextRun: '2024-03-16 10:00:00',
      type: 'Scheduled'
    },
    {
      id: 'auto-002',
      name: 'Patch-Windows',
      description: 'Actualización de parches Windows',
      status: 'Scheduled',
      lastRun: '2024-03-14 22:00:00',
      nextRun: '2024-03-21 22:00:00',
      type: 'Weekly'
    }
  ]);

  return (
    <div className="automation-manager">
      <div className="automation-header">
        <h3>Automatizaciones</h3>
        <button className="create-button">
          <FaPlay /> Nueva Automatización
        </button>
      </div>

      <div className="automation-summary">
        <div className="summary-card">
          <FaPlay className="summary-icon running" />
          <div className="summary-info">
            <span className="count">3</span>
            <span className="label">En Ejecución</span>
          </div>
        </div>
        <div className="summary-card">
          <FaClock className="summary-icon scheduled" />
          <div className="summary-info">
            <span className="count">5</span>
            <span className="label">Programadas</span>
          </div>
        </div>
        <div className="summary-card">
          <FaHistory className="summary-icon completed" />
          <div className="summary-info">
            <span className="count">12</span>
            <span className="label">Completadas</span>
          </div>
        </div>
      </div>

      <div className="automation-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Última Ejecución</th>
              <th>Próxima Ejecución</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {automations.map(automation => (
              <tr key={automation.id}>
                <td>{automation.id}</td>
                <td>{automation.name}</td>
                <td>{automation.description}</td>
                <td>
                  <span className={`status ${automation.status.toLowerCase()}`}>
                    {automation.status}
                  </span>
                </td>
                <td>{automation.lastRun}</td>
                <td>{automation.nextRun}</td>
                <td>{automation.type}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-button"
                      title={automation.status === 'Running' ? 'Detener' : 'Ejecutar'}
                    >
                      {automation.status === 'Running' ? <FaStop /> : <FaPlay />}
                    </button>
                    <button className="action-button" title="Ver historial">
                      <FaHistory />
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

export default AutomationManager; 
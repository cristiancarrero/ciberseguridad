import React, { useState } from 'react';
import { FaTerminal, FaDesktop, FaPlay, FaStop, FaDownload } from 'react-icons/fa';
import './styles/session-manager.css';

const SessionManager = () => {
  const [sessions, setSessions] = useState([
    {
      id: 'session-001',
      instanceId: 'i-1234567890',
      instanceName: 'prod-web-server-01',
      status: 'Active',
      type: 'Terminal',
      startTime: '2024-03-15 10:00:00',
      user: 'admin'
    },
    {
      id: 'session-002',
      instanceId: 'i-0987654321',
      instanceName: 'prod-db-server-01',
      status: 'Terminated',
      type: 'Remote Desktop',
      startTime: '2024-03-15 09:30:00',
      user: 'dbadmin'
    }
  ]);

  return (
    <div className="session-manager">
      <div className="session-header">
        <h3>Administrador de Sesiones</h3>
        <button className="new-session-button">
          <FaPlay /> Nueva Sesión
        </button>
      </div>

      <div className="session-summary">
        <div className="summary-card">
          <FaTerminal className="summary-icon" />
          <div className="summary-info">
            <span className="count">3</span>
            <span className="label">Sesiones Activas</span>
          </div>
        </div>
        <div className="summary-card">
          <FaDesktop className="summary-icon" />
          <div className="summary-info">
            <span className="count">8</span>
            <span className="label">Instancias Disponibles</span>
          </div>
        </div>
      </div>

      <div className="session-list">
        <table>
          <thead>
            <tr>
              <th>ID Sesión</th>
              <th>Instancia</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>
                  <div className="instance-info">
                    <span className="instance-name">{session.instanceName}</span>
                    <span className="instance-id">{session.instanceId}</span>
                  </div>
                </td>
                <td>
                  <span className="session-type">
                    {session.type === 'Terminal' ? <FaTerminal /> : <FaDesktop />}
                    {session.type}
                  </span>
                </td>
                <td>
                  <span className={`status ${session.status.toLowerCase()}`}>
                    {session.status}
                  </span>
                </td>
                <td>{session.user}</td>
                <td>{session.startTime}</td>
                <td>
                  <div className="action-buttons">
                    {session.status === 'Active' ? (
                      <>
                        <button className="action-button" title="Conectar">
                          <FaPlay />
                        </button>
                        <button className="action-button warning" title="Terminar">
                          <FaStop />
                        </button>
                      </>
                    ) : (
                      <button className="action-button" title="Ver Logs">
                        <FaDownload />
                      </button>
                    )}
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

export default SessionManager; 
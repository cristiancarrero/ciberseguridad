import React, { useState } from 'react';
import { FaServer, FaDesktop, FaDatabase, FaFilter } from 'react-icons/fa';
import './styles/inventory-manager.css';

const InventoryManager = () => {
  const [resources, setResources] = useState([
    {
      id: 'i-1234567890',
      name: 'prod-web-server-01',
      type: 'EC2 Instance',
      platform: 'Amazon Linux 2',
      status: 'Online',
      lastSeen: '2024-03-15 10:30:00'
    },
    {
      id: 'i-0987654321',
      name: 'prod-db-server-01',
      type: 'EC2 Instance',
      platform: 'Ubuntu 20.04',
      status: 'Online',
      lastSeen: '2024-03-15 10:29:00'
    }
  ]);

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h3>Inventario de Recursos</h3>
        <div className="inventory-filters">
          <div className="search-box">
            <input type="text" placeholder="Buscar recursos..." />
            <FaFilter />
          </div>
          <select>
            <option value="all">Todos los tipos</option>
            <option value="ec2">EC2 Instances</option>
            <option value="rds">RDS Databases</option>
            <option value="lambda">Lambda Functions</option>
          </select>
        </div>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <FaServer className="summary-icon" />
          <div className="summary-info">
            <span className="count">15</span>
            <span className="label">Instancias EC2</span>
          </div>
        </div>
        <div className="summary-card">
          <FaDatabase className="summary-icon" />
          <div className="summary-info">
            <span className="count">5</span>
            <span className="label">Bases de Datos</span>
          </div>
        </div>
        <div className="summary-card">
          <FaDesktop className="summary-icon" />
          <div className="summary-info">
            <span className="count">8</span>
            <span className="label">Otros Recursos</span>
          </div>
        </div>
      </div>

      <div className="inventory-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Plataforma</th>
              <th>Estado</th>
              <th>Última Conexión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.id}</td>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.platform}</td>
                <td>
                  <span className={`status ${resource.status.toLowerCase()}`}>
                    {resource.status}
                  </span>
                </td>
                <td>{resource.lastSeen}</td>
                <td>
                  <div className="action-buttons">
                    <button title="Ver detalles">Ver</button>
                    <button title="Configurar">Config</button>
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

export default InventoryManager; 
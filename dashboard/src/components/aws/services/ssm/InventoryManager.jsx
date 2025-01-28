import React, { useState, useEffect } from 'react';
import { FaServer, FaDesktop, FaDatabase, FaFilter, FaSpinner, FaMemory, FaNetworkWired, FaMicrochip, FaSearch, FaUnlink, FaBox, FaGlobe, FaCog } from 'react-icons/fa';
import './styles/inventory-manager.css';
import './styles/select.css';
import { getManagedInstances, getDetailedInventory, getInstancesConnectionStatus, getSystemInfo } from '../../../../services/ssmService';

const InventoryManager = () => {
  const [instances, setInstances] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState({
    applications: [],
    networkConfig: [],
    windowsUpdates: [],
    instanceDetails: []
  });
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredInstances, setFilteredInstances] = useState([]);

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setLoading(true);
        const [instancesData, statusData] = await Promise.all([
          getManagedInstances(),
          getInstancesConnectionStatus()
        ]);
        
        setInstances(instancesData);
        setConnectionStatus(statusData);
      } catch (err) {
        console.error('Error loading inventory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, []);

  useEffect(() => {
    filterInstances();
  }, [filterType, instances]);

  const filterInstances = () => {
    switch(filterType) {
      case 'ec2':
        setFilteredInstances(instances.filter(instance => 
          instance.platformType === 'EC2' || instance.platformType === 'Linux' || instance.platformType === 'Windows'
        ));
        break;
      case 'rds':
        setFilteredInstances(instances.filter(instance => 
          instance.platformType === 'RDS'
        ));
        break;
      case 'lambda':
        setFilteredInstances(instances.filter(instance => 
          instance.platformType === 'Lambda'
        ));
        break;
      default:
        setFilteredInstances(instances);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await getDetailedInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  const handleInstanceSelect = async (instance) => {
    try {
      setLoading(true);
      const info = await getSystemInfo(instance.instanceId);
      setSystemInfo(info);
      setSelectedInstance(instance);
    } catch (error) {
      console.error("Error loading system info:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <FaSpinner className="fa-spin" />
        <p>Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error al cargar el inventario: {error}</p>
      </div>
    );
  }

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <div className="inventory-title">
          <FaDatabase className="icon" />
          <h1>Inventario de Recursos</h1>
        </div>
        
        <div className="inventory-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar recursos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="ssm-select filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="ec2">Instancias EC2</option>
            <option value="rds">Bases de datos RDS</option>
            <option value="lambda">Funciones Lambda</option>
          </select>
        </div>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <FaServer />
          </div>
          <div className="summary-info">
            <div className="summary-count">{connectionStatus?.online || 0}</div>
            <div className="summary-label">Conectadas</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <FaUnlink />
          </div>
          <div className="summary-info">
            <div className="summary-count">{connectionStatus?.offline || 0}</div>
            <div className="summary-label">Desconectadas</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">
            <FaDesktop />
          </div>
          <div className="summary-info">
            <div className="summary-count">{connectionStatus?.total || 0}</div>
            <div className="summary-label">Total</div>
          </div>
        </div>
      </div>

      <div className="inventory-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Plataforma</th>
              <th>IP</th>
              <th>Estado</th>
              <th>Versión Agente</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstances.length > 0 ? (
              filteredInstances.map((instance) => (
                <tr 
                  key={instance.instanceId}
                  className={selectedInstance?.instanceId === instance.instanceId ? 'selected' : ''}
                  onClick={() => handleInstanceSelect(instance)}
                >
                  <td>{instance.instanceId}</td>
                  <td>{instance.friendlyName}</td>
                  <td>{`${instance.platform} ${instance.platformVersion || ''}`}</td>
                  <td>{instance.ipAddress}</td>
                  <td>
                    <span className={`status-badge ${(instance.pingStatus || '').toLowerCase()}`}>
                      {instance.pingStatus || 'Unknown'}
                    </span>
                  </td>
                  <td>{instance.agentVersion}</td>
                </tr>
              ))
            ) : (
              <tr className="no-data-row">
                <td colSpan="6" className="no-data-cell">
                  <div className="no-data-message">
                    <FaServer className="no-data-icon" />
                    <p>No hay instancias disponibles para el tipo seleccionado</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inventory-sections">
        <section className="system-info">
          <h3>
            <FaServer className="section-icon" />
            Información del Sistema
          </h3>
          {systemInfo ? (
            <div className="system-info-grid">
              <div className="info-card">
                <h4><FaDesktop /> Sistema Operativo</h4>
                <ul>
                  <li><strong>Nombre:</strong> {systemInfo.os.name}</li>
                  <li><strong>Versión:</strong> {systemInfo.os.version}</li>
                  <li><strong>Arquitectura:</strong> {systemInfo.os.architecture}</li>
                  <li><strong>Kernel:</strong> {systemInfo.os.kernelVersion}</li>
                  <li><strong>Último arranque:</strong> {new Date(systemInfo.os.lastBootTime).toLocaleString()}</li>
                </ul>
              </div>

              <div className="info-card">
                <h4><FaNetworkWired /> Red</h4>
                {systemInfo.network.interfaces.map((iface, index) => (
                  <div key={index} className="network-interface">
                    <h5>{iface.name}</h5>
                    <ul>
                      <li><strong>MAC:</strong> {iface.macAddress}</li>
                      <li><strong>IPv4:</strong> {iface.ipv4.join(', ')}</li>
                      <li><strong>IPv6:</strong> {iface.ipv6.join(', ')}</li>
                      <li><strong>DNS:</strong> {iface.dnsServers.join(', ')}</li>
                    </ul>
                  </div>
                ))}
              </div>

              <div className="info-card">
                <h4><FaMicrochip /> Hardware</h4>
                <ul>
                  <li><strong>Tipo de instancia:</strong> {systemInfo.hardware.instanceType}</li>
                  <li><strong>Plataforma:</strong> {systemInfo.hardware.platform}</li>
                  <li><strong>Versión:</strong> {systemInfo.hardware.platformVersion}</li>
                  <li><strong>Versión del agente:</strong> {systemInfo.hardware.agentVersion}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="select-instance-message">
              <FaServer size={48} color="var(--text-secondary)" />
              <p>Selecciona una instancia para ver su información detallada</p>
              <small>Haz clic en cualquier instancia de la tabla superior</small>
            </div>
          )}
        </section>
        
        <section className="applications-section">
          <div className="applications-header">
            <FaBox />
            <h3>Aplicaciones Instaladas</h3>
          </div>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Editor</th>
                <th>Fecha Instalación</th>
              </tr>
            </thead>
            <tbody>
              {inventory.applications.map((app, index) => (
                <tr key={index}>
                  <td>
                    <div className="app-name">{app.name}</div>
                  </td>
                  <td>
                    <span className="app-version">{app.version}</span>
                  </td>
                  <td>
                    <div className="app-publisher">
                      <div className="app-publisher-icon">
                        {app.publisher?.charAt(0)}
                      </div>
                      {app.publisher}
                    </div>
                  </td>
                  <td>
                    <span className="app-date">
                      {new Date(app.installTime).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="network-config-section">
          <div className="network-header">
            <FaNetworkWired />
            <h3>Configuración de Red</h3>
          </div>
          <div className="network-content">
            <div className="network-grid">
              <div className="network-card">
                <h4>
                  <FaServer />
                  Interfaces
                </h4>
                <div className="network-list">
                  {inventory.networkConfig.interfaces?.map((iface, index) => (
                    <div key={index} className="network-item">
                      <div className="item-header">
                        <span className="item-name">{iface.name}</span>
                        <span className={`item-status ${iface.status?.toLowerCase()}`}>
                          {iface.status}
                        </span>
                      </div>
                      <div className="item-details">
                        <span>MAC: {iface.macAddress}</span>
                        <span>Tipo: {iface.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="network-card">
                <h4>
                  <FaGlobe />
                  IPs
                </h4>
                <div className="network-list">
                  {inventory.networkConfig.ips?.map((ip, index) => (
                    <div key={index} className="network-item">
                      <div className="item-header">
                        <span className="item-name">{ip.address}</span>
                        <span className="item-type">{ip.type}</span>
                      </div>
                      <div className="item-details">
                        <span>Interfaz: {ip.interface}</span>
                        <span>Máscara: {ip.netmask}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="network-card">
                <h4>
                  <FaCog />
                  DNS
                </h4>
                <div className="network-list">
                  {inventory.networkConfig.dns?.map((dns, index) => (
                    <div key={index} className="network-item">
                      <div className="item-header">
                        <span className="item-name">{dns.server}</span>
                        <span className="item-type">{dns.type}</span>
                      </div>
                      <div className="item-details">
                        <span>Prioridad: {dns.priority}</span>
                        <span>Zona: {dns.zone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryManager; 
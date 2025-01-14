import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaServer, FaUsers, FaNetworkWired, FaDownload, FaHome, FaChartBar, FaLock, FaAws, FaBell, FaCloud, FaMicrosoft, FaGoogle, FaCloudversify, FaDocker, FaCog, FaBolt, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Importar estilos
import '../styles/variables.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components/navbar.css';
import '../styles/components/widgets.css';
import '../styles/components/charts.css';
import '../styles/components/metrics.css';
import '../styles/responsive.css';
import '../styles/dashboard.css';

// Importar el modal y sus estilos
import AwsConnectModal from './AwsConnectModal';
import '../styles/components/modal.css';
import EC2Manager from './EC2Manager';
import { loadAwsConfig } from '../services/awsService';
import CloudWatchManager from './CloudWatchManager';
import Seguridad from './Seguridad';
import { useMetricsPersistence } from '../hooks/useMetricsPersistence';

const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState(() => {
    return localStorage.getItem('currentSection') || 'dashboard';
  });
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const savedState = localStorage.getItem('expandedMenus');
    return savedState ? JSON.parse(savedState) : { integrations: false };
  });
  const [isAwsConnected, setIsAwsConnected] = useState(() => {
    return localStorage.getItem('awsConnected') === 'true';
  });
  const [isEC2ManagerOpen, setIsEC2ManagerOpen] = useState(false);
  const [showCloudWatchManager, setShowCloudWatchManager] = useState(false);
  const { 
    metrics: dashboardMetrics, 
    metricValues: metricsValues,
    addMetric, 
    removeMetric,
    updateMetricValue 
  } = useMetricsPersistence();

  // Añadir estado para los servicios
  const [awsServices, setAwsServices] = useState(() => {
    const savedServices = localStorage.getItem('awsServices');
    return savedServices ? JSON.parse(savedServices) : {
      ec2: false,
      iam: false,
      vpc: false,
      s3: false,
      cloudwatch: false,
      guardduty: false,
      ecs: false,
      config: false,
      eventbridge: false
    };
  });

  useEffect(() => {
    // Cargar la configuración de AWS al montar el componente
    if (isAwsConnected) {
      loadAwsConfig();
    }
  }, [isAwsConnected]);

  const handleSectionChange = (section, e) => {
    e.preventDefault();
    setCurrentSection(section);
    localStorage.setItem('currentSection', section);
  };

  const toggleSubmenu = (menu, e) => {
    e.preventDefault();
    const newExpandedMenus = {
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    };
    setExpandedMenus(newExpandedMenus);
    localStorage.setItem('expandedMenus', JSON.stringify(newExpandedMenus));
  };

  const handleAwsConnection = async (success) => {
    console.log('AWS Connection Status:', success);
    
    if (!success) {
      localStorage.removeItem('awsConfig');
      localStorage.removeItem('awsConnected');
      localStorage.removeItem('awsServices');
      setAwsServices({
        ec2: false,
        iam: false,
        guardduty: false,
        cloudwatch: false,
        // ... otros servicios
      });
      setIsAwsConnected(false);
    } else {
      setIsAwsConnected(true);
      localStorage.setItem('awsConnected', 'true');
      
      // Al conectar, activamos EC2 y CloudWatch
      const defaultServices = {
        ec2: true,
        iam: false,
        guardduty: false,
        cloudwatch: true,  // Activamos CloudWatch
        config: false,
        eventbridge: false,
        ecs: false
      };
      setAwsServices(defaultServices);
      localStorage.setItem('awsServices', JSON.stringify(defaultServices));
    }
    
    setIsAwsModalOpen(false);
  };

  const testConnection = async () => {
    try {
      const result = await testEC2Connection();
      console.log('EC2 Connection Test Result:', result);
    } catch (error) {
      console.error('Test Connection Error:', error);
    }
  };

  const handleAddMetric = (newMetric) => {
    addMetric(newMetric);
  };

  const handleRemoveMetric = (index) => {
    removeMetric(index);
  };

  const handleMetricUpdate = (index, value) => {
    updateMetricValue(index, value);
  };

  const renderContent = () => {
    switch(currentSection) {
      case 'dashboard':
        return (
          <div className="dashboard-overview">
            {/* Header */}
            <div className="content-header">
              <h1 className="content-title">Panel de Control AWS</h1>
              <div className="time-range">
                <button className="time-btn active">24h</button>
                <button className="time-btn">7d</button>
                <button className="time-btn">30d</button>
                <button className="time-btn">90d</button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="widgets-grid main-widgets">
              <div className="widget stat-widget">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="stat-change positive">+2%</div>
                </div>
                <div className="stat-value">98%</div>
                <div className="stat-label">Estado de Seguridad</div>
              </div>

              <div className="widget stat-widget">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaServer />
                  </div>
                  <div className="stat-change positive">+14%</div>
                </div>
                <div className="stat-value">431,225</div>
                <div className="stat-label">Peticiones Procesadas</div>
              </div>

              <div className="widget stat-widget">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-change positive">+21%</div>
                </div>
                <div className="stat-value">32,441</div>
                <div className="stat-label">Usuarios Activos</div>
              </div>

              <div className="widget stat-widget">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaNetworkWired />
                  </div>
                  <div className="stat-change positive">+43%</div>
                </div>
                <div className="stat-value">1.2 TB</div>
                <div className="stat-label">Tráfico de Red</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="widgets-grid secondary-widgets">
              <div className="widget chart-widget">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Rendimiento AWS</h3>
                    <div className="chart-value">$59,342.32</div>
                    <div className="chart-subtitle">Costes y recursos</div>
                  </div>
                  <FaDownload className="chart-download" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="EC2" stroke="#4ecdc4" />
                    <Line type="monotone" dataKey="RDS" stroke="#ff6b6b" />
                    <Line type="monotone" dataKey="S3" stroke="#ffd93d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="widget chart-widget">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Alertas de Seguridad</h3>
                    <div className="chart-subtitle">Por severidad</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={securityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip />
                    <Bar dataKey="alta" fill="#ff6b6b" />
                    <Bar dataKey="media" fill="#ffd93d" />
                    <Bar dataKey="baja" fill="#4ecdc4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="widget activity-widget">
                <div className="chart-header">
                  <h3 className="chart-title">Actividad Reciente</h3>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <FaShieldAlt />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Intento de acceso no autorizado</div>
                      <div className="activity-time">Hace 5 minutos</div>
                    </div>
                    <div className="activity-status error">Bloqueado</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <FaServer />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Actualización de seguridad completada</div>
                      <div className="activity-time">Hace 15 minutos</div>
                    </div>
                    <div className="activity-status">Completado</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <FaNetworkWired />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Pico de tráfico detectado</div>
                      <div className="activity-time">Hace 30 minutos</div>
                    </div>
                    <div className="activity-status warning">Monitorizado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="metrics-section">
            <div className="metrics-header">
              <div className="header-content">
                <div className="metrics-title">
                  <div className="metrics-icon">
                    <FaChartLine />
                  </div>
                  <div className="metrics-title-text">
                    <h1>Métricas de Seguridad</h1>
                    <p>Monitoreo de recursos AWS</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="metrics-container">
              <Seguridad 
                onAddMetric={() => setShowCloudWatchManager(true)}
                onRemoveMetric={handleRemoveMetric}
                onMetricUpdate={handleMetricUpdate}
                metrics={dashboardMetrics}
                isAwsConnected={isAwsConnected}
                currentValues={metricsValues}
              />
            </div>

            {showCloudWatchManager && (
              <CloudWatchManager
                isOpen={showCloudWatchManager}
                onClose={() => setShowCloudWatchManager(false)}
                onAddMetric={handleAddMetric}
              />
            )}
          </div>
        );
      case 'security':
        return (
          <div className="security-section">
            <div className="content-header">
              <h1 className="content-title">Seguridad</h1>
            </div>
            <div className="widget">
              <h3>Panel de Seguridad</h3>
              <p>Sección en desarrollo...</p>
            </div>
          </div>
        );
      case 'aws':
        return (
          <div className="aws-section">
            <div className="content-header">
              <h1 className="content-title">Servicios AWS</h1>
              <button 
                className={`connect-aws-btn ${isAwsConnected ? 'connected' : ''}`} 
                onClick={() => setIsAwsModalOpen(true)}
              >
                <FaAws />
                {isAwsConnected ? 'Desconectar de AWS' : 'Conectar con AWS'}
              </button>
            </div>
            
            {isAwsConnected ? (
              <div className="aws-services">
                <div className="service-category">
                  <h3>Seguridad y Accesos</h3>
                  <div className="services-grid">
                    {/* EC2 Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaServer />
                        </div>
                        <div className={`service-status ${awsServices.ec2 ? 'active' : 'inactive'}`}>
                          {awsServices.ec2 ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">EC2</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Instancias Activas</span>
                          <span className="stat-value">{awsServices.ec2 ? '5' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Security Groups</span>
                          <span className="stat-value">{awsServices.ec2 ? '3' : '-'}</span>
                        </div>
                      </div>
                      <button 
                        className="service-action-btn" 
                        disabled={!isAwsConnected}
                        onClick={() => {
                          console.log('EC2 Button Clicked');
                          console.log('AWS Connection Status:', isAwsConnected);
                          setIsEC2ManagerOpen(true);
                        }}
                      >
                        Gestionar
                      </button>
                    </div>

                    {/* IAM Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaUsers />
                        </div>
                        <div className={`service-status ${awsServices.iam ? 'active' : 'inactive'}`}>
                          {awsServices.iam ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">IAM</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Usuarios</span>
                          <span className="stat-value">{awsServices.iam ? '5' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Roles</span>
                          <span className="stat-value">{awsServices.iam ? '3' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.iam}>
                        Gestionar
                      </button>
                    </div>

                    {/* GuardDuty Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaShieldAlt />
                        </div>
                        <div className={`service-status ${awsServices.guardduty ? 'active' : 'inactive'}`}>
                          {awsServices.guardduty ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">GuardDuty</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Amenazas Detectadas</span>
                          <span className="stat-value">{awsServices.guardduty ? '0' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Regiones Monitorizadas</span>
                          <span className="stat-value">{awsServices.guardduty ? '6' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.guardduty}>
                        Gestionar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="service-category">
                  <h3>Infraestructura y Red</h3>
                  <div className="services-grid">
                    {/* VPC Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaNetworkWired />
                        </div>
                        <div className={`service-status ${awsServices.vpc ? 'active' : 'inactive'}`}>
                          {awsServices.vpc ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">VPC</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">ACLs</span>
                          <span className="stat-value">{awsServices.vpc ? '6' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Subnets Seguras</span>
                          <span className="stat-value">{awsServices.vpc ? '4' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.vpc}>
                        Gestionar
                      </button>
                    </div>

                    {/* S3 Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaServer />
                        </div>
                        <div className={`service-status ${awsServices.s3 ? 'active' : 'inactive'}`}>
                          {awsServices.s3 ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">S3</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Buckets Encriptados</span>
                          <span className="stat-value">{awsServices.s3 ? '15' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Políticas de Acceso</span>
                          <span className="stat-value">{awsServices.s3 ? '10' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.s3}>
                        Gestionar
                      </button>
                    </div>

                    {/* Nuevo: ECS Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaDocker />
                        </div>
                        <div className={`service-status ${awsServices.ecs ? 'active' : 'inactive'}`}>
                          {awsServices.ecs ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">ECS</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Clusters Activos</span>
                          <span className="stat-value">{awsServices.ecs ? '3' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Contenedores</span>
                          <span className="stat-value">{awsServices.ecs ? '12' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.ecs}>
                        Gestionar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="service-category">
                  <h3>Monitoreo y Alertas</h3>
                  <div className="services-grid">
                    {/* CloudWatch Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaChartLine />
                        </div>
                        <div className={`service-status ${awsServices.cloudwatch ? 'active' : 'inactive'}`}>
                          {awsServices.cloudwatch ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">CloudWatch</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Alarmas Activas</span>
                          <span className="stat-value">{awsServices.cloudwatch ? '0' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Logs Monitorizados</span>
                          <span className="stat-value">{awsServices.cloudwatch ? '0' : '-'}</span>
                        </div>
                      </div>
                      <button 
                        className="service-action-btn" 
                        onClick={() => setShowCloudWatchManager(true)}
                      >
                        Gestionar
                      </button>
                    </div>

                    {/* Nuevo: AWS Config Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaCog />
                        </div>
                        <div className={`service-status ${awsServices.config ? 'active' : 'inactive'}`}>
                          {awsServices.config ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">AWS Config</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Reglas Activas</span>
                          <span className="stat-value">{awsServices.config ? '8' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Evaluaciones</span>
                          <span className="stat-value">{awsServices.config ? '24' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.config}>
                        Gestionar
                      </button>
                    </div>

                    {/* Nuevo: EventBridge Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaBolt />
                        </div>
                        <div className={`service-status ${awsServices.eventbridge ? 'active' : 'inactive'}`}>
                          {awsServices.eventbridge ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">EventBridge</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Buses de Eventos</span>
                          <span className="stat-value">{awsServices.eventbridge ? '4' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Reglas</span>
                          <span className="stat-value">{awsServices.eventbridge ? '16' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.eventbridge}>
                        Gestionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aws-not-connected">
                <FaAws className="aws-big-icon" />
                <h2>No conectado a AWS</h2>
                <p>Conecta tu cuenta de AWS para ver y gestionar tus servicios.</p>
                <button 
                  className="connect-aws-btn" 
                  onClick={() => setIsAwsModalOpen(true)}
                >
                  Conectar con AWS
                </button>
              </div>
            )}
          </div>
        );
      case 'alerts':
        return (
          <div className="alerts-section">
            <div className="content-header">
              <h1 className="content-title">Alertas</h1>
            </div>
            <div className="widget">
              <h3>Centro de Alertas</h3>
              <p>Sección en desarrollo...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="nav-menu">
            <li className={`nav-item ${currentSection === 'dashboard' ? 'active' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => handleSectionChange('dashboard', e)}>
                <FaHome />
                <span>Panel Principal</span>
              </a>
            </li>
            
            <li className={`nav-item ${currentSection === 'metrics' ? 'active' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => handleSectionChange('metrics', e)}>
                <FaChartBar />
                <span>Métricas</span>
              </a>
            </li>
            
            <li className={`nav-item ${currentSection === 'security' ? 'active' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => handleSectionChange('security', e)}>
                <FaLock />
                <span>Seguridad</span>
              </a>
            </li>
            
            <li className={`nav-item ${currentSection === 'alerts' ? 'active' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => handleSectionChange('alerts', e)}>
                <FaBell />
                <span>Alertas</span>
              </a>
            </li>

            {/* Sección de Integraciones movida al final */}
            <li className={`nav-item has-submenu ${expandedMenus.integrations ? 'expanded' : ''}`}>
              <a href="#" className="nav-link" onClick={(e) => toggleSubmenu('integrations', e)}>
                <FaCloud />
                <span>Integraciones</span>
              </a>
              <ul className="submenu">
                <li className={`nav-item ${currentSection === 'aws' ? 'active' : ''}`}>
                  <a href="#" className="nav-link" onClick={(e) => handleSectionChange('aws', e)}>
                    <FaAws />
                    <span>AWS</span>
                  </a>
                </li>
                <li className={`nav-item ${currentSection === 'azure' ? 'active' : ''}`}>
                  <a href="#" className="nav-link" onClick={(e) => handleSectionChange('azure', e)}>
                    <FaMicrosoft />
                    <span>Azure</span>
                  </a>
                </li>
                <li className={`nav-item ${currentSection === 'gcp' ? 'active' : ''}`}>
                  <a href="#" className="nav-link" onClick={(e) => handleSectionChange('gcp', e)}>
                    <FaGoogle />
                    <span>Google Cloud</span>
                  </a>
                </li>
                <li className={`nav-item ${currentSection === 'other' ? 'active' : ''}`}>
                  <a href="#" className="nav-link" onClick={(e) => handleSectionChange('other', e)}>
                    <FaCloudversify />
                    <span>Otros Servicios</span>
                  </a>
                </li>
              </ul>
            </li>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* AWS Connect Modal */}
      <AwsConnectModal 
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        onConnect={handleAwsConnection}
        isConnected={isAwsConnected}
      />

      {/* EC2 Manager Modal */}
      <EC2Manager 
        isOpen={isEC2ManagerOpen}
        onClose={() => setIsEC2ManagerOpen(false)}
      />

      {/* CloudWatch Manager Modal */}
      {showCloudWatchManager && (
        <CloudWatchManager
          isOpen={showCloudWatchManager}
          onClose={() => setShowCloudWatchManager(false)}
          onAddMetric={handleAddMetric}
        />
      )}
    </div>
  );
};

export default Dashboard; 
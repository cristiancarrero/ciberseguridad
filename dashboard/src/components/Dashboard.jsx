import React, { useState, useEffect, useCallback } from 'react';
import { FaShieldAlt, FaServer, FaUsers, FaNetworkWired, FaDownload, FaHome, FaChartBar, FaLock, FaAws, FaBell, FaCloud, FaMicrosoft, FaGoogle, FaCloudversify, FaDocker, FaCog, FaBolt, FaChartLine, FaHistory, FaTimes } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Importar estilos
import '../styles/variables.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components/navbar.css';
import '../styles/components/widgets.css';
import '../styles/components/charts.css';
import '../styles/components/metrics.css';
import '../styles/components/modal.css';
import '../styles/responsive.css';
import '../styles/dashboard.css';

// Importar el modal y sus estilos
import AwsConnectModal from './aws/components/AwsConnectModal';
import AwsDisconnectModal from './aws/components/AwsDisconnectModal';
import EC2Manager from './EC2Manager';
import { connectToAWS, disconnectFromAWS, isConnectedToAWS, loadAwsConfig } from '../services/awsService';
import CloudWatchPanel from './aws/services/cloudwatch/CloudWatchPanel';
import Seguridad from './Seguridad';
import { useMetricsPersistence } from '../hooks/useMetricsPersistence';
import VPCManager from './aws/services/vpc/VPCManager';
import CloudTrailManager from './aws/services/cloudtrail/CloudTrailManager';
import { initializeCloudWatch } from './aws/services/cloudwatch/services/cloudwatchService';
import S3Manager from './aws/services/s3/S3Manager';
import GCPView from './gcp/GCPView';
import AzureView from './azure/AzureView';
import GuardDutyManager from './aws/services/guardduty/GuardDutyManager';
import AWSServiceWidget from './AWSServiceWidget';
import SSMManager from './aws/services/SSM/SSMManager';

const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState(() => {
    return localStorage.getItem('currentSection') || 'dashboard';
  });
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
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
      cloudtrail: false,
      guardduty: false,
      ecs: false,
      config: false,
      eventbridge: false,
      ssm: false
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    cpu: 0,
    memory: 0,
    network: 0
  });

  // Añadimos el estado para securityData
  const [securityData, setSecurityData] = useState({
    threats: 0,
    vulnerabilities: 0,
    incidents: 0,
    status: 'Normal'
  });

  const [isVPCManagerOpen, setIsVPCManagerOpen] = useState(false);
  const [showCloudTrailManager, setShowCloudTrailManager] = useState(false);
  const [isCloudWatchOpen, setIsCloudWatchOpen] = useState(() => {
    const saved = localStorage.getItem('isCloudWatchOpen');
    return saved ? JSON.parse(saved) : false;
  });

  const [showS3Manager, setShowS3Manager] = useState(false);
  const [showGuardDutyManager, setShowGuardDutyManager] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

  // Guardar el estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('isCloudWatchOpen', JSON.stringify(isCloudWatchOpen));
  }, [isCloudWatchOpen]);

  // Manejar la tecla ESC para cerrar el panel
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsCloudWatchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleCloseCloudWatch = () => {
    setIsCloudWatchOpen(false);
    localStorage.setItem('isCloudWatchOpen', 'false');
  };

  const handleOpenCloudWatch = () => {
    setIsCloudWatchOpen(true);
    localStorage.setItem('isCloudWatchOpen', 'true');
  };

  useEffect(() => {
    // Cargar la configuración de AWS al montar el componente
    if (isAwsConnected) {
      try {
        const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
        if (awsConfig) {
          console.log('Inicializando servicios AWS...');
          window.awsCredentials = awsConfig;
          initializeCloudWatch(awsConfig);
        }
      } catch (error) {
        console.error('Error al cargar configuración AWS:', error);
      }
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

  const handleAwsConnection = useCallback(async (credentials) => {
    if (!isAwsConnected) {
      try {
        console.log('Iniciando conexión con AWS...');
        const connected = await connectToAWS(credentials);
        
        if (!connected) {
          throw new Error('No se pudo establecer la conexión con AWS');
        }

        // Formatear las credenciales en el formato correcto
        const formattedConfig = {
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
          },
          region: credentials.region || 'us-west-2'
        };

        // Guardar las credenciales formateadas
        localStorage.setItem('awsConfig', JSON.stringify(formattedConfig));
        window.awsCredentials = formattedConfig;

        // Inicializar servicios
        initializeCloudWatch(formattedConfig);

        setIsAwsConnected(true);
        localStorage.setItem('awsConnected', 'true');
        setIsAwsModalOpen(false);

        // Actualizar el estado de los servicios
        setAwsServices(prev => ({
          ...prev,
          guardduty: true,
          ssm: true
        }));

        return true;
      } catch (error) {
        console.error('Error connecting to AWS:', error);
        return false;
      }
    }
    return false;
  }, [isAwsConnected]);

  const handleAwsDisconnection = async () => {
    try {
      await disconnectFromAWS();
      setIsAwsConnected(false);
      localStorage.removeItem('awsConnected');
      setIsDisconnectModalOpen(false);
    } catch (error) {
      console.error('Error disconnecting from AWS:', error);
    }
  };

  const toggleAwsModal = () => {
    if (isAwsConnected) {
      // Si estamos conectados, mostrar modal de desconexión
      setIsDisconnectModalOpen(true);
    } else {
      // Si no estamos conectados, mostrar modal de conexión
      setIsAwsModalOpen(true);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testEC2Connection();
      console.log('EC2 Connection Test Result:', result);
    } catch (error) {
      console.error('Test Connection Error:', error);
    }
  };

  const handleAddMetric = (metric) => {
    console.log('Dashboard: Añadiendo métrica:', metric);
    addMetric(metric);
  };

  const handleRemoveMetric = (index) => {
    console.log('Dashboard: Eliminando métrica:', index);
    removeMetric(index);
  };

  const handleMetricUpdate = (index, value) => {
    console.log('Dashboard: Actualizando valor de métrica:', { index, value });
    updateMetricValue(index, value);
  };

  useEffect(() => {
    return () => {
      // Limpiar cualquier operación pendiente al desmontar
      setIsAwsModalOpen(false);
      setIsDisconnectModalOpen(false);
    };
  }, []);

  // Añadir efecto para reinicializar servicios cuando se recarga la página
  useEffect(() => {
    if (isAwsConnected) {
      const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
      if (awsConfig) {
        window.awsCredentials = awsConfig;
        console.log('Credenciales cargadas:', awsConfig);
        // Verificar si las credenciales han expirado
        if (awsConfig.credentials.expiration) {
          const expirationDate = new Date(awsConfig.credentials.expiration);
          if (expirationDate < new Date()) {
            console.log('Credenciales expiradas, desconectando...');
            setIsAwsConnected(false);
            localStorage.removeItem('awsConfig');
            localStorage.setItem('awsConnected', 'false');
            window.awsCredentials = null;
            return;
          }
        }
        try {
          initializeCloudWatch(awsConfig);
        } catch (error) {
          console.error('Error al inicializar CloudWatch:', error);
        }
      }
    }
  }, [isAwsConnected]);

  // Añadir manejador para errores de autenticación
  const handleAuthError = useCallback(() => {
    setIsAwsConnected(false);
    localStorage.removeItem('awsConfig');
    localStorage.setItem('awsConnected', 'false');
    setIsAwsModalOpen(true);
  }, []);

  // Función para cerrar el S3Manager
  const handleCloseS3Manager = () => {
    console.log('Dashboard: Cerrando S3Manager');
    setShowS3Manager(false);
  };

  const renderContent = () => {
    switch(currentSection) {
      case 'dashboard':
        return (
          <div className="dashboard-section">
            <div className="aws-services-header">
              <h1 className="aws-services-title">Panel Principal</h1>
            </div>
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
            <div className="aws-services-header">
              <h1 className="aws-services-title">Métricas de Seguridad</h1>
            </div>
            <div className="metrics-container">
              <Seguridad 
                metrics={dashboardMetrics}
                onAddMetric={handleAddMetric}
                onRemoveMetric={handleRemoveMetric}
                onMetricUpdate={handleMetricUpdate}
                isAwsConnected={isAwsConnected}
              />
            </div>

            {showCloudWatchManager && (
              <CloudWatchPanel
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
            <div className="aws-services-header">
              <h1 className="aws-services-title">Seguridad</h1>
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
            <div className="aws-services-header">
              <h1 className="aws-services-title">Servicios AWS</h1>
            </div>
            
            <div className="aws-services-subheader">
              {isAwsConnected && (
                <button 
                  className="disconnect-aws-btn"
                  onClick={handleAwsDisconnection}
                >
                  Desconectar
                </button>
              )}
            </div>
            
            {isAwsConnected && (
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
                        onClick={() => setIsEC2ManagerOpen(true)}
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
                      <button className="service-action-btn">
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
                          <span className="stat-value">{awsServices.guardduty ? '6' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Alta Severidad</span>
                          <span className="stat-value">{awsServices.guardduty ? '1' : '-'}</span>
                        </div>
                      </div>
                      <button 
                        className="service-action-btn"
                        onClick={() => setShowGuardDutyManager(true)}
                      >
                        Gestionar
                      </button>
                    </div>

                    {/* SSM Widget */}
                    <div className="aws-service-widget">
                      <div className="widget-header">
                        <div className="service-icon">
                          <FaCog />
                        </div>
                        <div className={`service-status ${awsServices.ssm ? 'active' : 'inactive'}`}>
                          {awsServices.ssm ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">Systems Manager</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Parches Pendientes</span>
                          <span className="stat-value">{awsServices.ssm ? '3' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Recursos Gestionados</span>
                          <span className="stat-value">{awsServices.ssm ? '5' : '-'}</span>
                        </div>
                      </div>
                      <button 
                        className="service-action-btn"
                        onClick={() => setSelectedService('ssm')}
                      >
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
                        <div className={`service-status ${isAwsConnected ? 'active' : 'inactive'}`}>
                          {isAwsConnected ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">VPC</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">ACLs</span>
                          <span className="stat-value">{isAwsConnected ? '6' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Subnets Seguras</span>
                          <span className="stat-value">{isAwsConnected ? '4' : '-'}</span>
                        </div>
                      </div>
                      <button 
                        className="service-action-btn"
                        onClick={() => setIsVPCManagerOpen(true)}
                        disabled={!isAwsConnected}
                      >
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
                      <button 
                        className="service-action-btn"
                        onClick={() => setShowS3Manager(true)}
                        disabled={!isAwsConnected}
                      >
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
                      <button className="service-action-btn">
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
                        onClick={handleOpenCloudWatch}
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
                      <button className="service-action-btn">
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
                      <button className="service-action-btn">
                        Gestionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* CloudTrail Widget */}
                <div className="aws-service-widget">
                  <div className="widget-header">
                    <div className="service-icon">
                      <FaHistory />
                    </div>
                    <div className={`service-status ${awsServices.cloudtrail ? 'active' : 'inactive'}`}>
                      {awsServices.cloudtrail ? 'Conectado' : 'Desconectado'}
                    </div>
                  </div>
                  <h3 className="service-title">CloudTrail</h3>
                  <div className="service-stats">
                    <div className="stat-item">
                      <span className="stat-label">Eventos Registrados</span>
                      <span className="stat-value">{awsServices.cloudtrail ? '150' : '-'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Últimas 24h</span>
                      <span className="stat-value">{awsServices.cloudtrail ? '25' : '-'}</span>
                    </div>
                  </div>
                  <button 
                    className="service-action-btn"
                    onClick={() => setShowCloudTrailManager(true)}
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            )}

            {/* Modal de GuardDuty */}
            {showGuardDutyManager && (
              <GuardDutyManager
                isOpen={showGuardDutyManager}
                onClose={() => setShowGuardDutyManager(false)}
              />
            )}

            {!isAwsConnected && (
              <div className="aws-not-connected">
                <FaAws className="aws-big-icon" />
                <h2>No conectado a AWS</h2>
                <p>Conecta tu cuenta de AWS para ver y gestionar tus servicios.</p>
                <button 
                  className="connect-aws-btn" 
                  onClick={toggleAwsModal}
                >
                  Conectar con AWS
                </button>
              </div>
            )}
          </div>
        );
      case 'gcp':
        return (
          <div className="cloud-section">
            <div className="aws-services-header">
              <h1 className="aws-services-title">Servicios Google Cloud</h1>
            </div>
            <GCPView />
          </div>
        );
      case 'azure':
        return (
          <div className="cloud-section">
            <div className="aws-services-header">
              <h1 className="aws-services-title">Servicios Azure</h1>
            </div>
            <AzureView />
          </div>
        );
      case 'alerts':
        return (
          <div className="alerts-section">
            <div className="aws-services-header">
              <h1 className="aws-services-title">Centro de Alertas</h1>
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
      {isAwsModalOpen && !isAwsConnected && (
        <AwsConnectModal
          isOpen={isAwsModalOpen}
          onClose={() => setIsAwsModalOpen(false)}
          onConnect={handleAwsConnection}
        />
      )}

      {/* EC2 Manager Modal */}
      <EC2Manager 
        isOpen={isEC2ManagerOpen}
        onClose={() => setIsEC2ManagerOpen(false)}
      />

      {/* CloudWatch Manager Modal */}
      {isCloudWatchOpen && (
        <CloudWatchPanel
          isOpen={isCloudWatchOpen}
          onClose={handleCloseCloudWatch}
          onAddMetric={handleAddMetric}
        />
      )}

      {/* VPC Manager Modal */}
      {isVPCManagerOpen && (
        <VPCManager 
          isOpen={isVPCManagerOpen}
          onClose={() => setIsVPCManagerOpen(false)}
        />
      )}

      {/* Modal de desconexión */}
      {isDisconnectModalOpen && isAwsConnected && (
        <AwsDisconnectModal
          isOpen={isDisconnectModalOpen}
          onClose={() => setIsDisconnectModalOpen(false)}
          onDisconnect={handleAwsDisconnection}
        />
      )}

      {/* CloudTrail Manager Modal */}
      {showCloudTrailManager && (
        <CloudTrailManager
          isOpen={showCloudTrailManager}
          onClose={() => setShowCloudTrailManager(false)}
        />
      )}

      {/* S3 Manager Modal */}
      {showS3Manager && (
        <div className="modal-overlay">
          <div className="modal-container">
            <S3Manager 
              onClose={handleCloseS3Manager}
              isOpen={showS3Manager}
            />
          </div>
        </div>
      )}

      {/* Añadir el modal de SSM */}
      {selectedService === 'ssm' && (
        <SSMManager
          isOpen={true}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default Dashboard; 
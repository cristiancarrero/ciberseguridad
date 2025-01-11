import React, { useState } from 'react';
import { FaShieldAlt, FaServer, FaUsers, FaNetworkWired, FaDownload, FaHome, FaChartBar, FaLock, FaAws, FaBell, FaCloud, FaMicrosoft, FaGoogle, FaCloudversify, FaDocker, FaCog, FaBolt } from 'react-icons/fa';
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
    setIsAwsConnected(success);
    localStorage.setItem('awsConnected', success);
    
    if (success) {
      try {
        const availableServices = await checkAwsServices();
        setAwsServices(availableServices);
        localStorage.setItem('awsServices', JSON.stringify(availableServices));
      } catch (error) {
        console.error('Error checking AWS services:', error);
        const defaultServices = {
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
        setAwsServices(defaultServices);
        localStorage.setItem('awsServices', JSON.stringify(defaultServices));
      }
    } else {
      const defaultServices = {
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
      setAwsServices(defaultServices);
      localStorage.setItem('awsServices', JSON.stringify(defaultServices));
    }
    
    setIsAwsModalOpen(false);
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
            <div className="content-header">
              <h1 className="content-title">Métricas de Seguridad</h1>
              <div className="time-range">
                <button className="time-btn active">24h</button>
                <button className="time-btn">7d</button>
                <button className="time-btn">30d</button>
                <button className="time-btn">90d</button>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="widgets-grid main-widgets">
              <div className="widget metric-widget">
                <div className="metric-header">
                  <div className="metric-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="metric-trend positive">+5%</div>
                </div>
                <div className="metric-value">99.9%</div>
                <div className="metric-label">Uptime de Seguridad</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={uptimeData}>
                      <Line type="monotone" dataKey="value" stroke="#4ecdc4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="widget metric-widget">
                <div className="metric-header">
                  <div className="metric-icon warning">
                    <FaShieldAlt />
                  </div>
                  <div className="metric-trend negative">+12</div>
                </div>
                <div className="metric-value">47</div>
                <div className="metric-label">Intentos de Intrusión</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={intrusionData}>
                      <Line type="monotone" dataKey="value" stroke="#ff6b6b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="widget metric-widget">
                <div className="metric-header">
                  <div className="metric-icon success">
                    <FaLock />
                  </div>
                  <div className="metric-trend positive">-25ms</div>
                </div>
                <div className="metric-value">128ms</div>
                <div className="metric-label">Latencia de Respuesta</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={latencyData}>
                      <Line type="monotone" dataKey="value" stroke="#4ecdc4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="widget metric-widget">
                <div className="metric-header">
                  <div className="metric-icon danger">
                    <FaBell />
                  </div>
                  <div className="metric-trend negative">+8</div>
                </div>
                <div className="metric-value">23</div>
                <div className="metric-label">Alertas Activas</div>
                <div className="metric-chart">
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={alertsData}>
                      <Line type="monotone" dataKey="value" stroke="#ff6b6b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráficos detallados */}
            <div className="widgets-grid secondary-widgets">
              {/* Distribución de Amenazas */}
              <div className="widget chart-widget">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Distribución de Amenazas</h3>
                    <div className="chart-subtitle">Por tipo de ataque</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threatData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4ecdc4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rendimiento de Seguridad */}
              <div className="widget chart-widget">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Rendimiento de Seguridad</h3>
                    <div className="chart-subtitle">Tiempo de respuesta vs Amenazas</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="response" stroke="#4ecdc4" name="Tiempo de Respuesta" />
                    <Line type="monotone" dataKey="threats" stroke="#ff6b6b" name="Amenazas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Lista de Eventos */}
              <div className="widget events-widget">
                <div className="chart-header">
                  <h3 className="chart-title">Eventos de Seguridad</h3>
                </div>
                <div className="events-list">
                  <div className="event-item">
                    <div className="event-severity high"></div>
                    <div className="event-content">
                      <div className="event-title">Intento de SQL Injection detectado</div>
                      <div className="event-details">IP: 192.168.1.100 | Endpoint: /api/users</div>
                    </div>
                    <div className="event-time">12:45</div>
                  </div>
                  <div className="event-item">
                    <div className="event-severity medium"></div>
                    <div className="event-content">
                      <div className="event-title">Múltiples intentos de login fallidos</div>
                      <div className="event-details">Usuario: admin | IP: 192.168.1.150</div>
                    </div>
                    <div className="event-time">12:30</div>
                  </div>
                  <div className="event-item">
                    <div className="event-severity low"></div>
                    <div className="event-content">
                      <div className="event-title">Certificado SSL próximo a expirar</div>
                      <div className="event-details">Dominio: api.example.com | 15 días restantes</div>
                    </div>
                    <div className="event-time">12:15</div>
                  </div>
                </div>
              </div>
            </div>
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
                      <button className="service-action-btn" disabled={!awsServices.ec2}>
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
                          <FaChartBar />
                        </div>
                        <div className={`service-status ${awsServices.cloudwatch ? 'active' : 'inactive'}`}>
                          {awsServices.cloudwatch ? 'Conectado' : 'Desconectado'}
                        </div>
                      </div>
                      <h3 className="service-title">CloudWatch</h3>
                      <div className="service-stats">
                        <div className="stat-item">
                          <span className="stat-label">Alarmas Activas</span>
                          <span className="stat-value">{awsServices.cloudwatch ? '8' : '-'}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Logs Monitorizados</span>
                          <span className="stat-value">{awsServices.cloudwatch ? '24' : '-'}</span>
                        </div>
                      </div>
                      <button className="service-action-btn" disabled={!awsServices.cloudwatch}>
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
    </div>
  );
};

// Datos de ejemplo para los gráficos
const performanceData = [
  { name: '00:00', EC2: 400, RDS: 240, S3: 180 },
  { name: '04:00', EC2: 300, RDS: 139, S3: 220 },
  { name: '08:00', EC2: 200, RDS: 980, S3: 290 },
  { name: '12:00', EC2: 278, RDS: 390, S3: 200 },
  { name: '16:00', EC2: 189, RDS: 480, S3: 310 },
  { name: '20:00', EC2: 239, RDS: 380, S3: 250 },
  { name: '24:00', EC2: 349, RDS: 430, S3: 280 },
];

const securityData = [
  { name: 'Lun', alta: 4, media: 3, baja: 2 },
  { name: 'Mar', alta: 3, media: 4, baja: 3 },
  { name: 'Mie', alta: 2, media: 3, baja: 4 },
  { name: 'Jue', alta: 3, media: 3, baja: 3 },
  { name: 'Vie', alta: 4, media: 4, baja: 2 },
  { name: 'Sab', alta: 3, media: 3, baja: 3 },
  { name: 'Dom', alta: 2, media: 2, baja: 4 },
];

// Datos de ejemplo para las métricas
const uptimeData = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  value: 99.5 + Math.random() * 0.5
}));

const intrusionData = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  value: 30 + Math.random() * 30
}));

const latencyData = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  value: 100 + Math.random() * 50
}));

const alertsData = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  value: 15 + Math.random() * 15
}));

const threatData = [
  { name: 'SQL Injection', value: 45 },
  { name: 'XSS', value: 32 },
  { name: 'DDoS', value: 28 },
  { name: 'Brute Force', value: 25 },
  { name: 'MITM', value: 18 },
  { name: 'Otros', value: 15 }
];

export default Dashboard; 
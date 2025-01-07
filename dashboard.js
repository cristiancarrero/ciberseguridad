class DashboardManager {
    constructor() {
        // Verificar autenticación al inicio
        if (!this.checkAuth()) {
            window.location.replace('auth.html');
            return;
        }

        this.charts = {};
        this.currentSection = 'overview';
        
        // Inicializar todo
        this.initializeEventListeners();
        this.loadSection(this.currentSection);
        this.initializeCharts();
        this.loadMockData();
        this.initializeNotifications();
        this.initializeGlobalSearch();
    }

    checkAuth() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    initializeEventListeners() {
        // Manejar navegación del sidebar
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('href').substring(1);
                this.loadSection(section);
            });
        });

        // Manejar filtro de tiempo
        document.querySelector('.time-filter select').addEventListener('change', (e) => {
            this.updateChartsData(e.target.value);
        });

        // Manejar logout
        document.querySelector('.logout-btn').addEventListener('click', () => {
            if (window.authManager) {
                window.authManager.logout();
            } else {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                window.location.replace('auth.html');
            }
        });
    }

    loadSection(section) {
        // Actualizar navegación
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.classList.remove('active');
        });
        const activeLink = document.querySelector(`a[href="#${section}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }

        // Cargar el contenido correspondiente
        const mainContent = document.querySelector('.main-content');
        switch(section) {
            case 'overview':
                mainContent.innerHTML = this.getOverviewContent();
                this.initializeCharts();
                this.loadMockData();
                break;
            case 'alerts':
                mainContent.innerHTML = this.getAlertsContent();
                break;
            case 'logs':
                mainContent.innerHTML = this.getLogsContent();
                break;
            case 'threats':
                mainContent.innerHTML = this.getThreatsContent();
                break;
            case 'vulnerabilities':
                mainContent.innerHTML = this.getVulnerabilitiesContent();
                break;
            case 'compliance':
                mainContent.innerHTML = this.getComplianceContent();
                break;
            case 'reports':
                mainContent.innerHTML = this.getReportsContent();
                break;
            case 'incidents':
                mainContent.innerHTML = this.getIncidentsContent();
                break;
            case 'analytics':
                mainContent.innerHTML = this.getAnalyticsContent();
                break;
            case 'settings':
                mainContent.innerHTML = this.getSettingsContent();
                break;
            case 'integrations':
                mainContent.innerHTML = this.getIntegrationsContent();
                break;
        }
    }

    // Métodos para obtener el contenido de cada sección
    getOverviewContent() {
        return `
            <header class="section-header">
                <h1>Vista General</h1>
                <div class="time-filter">
                    <select>
                        <option>Últimas 24 horas</option>
                        <option>Última semana</option>
                        <option>Último mes</option>
                    </select>
                </div>
            </header>

            <div class="metrics-grid">
                <!-- Métricas principales -->
                <div class="metric-card">
                    <div class="metric-icon secure">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="metric-info">
                        <h3>Estado General</h3>
                        <p class="metric-value">Seguro</p>
                    </div>
                </div>
                <!-- ... otras metric-cards ... -->
            </div>

            <div class="charts-container">
                <div class="chart-card">
                    <h3>Actividad de Seguridad</h3>
                    <canvas id="securityChart"></canvas>
                </div>
                
                <div class="chart-card">
                    <h3>Distribución de Alertas</h3>
                    <canvas id="alertsChart"></canvas>
                </div>
            </div>

            <div class="recent-events">
                <h3>Últimos Eventos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Tipo</th>
                            <th>Recurso</th>
                            <th>Descripción</th>
                            <th>Severidad</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>`;
    }

    getAlertsContent() {
        return `
            <header class="section-header">
                <h1>Alertas en Tiempo Real</h1>
            </header>
            <div class="alerts-container">
                <!-- Contenido de alertas -->
            </div>`;
    }

    getLogsContent() {
        return `
            <header class="section-header">
                <h1>Logs del Sistema</h1>
                <div class="logs-filter">
                    <select>
                        <option>Todos los servicios</option>
                        <option>EC2</option>
                        <option>S3</option>
                        <option>RDS</option>
                    </select>
                </div>
            </header>
            <div class="logs-container">
                <div class="log-filters">
                    <input type="text" placeholder="Buscar en logs..." class="search-input">
                    <div class="filter-tags">
                        <span class="tag">Error</span>
                        <span class="tag">Warning</span>
                        <span class="tag">Info</span>
                    </div>
                </div>
                <div class="logs-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Servicio</th>
                                <th>Nivel</th>
                                <th>Mensaje</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2024-01-20 16:23:45</td>
                                <td>EC2</td>
                                <td><span class="log-level error">ERROR</span></td>
                                <td>Failed login attempt from unauthorized IP</td>
                                <td>192.168.1.100</td>
                            </tr>
                            <tr>
                                <td>2024-01-20 16:22:30</td>
                                <td>S3</td>
                                <td><span class="log-level warning">WARNING</span></td>
                                <td>Bucket policy modified</td>
                                <td>10.0.0.5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getThreatsContent() {
        return `
            <header class="section-header">
                <h1>Amenazas Detectadas</h1>
                <div class="threat-actions">
                    <button class="btn-primary">Escanear Ahora</button>
                </div>
            </header>
            <div class="threats-overview">
                <div class="threat-stats">
                    <div class="stat-card critical">
                        <h3>Críticas</h3>
                        <p>3</p>
                    </div>
                    <div class="stat-card high">
                        <h3>Altas</h3>
                        <p>7</p>
                    </div>
                    <div class="stat-card medium">
                        <h3>Medias</h3>
                        <p>12</p>
                    </div>
                    <div class="stat-card low">
                        <h3>Bajas</h3>
                        <p>24</p>
                    </div>
                </div>
                <div class="threats-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Amenaza</th>
                                <th>Tipo</th>
                                <th>Origen</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Malware Detectado</td>
                                <td>Ransomware</td>
                                <td>192.168.1.100</td>
                                <td><span class="status critical">Crítico</span></td>
                                <td><button class="btn-action">Mitigar</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getVulnerabilitiesContent() {
        return `
            <header class="section-header">
                <h1>Análisis de Vulnerabilidades</h1>
                <div class="vuln-actions">
                    <button class="btn-primary">Nuevo Análisis</button>
                </div>
            </header>
            <div class="vulnerabilities-container">
                <div class="scan-summary">
                    <div class="summary-card">
                        <h3>Último Análisis</h3>
                        <p>20 Enero 2024 15:30</p>
                    </div>
                    <div class="summary-card">
                        <h3>Vulnerabilidades Totales</h3>
                        <p>46</p>
                    </div>
                    <div class="summary-card">
                        <h3>Críticas</h3>
                        <p class="critical">5</p>
                    </div>
                </div>
                <div class="vuln-list">
                    <table>
                        <thead>
                            <tr>
                                <th>CVE</th>
                                <th>Severidad</th>
                                <th>Recurso Afectado</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>CVE-2024-1234</td>
                                <td><span class="severity critical">Crítica</span></td>
                                <td>nginx-server-01</td>
                                <td>No Parcheada</td>
                                <td><button class="btn-action">Parchear</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getComplianceContent() {
        return `
            <header class="section-header">
                <h1>Compliance</h1>
            </header>
            <div class="compliance-container">
                <div class="compliance-summary">
                    <div class="compliance-score">
                        <h3>Puntuación General</h3>
                        <div class="score-circle">85%</div>
                    </div>
                    <div class="frameworks">
                        <h3>Frameworks</h3>
                        <div class="framework-list">
                            <div class="framework-item">
                                <span>ISO 27001</span>
                                <div class="progress-bar">
                                    <div class="progress" style="width: 90%"></div>
                                </div>
                            </div>
                            <div class="framework-item">
                                <span>GDPR</span>
                                <div class="progress-bar">
                                    <div class="progress" style="width: 85%"></div>
                                </div>
                            </div>
                            <div class="framework-item">
                                <span>PCI DSS</span>
                                <div class="progress-bar">
                                    <div class="progress" style="width: 95%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getReportsContent() {
        return `
            <header class="section-header">
                <h1>Informes de Seguridad</h1>
                <div class="report-actions">
                    <button class="btn-primary">Generar Informe</button>
                </div>
            </header>
            <div class="reports-container">
                <div class="report-filters">
                    <select>
                        <option>Todos los tipos</option>
                        <option>Seguridad</option>
                        <option>Compliance</option>
                        <option>Auditoría</option>
                    </select>
                </div>
                <div class="reports-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2024-01-20</td>
                                <td>Seguridad</td>
                                <td>Informe Mensual de Seguridad</td>
                                <td><span class="status complete">Completado</span></td>
                                <td>
                                    <button class="btn-action">Descargar</button>
                                    <button class="btn-action">Ver</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        // Gráfico de actividad de seguridad
        const securityCtx = document.getElementById('securityChart').getContext('2d');
        this.charts.security = new Chart(securityCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Amenazas',
                        borderColor: '#4ecdc4',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: 'Ataques',
                        borderColor: '#ff6b6b',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 2,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 70,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 10,
                            stepSize: 10
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 10
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });

        // Gráfico de distribución de alertas
        const alertsCtx = document.getElementById('alertsChart').getContext('2d');
        this.charts.alerts = new Chart(alertsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Críticas', 'Altas', 'Medias', 'Bajas'],
                datasets: [{
                    data: [4, 8, 15, 16],
                    backgroundColor: [
                        '#ff6b6b',
                        '#ffd93d',
                        '#4ecdc4',
                        '#6bcb77'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    loadMockData() {
        // Datos de ejemplo para el gráfico de seguridad
        const timeLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        const threatData = [30, 45, 25, 60, 35, 45, 40, 50];
        const attackData = [15, 20, 10, 35, 15, 25, 20, 30];

        this.charts.security.data.labels = timeLabels;
        this.charts.security.data.datasets[0].data = threatData;
        this.charts.security.data.datasets[1].data = attackData;
        this.charts.security.update();

        // Cargar eventos recientes de ejemplo
        this.loadMockEvents();
    }

    loadMockEvents() {
        const tbody = document.querySelector('.recent-events table tbody');
        const mockEvents = [
            {
                timestamp: '2024-01-20 15:45:23',
                type: 'Intento de acceso no autorizado',
                resource: 'EC2-instance-01',
                description: 'Múltiples intentos de login fallidos',
                severity: 'Alta'
            },
            {
                timestamp: '2024-01-20 15:30:12',
                type: 'Vulnerabilidad detectada',
                resource: 'RDS-database-main',
                description: 'Puerto 3306 expuesto',
                severity: 'Media'
            },
            {
                timestamp: '2024-01-20 15:15:45',
                type: 'Cambio de configuración',
                resource: 'S3-bucket-logs',
                description: 'Modificación de política de acceso',
                severity: 'Baja'
            }
        ];

        tbody.innerHTML = mockEvents.map(event => `
            <tr>
                <td>${event.timestamp}</td>
                <td>${event.type}</td>
                <td>${event.resource}</td>
                <td>${event.description}</td>
                <td><span class="severity-${event.severity.toLowerCase()}">${event.severity}</span></td>
            </tr>
        `).join('');
    }

    updateChartsData(timeRange) {
        // Aquí se actualizarían los datos según el rango de tiempo seleccionado
        console.log(`Actualizando datos para rango: ${timeRange}`);
    }

    getIncidentsContent() {
        return `
            <header class="section-header">
                <h1>Gestión de Incidentes</h1>
                <div class="incident-actions">
                    <button class="btn-primary">Nuevo Incidente</button>
                </div>
            </header>
            <div class="incidents-container">
                <div class="incident-filters">
                    <select>
                        <option>Todos los estados</option>
                        <option>Abierto</option>
                        <option>En progreso</option>
                        <option>Resuelto</option>
                    </select>
                    <input type="text" placeholder="Buscar incidente..." class="search-input">
                </div>
                <div class="incidents-timeline">
                    <div class="timeline-item">
                        <div class="timeline-badge critical">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="incident-header">
                                <h3>Intento de Intrusión Detectado</h3>
                                <span class="status critical">Crítico</span>
                            </div>
                            <p>Múltiples intentos de acceso no autorizado desde IP sospechosa</p>
                            <div class="incident-meta">
                                <span><i class="fas fa-clock"></i> Hace 2 horas</span>
                                <span><i class="fas fa-user"></i> Asignado a: Equipo SOC</span>
                            </div>
                            <div class="incident-actions">
                                <button class="btn-action">Ver Detalles</button>
                                <button class="btn-action">Escalar</button>
                            </div>
                        </div>
                    </div>
                    <!-- Más incidentes aquí -->
                </div>
            </div>`;
    }

    getAnalyticsContent() {
        return `
            <header class="section-header">
                <h1>Analytics</h1>
                <div class="analytics-period">
                    <button class="btn-action active">7 días</button>
                    <button class="btn-action">30 días</button>
                    <button class="btn-action">90 días</button>
                </div>
            </header>
            <div class="analytics-grid">
                <div class="analytics-card wide">
                    <h3>Tendencias de Amenazas</h3>
                    <canvas id="threatTrendsChart"></canvas>
                </div>
                <div class="analytics-card">
                    <h3>Distribución de Ataques</h3>
                    <canvas id="attackDistributionChart"></canvas>
                </div>
                <div class="analytics-card">
                    <h3>Top Vulnerabilidades</h3>
                    <div class="vulnerability-list">
                        <div class="vuln-item">
                            <span class="vuln-name">SQL Injection</span>
                            <div class="vuln-bar">
                                <div class="vuln-progress" style="width: 75%"></div>
                            </div>
                            <span class="vuln-count">75%</span>
                        </div>
                        <!-- Más vulnerabilidades -->
                    </div>
                </div>
            </div>
            <div class="analytics-insights">
                <h3>Insights</h3>
                <div class="insights-grid">
                    <div class="insight-card">
                        <i class="fas fa-chart-line"></i>
                        <h4>Aumento en Ataques</h4>
                        <p>15% de incremento en intentos de acceso no autorizado</p>
                    </div>
                    <!-- Más insights -->
                </div>
            </div>`;
    }

    getSettingsContent() {
        return `
            <header class="section-header">
                <h1>Configuración</h1>
            </header>
            <div class="settings-container">
                <div class="settings-grid">
                    <div class="settings-section">
                        <h3>Notificaciones</h3>
                        <div class="settings-options">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Alertas Críticas</h4>
                                    <p>Notificaciones inmediatas para incidentes críticos</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>Reportes Diarios</h4>
                                    <p>Resumen diario de actividades</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>Seguridad</h3>
                        <div class="settings-options">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h4>2FA</h4>
                                    <p>Autenticación de dos factores</p>
                                </div>
                                <button class="btn-action">Configurar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    getIntegrationsContent() {
        return `
            <header class="section-header">
                <h1>Integraciones AWS</h1>
            </header>
            <div class="integrations-container">
                <div class="service-grid">
                    <div class="service-card">
                        <div class="service-header">
                            <img src="assets/ec2-icon.png" alt="EC2">
                            <h3>Amazon EC2</h3>
                        </div>
                        <p>Monitoreo de instancias y seguridad</p>
                        <div class="service-status connected">
                            <span>Conectado</span>
                            <button class="btn-action">Configurar</button>
                        </div>
                    </div>
                    <div class="service-card">
                        <div class="service-header">
                            <img src="assets/s3-icon.png" alt="S3">
                            <h3>Amazon S3</h3>
                        </div>
                        <p>Seguridad y acceso a buckets</p>
                        <div class="service-status">
                            <span>No conectado</span>
                            <button class="btn-primary">Conectar</button>
                        </div>
                    </div>
                    <!-- Más servicios AWS -->
                </div>
                <div class="integration-logs">
                    <h3>Registro de Actividad</h3>
                    <div class="log-entries">
                        <div class="log-entry">
                            <span class="timestamp">10:45:23</span>
                            <span class="message">Conexión exitosa con EC2</span>
                        </div>
                        <!-- Más logs -->
                    </div>
                </div>
            </div>`;
    }

    initializeNotifications() {
        const notificationSystem = `
            <div class="notification-center" style="display: none;">
                <div class="notification-header">
                    <h3>Notificaciones</h3>
                    <span class="notification-count">0</span>
                </div>
                <div class="notification-list"></div>
            </div>
            <button class="notification-toggle">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">0</span>
            </button>
        `;
        
        document.querySelector('.nav-actions').insertAdjacentHTML('afterbegin', notificationSystem);
        this.setupNotificationListeners();
    }

    initializeAdvancedCharts() {
        // Gráfico de mapa de calor para ataques
        const heatmapCtx = document.getElementById('attackHeatmap').getContext('2d');
        this.charts.heatmap = new Chart(heatmapCtx, {
            type: 'matrix',
            data: this.getHeatmapData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw.x} ataques detectados`
                        }
                    }
                }
            }
        });
    }

    initializeAdvancedFilters() {
        const filterSystem = `
            <div class="advanced-filters">
                <div class="filter-group">
                    <label>Período</label>
                    <input type="datetime-local" class="filter-date-start">
                    <input type="datetime-local" class="filter-date-end">
                </div>
                <div class="filter-group">
                    <label>Severidad</label>
                    <select multiple class="filter-severity">
                        <option value="critical">Crítica</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                </div>
                <button class="btn-primary apply-filters">Aplicar Filtros</button>
            </div>
        `;
    }

    generateReport(type = 'pdf') {
        const reportData = {
            title: 'Informe de Seguridad',
            date: new Date().toISOString(),
            metrics: this.getCurrentMetrics(),
            charts: this.getChartsData(),
            events: this.getRecentEvents()
        };

        // Implementar la generación del informe
        switch(type) {
            case 'pdf':
                this.generatePDFReport(reportData);
                break;
            case 'csv':
                this.generateCSVReport(reportData);
                break;
            case 'excel':
                this.generateExcelReport(reportData);
                break;
        }
    }

    initializeGlobalSearch() {
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.querySelector('.search-results');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            // Debounce para evitar muchas búsquedas
            searchTimeout = setTimeout(() => {
                this.performGlobalSearch(query);
            }, 300);
        });

        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.global-search')) {
                searchResults.style.display = 'none';
            }
        });
    }

    performGlobalSearch(query) {
        // Simular búsqueda en diferentes secciones
        const results = [
            ...this.searchInLogs(query),
            ...this.searchInIncidents(query),
            ...this.searchInVulnerabilities(query),
            ...this.searchInReports(query)
        ];

        this.displaySearchResults(results);
    }

    searchInLogs(query) {
        // Simulación de búsqueda en logs
        return [
            {
                type: 'Log',
                title: 'Error de autenticación',
                description: 'Intento fallido de acceso desde IP 192.168.1.100',
                timestamp: '2024-01-20 15:45:23',
                section: 'logs'
            }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    displaySearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item">
                    <p class="no-results">No se encontraron resultados</p>
                </div>`;
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" data-section="${result.section}">
                    <div class="result-type">${result.type}</div>
                    <div class="result-title">${result.title}</div>
                    <div class="result-description">${result.description}</div>
                    <div class="result-meta">${result.timestamp}</div>
                </div>
            `).join('');
        }

        searchResults.style.display = 'block';

        // Añadir event listeners a los resultados
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.loadSection(section);
                searchResults.style.display = 'none';
            });
        });
    }
}

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
}); 
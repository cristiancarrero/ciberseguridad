class DashboardManager {
    constructor() {
        this.map = null;
        this.chart = null;
        this.currentView = localStorage.getItem('currentView') || 'general';
        this.initializeEventListeners();
        this.loadView(this.currentView);
    }

    initializeEventListeners() {
        document.querySelectorAll('.sidebar-nav a').forEach(a => {
            if (a.getAttribute('data-view') === this.currentView) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        const controlPanelBtn = document.querySelector('.control-panel-btn');
        if (controlPanelBtn) {
            controlPanelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setCurrentView('general');
                this.loadView('general');
            });
        }

        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }
                
                document.querySelectorAll('.sidebar-nav a').forEach(a => {
                    a.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                this.setCurrentView(view);
                this.loadView(view);
            });
        });
    }

    setCurrentView(view) {
        this.currentView = view;
        localStorage.setItem('currentView', view);
    }

    loadView(view) {
        const mainContent = document.getElementById('view-container');
        if (!mainContent) return;

        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        mainContent.innerHTML = '';

        switch(view) {
            case 'general':
                mainContent.innerHTML = this.getGeneralView();
                this.initializeChart();
                break;
            case 'amenazas':
                mainContent.innerHTML = this.getAmenazasView();
                break;
            case 'vulnerabilidades':
                mainContent.innerHTML = this.getVulnerabilidadesView();
                break;
            case 'informes':
                mainContent.innerHTML = this.getInformesView();
                break;
            case 'configuracion':
                mainContent.innerHTML = this.getConfiguracionView();
                break;
        }
    }

    initializeChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        const data = {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [
                {
                    label: 'Amenazas',
                    data: [30, 45, 25, 60, 35, 45, 40, 50],
                    borderColor: '#4ecdc4',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Ataques',
                    data: [15, 20, 10, 35, 15, 25, 20, 30],
                    borderColor: '#ff6b6b',
                    tension: 0.4,
                    fill: false
                }
            ]
        };

        this.chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.textContent.toLowerCase();
                this.updateChartVisibility(filter);
                
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
            });
        });
    }

    updateChartVisibility(filter) {
        if (!this.chart) return;

        if (filter === 'todas') {
            this.chart.data.datasets[0].hidden = false;
            this.chart.data.datasets[1].hidden = false;
        } else if (filter === 'amenazas') {
            this.chart.data.datasets[0].hidden = false;
            this.chart.data.datasets[1].hidden = true;
        } else if (filter === 'ataques') {
            this.chart.data.datasets[0].hidden = true;
            this.chart.data.datasets[1].hidden = false;
        }

        this.chart.update();
    }

    initializeMap() {
        const mapContainer = document.getElementById('worldMap');
        if (!mapContainer) return;

        mapContainer.style.height = '500px';
        
        try {
            this.map = L.map('worldMap', {
                center: [20, 0],
                zoom: 2,
                minZoom: 2,
                maxZoom: 5,
                zoomControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: false,
                className: 'map-tiles'
            }).addTo(this.map);

            this.addSamplePoints();
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    geoJSONtoSVGPath(geoJSON) {
        let path = '';
        geoJSON.features.forEach(feature => {
            if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        path += 'M ' + ring.map(point => point.join(',')).join(' L ') + ' Z ';
                    });
                });
            }
        });
        return path;
    }

    addSamplePoints() {
        const attackPoints = [
            { lat: 40.7128, lng: -74.0060, type: 'attack' },  // New York
            { lat: 51.5074, lng: -0.1278, type: 'threat' },   // London
            { lat: 35.6762, lng: 139.6503, type: 'attack' },  // Tokyo
            { lat: -33.8688, lng: 151.2093, type: 'threat' }, // Sydney
            { lat: 52.5200, lng: 13.4050, type: 'attack' }    // Berlin
        ];

        attackPoints.forEach(point => {
            const color = point.type === 'attack' ? '#ff4757' : '#ffa502';
            
            L.circle([point.lat, point.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                radius: 100000
            }).addTo(this.map);

            L.circle([point.lat, point.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.1,
                radius: 300000,
                className: 'pulse-circle'
            }).addTo(this.map);
        });
    }

    getGeneralView() {
        return `
            <h1>Panel de Control</h1>
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Estado del Sistema</h3>
                        <p class="stat-value status-secure">Seguro</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Amenazas Hoy</h3>
                        <p class="stat-value">24</p>
                        <span class="stat-trend">↑ 12%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-globe"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Países Bloqueados</h3>
                        <p class="stat-value">15</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Servidores Activos</h3>
                        <p class="stat-value">8/8</p>
                        <span class="stat-status">Todos Operativos</span>
                    </div>
                </div>
            </div>

            <div class="activity-section">
                <div class="activity-header">
                    <h2>Actividad Global</h2>
                    <div class="activity-filters">
                        <button class="filter-btn active">Todas</button>
                        <button class="filter-btn">Amenazas</button>
                        <button class="filter-btn">Ataques</button>
                    </div>
                </div>
                
                <div class="activity-chart">
                    <canvas id="activityChart"></canvas>
                </div>

                <div class="activity-timeline">
                    <h3>Actividad Reciente</h3>
                    <div class="timeline-items">
                        <div class="timeline-item">
                            <div class="timeline-dot warning"></div>
                            <div class="timeline-content">
                                <p class="timeline-time">Hace 5 min</p>
                                <p class="timeline-text">Intento de acceso no autorizado desde IP: 192.168.1.1</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot danger"></div>
                            <div class="timeline-content">
                                <p class="timeline-time">Hace 15 min</p>
                                <p class="timeline-text">Ataque DDoS detectado y bloqueado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAmenazasView() {
        return `
            <h1>Panel de Amenazas</h1>
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Amenazas Activas</h3>
                        <p class="stat-number">12</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Nivel de Riesgo</h3>
                        <p class="stat-number">Medio</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Amenazas Bloqueadas</h3>
                        <p class="stat-number">85</p>
                    </div>
                </div>
            </div>

            <div class="threats-container">
                <div class="threats-list">
                    <h2>Últimas Amenazas Detectadas</h2>
                    <div class="threat-item high">
                        <div class="threat-header">
                            <span class="threat-severity">Alta</span>
                            <span class="threat-time">Hace 5 minutos</span>
                        </div>
                        <h3>Intento de DDoS</h3>
                        <div class="threat-details">
                            <p><i class="fas fa-globe"></i> Origen: China</p>
                            <p><i class="fas fa-server"></i> IP: 192.168.1.1</p>
                            <p><i class="fas fa-clock"></i> Duración: 2m 30s</p>
                        </div>
                        <div class="threat-actions">
                            <button class="btn-block">Bloquear IP</button>
                            <button class="btn-details">Ver Detalles</button>
                        </div>
                    </div>

                    <div class="threat-item medium">
                        <div class="threat-header">
                            <span class="threat-severity">Media</span>
                            <span class="threat-time">Hace 15 minutos</span>
                        </div>
                        <h3>Intento de SQL Injection</h3>
                        <div class="threat-details">
                            <p><i class="fas fa-globe"></i> Origen: Rusia</p>
                            <p><i class="fas fa-server"></i> IP: 192.168.1.2</p>
                            <p><i class="fas fa-clock"></i> Duración: 30s</p>
                        </div>
                        <div class="threat-actions">
                            <button class="btn-block">Bloquear IP</button>
                            <button class="btn-details">Ver Detalles</button>
                        </div>
                    </div>
                </div>

                <div class="threat-map">
                    <h2>Mapa de Amenazas en Tiempo Real</h2>
                    <div id="threatMap"></div>
                </div>
            </div>
        `;
    }

    getVulnerabilidadesView() {
        return `
            <h1>Análisis de Vulnerabilidades</h1>
            
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-bug"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Vulnerabilidades Críticas</h3>
                        <p class="stat-value">3</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Vulnerabilidades Medias</h3>
                        <p class="stat-value">8</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Sistemas Seguros</h3>
                        <p class="stat-value">85%</p>
                    </div>
                </div>
            </div>

            <div class="vulnerabilities-container">
                <div class="scan-section">
                    <div class="scan-header">
                        <h2>Estado del Escaneo</h2>
                        <button class="btn-scan">Iniciar Nuevo Escaneo</button>
                    </div>
                    <div class="scan-status">
                        <div class="progress-bar">
                            <div class="progress" style="width: 75%"></div>
                        </div>
                        <p>Último escaneo: Hace 2 horas</p>
                        <p>Tiempo estimado restante: 15 minutos</p>
                    </div>
                </div>

                <div class="vulnerabilities-list">
                    <h2>Vulnerabilidades Detectadas</h2>
                    <div class="vuln-item critical">
                        <div class="vuln-header">
                            <span class="vuln-severity">Crítica</span>
                            <span class="vuln-id">CVE-2023-1234</span>
                        </div>
                        <h3>SQL Injection Vulnerability</h3>
                        <div class="vuln-details">
                            <p><i class="fas fa-server"></i> Servidor: API-Server-01</p>
                            <p><i class="fas fa-code"></i> Endpoint: /api/users</p>
                            <p><i class="fas fa-clock"></i> Detectado: Hace 1 hora</p>
                        </div>
                        <div class="vuln-actions">
                            <button class="btn-patch">Aplicar Parche</button>
                            <button class="btn-details">Ver Detalles</button>
                        </div>
                    </div>

                    <div class="vuln-item medium">
                        <div class="vuln-header">
                            <span class="vuln-severity">Media</span>
                            <span class="vuln-id">CVE-2023-5678</span>
                        </div>
                        <h3>Cross-Site Scripting (XSS)</h3>
                        <div class="vuln-details">
                            <p><i class="fas fa-globe"></i> Aplicación: Frontend-App</p>
                            <p><i class="fas fa-file-code"></i> Archivo: login.js</p>
                            <p><i class="fas fa-clock"></i> Detectado: Hace 3 horas</p>
                        </div>
                        <div class="vuln-actions">
                            <button class="btn-patch">Aplicar Parche</button>
                            <button class="btn-details">Ver Detalles</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getInformesView() {
        return `
            <h1>Informes de Seguridad</h1>
            
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Informes Generados</h3>
                        <p class="stat-value">24</p>
                        <span class="stat-trend">Este mes</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Tendencia de Amenazas</h3>
                        <p class="stat-value">↑ 12%</p>
                        <span class="stat-trend">vs mes anterior</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Efectividad</h3>
                        <p class="stat-value">98.5%</p>
                        <span class="stat-trend">Amenazas bloqueadas</span>
                    </div>
                </div>
            </div>

            <div class="reports-container">
                <div class="reports-header">
                    <div class="report-filters">
                        <select class="report-period">
                            <option>Últimos 7 días</option>
                            <option>Último mes</option>
                            <option>Último año</option>
                            <option>Personalizado</option>
                        </select>
                        <button class="btn-generate">
                            <i class="fas fa-file-pdf"></i> Generar Informe
                        </button>
                    </div>
                </div>

                <div class="reports-grid">
                    <div class="report-card">
                        <div class="report-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3>Informe de Seguridad General</h3>
                        <p>Resumen completo del estado de seguridad del sistema</p>
                        <div class="report-actions">
                            <button class="btn-preview">Vista Previa</button>
                            <button class="btn-download">Descargar</button>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-icon">
                            <i class="fas fa-bug"></i>
                        </div>
                        <h3>Análisis de Vulnerabilidades</h3>
                        <p>Detalle de vulnerabilidades detectadas y estado de parches</p>
                        <div class="report-actions">
                            <button class="btn-preview">Vista Previa</button>
                            <button class="btn-download">Descargar</button>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <h3>Estadísticas de Amenazas</h3>
                        <p>Análisis detallado de amenazas y ataques bloqueados</p>
                        <div class="report-actions">
                            <button class="btn-preview">Vista Previa</button>
                            <button class="btn-download">Descargar</button>
                        </div>
                    </div>
                </div>

                <div class="recent-reports">
                    <h2>Informes Recientes</h2>
                    <div class="reports-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Informe Mensual - Enero 2024</td>
                                    <td>15/01/2024</td>
                                    <td>General</td>
                                    <td>
                                        <button class="btn-icon"><i class="fas fa-download"></i></button>
                                        <button class="btn-icon"><i class="fas fa-eye"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Análisis de Vulnerabilidades Q4</td>
                                    <td>31/12/2023</td>
                                    <td>Vulnerabilidades</td>
                                    <td>
                                        <button class="btn-icon"><i class="fas fa-download"></i></button>
                                        <button class="btn-icon"><i class="fas fa-eye"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getConfiguracionView() {
        return `
            <h1>Configuración</h1>
            <div class="settings-container">
                <div class="settings-section">
                    <h2><i class="fas fa-bell"></i> Notificaciones</h2>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label class="switch-label">
                                <span class="setting-title">Alertas de amenazas críticas</span>
                                <span class="setting-description">Recibir notificaciones inmediatas de amenazas de alta severidad</span>
                                <div class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="switch-label">
                                <span class="setting-title">Informes diarios</span>
                                <span class="setting-description">Resumen diario de actividad de seguridad</span>
                                <div class="switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="switch-label">
                                <span class="setting-title">Alertas de vulnerabilidades</span>
                                <span class="setting-description">Notificaciones cuando se detecten nuevas vulnerabilidades</span>
                                <div class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h2><i class="fas fa-shield-alt"></i> Seguridad</h2>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label class="switch-label">
                                <span class="setting-title">Bloqueo automático de IPs</span>
                                <span class="setting-description">Bloquear automáticamente IPs sospechosas</span>
                                <div class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <span class="setting-title">Tiempo de bloqueo</span>
                                <span class="setting-description">Duración del bloqueo automático de IPs</span>
                                <select class="setting-select">
                                    <option>1 hora</option>
                                    <option>6 horas</option>
                                    <option selected>24 horas</option>
                                    <option>1 semana</option>
                                    <option>Permanente</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h2><i class="fas fa-clock"></i> Programación de Escaneos</h2>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label>
                                <span class="setting-title">Frecuencia de escaneo</span>
                                <span class="setting-description">Frecuencia de escaneos automáticos</span>
                                <select class="setting-select">
                                    <option>Cada 6 horas</option>
                                    <option selected>Cada 12 horas</option>
                                    <option>Cada 24 horas</option>
                                    <option>Semanal</option>
                                </select>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label class="switch-label">
                                <span class="setting-title">Escaneo profundo</span>
                                <span class="setting-description">Realizar análisis exhaustivo del sistema</span>
                                <div class="switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn-save">Guardar Cambios</button>
                    <button class="btn-reset">Restaurar Valores Predeterminados</button>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        window.dashboardManager = new DashboardManager();
    } else {
        console.error('Leaflet not loaded');
    }
}); 
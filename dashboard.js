class DashboardManager {
    constructor() {
        this.map = null;
        this.initializeEventListeners();
        this.loadDefaultView();
    }

    initializeEventListeners() {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                
                // Limpiar el mapa existente si hay uno
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }
                
                // Actualizar clases active
                document.querySelectorAll('.sidebar-nav a').forEach(a => {
                    a.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                // Cargar la vista
                this.loadView(view);
            });
        });
    }

    loadView(view) {
        const mainContent = document.getElementById('view-container');
        if (!mainContent) return;

        // Limpiar el contenido anterior
        mainContent.innerHTML = '';

        // Cargar la nueva vista
        switch(view) {
            case 'general':
                mainContent.innerHTML = this.getGeneralView();
                this.initializeMap();
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

    initializeMap() {
        const mapContainer = document.getElementById('worldMap');
        if (!mapContainer) return;

        // Asegurarse de que el contenedor tenga altura
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

    // Función para convertir GeoJSON a SVG path
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
        // Ejemplos de puntos de ataque
        const attackPoints = [
            { lat: 40.7128, lng: -74.0060, type: 'attack' },  // New York
            { lat: 51.5074, lng: -0.1278, type: 'threat' },   // London
            { lat: 35.6762, lng: 139.6503, type: 'attack' },  // Tokyo
            { lat: -33.8688, lng: 151.2093, type: 'threat' }, // Sydney
            { lat: 52.5200, lng: 13.4050, type: 'attack' }    // Berlin
        ];

        attackPoints.forEach(point => {
            const color = point.type === 'attack' ? '#ff4757' : '#ffa502';
            
            // Crear marcador con efecto de pulso
            L.circle([point.lat, point.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                radius: 100000
            }).addTo(this.map);

            // Añadir efecto de onda expansiva
            L.circle([point.lat, point.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.1,
                radius: 300000,
                className: 'pulse-circle'
            }).addTo(this.map);
        });
    }

    loadDefaultView() {
        // Activar el enlace de Vista General
        const defaultLink = document.querySelector('.sidebar-nav a[data-view="general"]');
        if (defaultLink) {
            defaultLink.classList.add('active');
        }
        this.loadView('general');
    }

    getGeneralView() {
        return `
            <h1>Vista General del Sistema</h1>
            
            <!-- Resumen de estadísticas -->
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Estado del Sistema</h3>
                        <p class="stat-status secure">Seguro</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Amenazas Hoy</h3>
                        <p class="stat-number">24</p>
                        <span class="trend up">↑ 12%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-globe"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Países Bloqueados</h3>
                        <p class="stat-number">15</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Servidores Activos</h3>
                        <p class="stat-number">8/8</p>
                        <span class="status-badge">Todos Operativos</span>
                    </div>
                </div>
            </div>

            <!-- Gráficos principales -->
            <div class="main-charts">
                <div class="chart-container">
                    <h2>Actividad de Seguridad</h2>
                    <canvas id="securityActivityChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Distribución de Amenazas</h2>
                    <canvas id="threatDistributionChart"></canvas>
                </div>
            </div>

            <!-- Mapa de actividad -->
            <div class="activity-map-container">
                <div class="map-header">
                    <h2>Mapa de Actividad Global</h2>
                    <div class="map-controls">
                        <button class="map-filter active">Todas</button>
                        <button class="map-filter">Amenazas</button>
                        <button class="map-filter">Ataques</button>
                    </div>
                </div>
                <div id="worldMap"></div>
            </div>

            <!-- Actividad Reciente -->
            <div class="recent-activity">
                <h2>Actividad Reciente</h2>
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-icon warning">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="activity-details">
                            <h4>Intento de acceso no autorizado</h4>
                            <p>IP: 192.168.1.1 - Hace 5 minutos</p>
                        </div>
                        <div class="activity-status">
                            <span class="status blocked">Bloqueado</span>
                        </div>
                    </div>

                    <div class="activity-item">
                        <div class="activity-icon success">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="activity-details">
                            <h4>Actualización de Firewall</h4>
                            <p>Nuevas reglas implementadas - Hace 15 minutos</p>
                        </div>
                        <div class="activity-status">
                            <span class="status success">Completado</span>
                        </div>
                    </div>

                    <div class="activity-item">
                        <div class="activity-icon info">
                            <i class="fas fa-sync"></i>
                        </div>
                        <div class="activity-details">
                            <h4>Escaneo de Vulnerabilidades</h4>
                            <p>Escaneo programado - En progreso</p>
                        </div>
                        <div class="activity-status">
                            <span class="status running">En Proceso</span>
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
            <div class="vulnerabilities-container">
                <div class="scan-status">
                    <h2>Estado del Escaneo</h2>
                    <div class="progress-bar">
                        <div class="progress" style="width: 75%"></div>
                    </div>
                    <p>Último escaneo: Hace 2 horas</p>
                </div>
            </div>
        `;
    }

    getInformesView() {
        return `
            <h1>Informes de Seguridad</h1>
            <div class="reports-container">
                <div class="report-filters">
                    <select>
                        <option>Últimos 7 días</option>
                        <option>Último mes</option>
                        <option>Último año</option>
                    </select>
                    <button class="generate-report">Generar Informe</button>
                </div>
            </div>
        `;
    }

    getConfiguracionView() {
        return `
            <h1>Configuración</h1>
            <div class="settings-container">
                <div class="settings-section">
                    <h2>Notificaciones</h2>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" checked>
                            Alertas de amenazas críticas
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
}

// Asegurarse de que Leaflet esté disponible antes de inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L !== 'undefined') {
        window.dashboardManager = new DashboardManager();
    } else {
        console.error('Leaflet not loaded');
    }
}); 
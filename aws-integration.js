// Simulador de métricas y eventos de seguridad
class SecurityMetricsManager {
    constructor() {
        this.updateInterval = 5000;
        this.map = null;
        this.threatChart = null;
        this.attackTypesChart = null;
        this.checkAuth();
        this.initializeMap();
        this.initializeCharts();
    }

    // Verificar autenticación
    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }

    // Inicializar el mapa
    initializeMap() {
        if (!document.getElementById('worldMap')) return;

        this.map = L.map('worldMap').setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Estilo oscuro para el mapa
        document.querySelector('.leaflet-container').style.background = '#1a1a1a';
    }

    // Inicializar gráficos
    initializeCharts() {
        // Gráfico de actividad de amenazas
        const threatCtx = document.getElementById('threatActivityChart')?.getContext('2d');
        if (threatCtx) {
            this.threatChart = new Chart(threatCtx, {
                type: 'line',
                data: {
                    labels: Array(24).fill('').map((_, i) => `${i}:00`),
                    datasets: [{
                        label: 'Amenazas Detectadas',
                        data: Array(24).fill(0).map(() => Math.floor(Math.random() * 100)),
                        borderColor: '#4ecdc4',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(78, 205, 196, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#fff'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#fff'
                            }
                        }
                    }
                }
            });
        }

        // Gráfico de tipos de ataques
        const attackTypesCtx = document.getElementById('attackTypesChart')?.getContext('2d');
        if (attackTypesCtx) {
            this.attackTypesChart = new Chart(attackTypesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['DDoS', 'SQL Injection', 'XSS', 'Otros'],
                    datasets: [{
                        data: [40, 25, 20, 15],
                        backgroundColor: [
                            '#4ecdc4',
                            '#ff6b6b',
                            '#ffe66d',
                            '#45b7d1'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#fff'
                            }
                        }
                    }
                }
            });
        }
    }

    // Actualizar estadísticas
    updateStats() {
        const attacksCount = document.getElementById('attacks-count');
        const countriesCount = document.getElementById('countries-count');

        if (attacksCount) attacksCount.textContent = Math.floor(Math.random() * 1000);
        if (countriesCount) countriesCount.textContent = Math.floor(Math.random() * 50);
    }

    // Actualizar dashboard
    updateDashboard() {
        this.updateStats();
        // Simular nuevos ataques en el mapa
        if (this.map) {
            const lat = Math.random() * 180 - 90;
            const lng = Math.random() * 360 - 180;
            L.circle([lat, lng], {
                color: '#ff6b6b',
                fillColor: '#ff6b6b',
                fillOpacity: 0.5,
                radius: 50000
            }).addTo(this.map);
        }
    }
}

// Inicializar el gestor de métricas
const metricsManager = new SecurityMetricsManager();
setInterval(() => metricsManager.updateDashboard(), metricsManager.updateInterval); 
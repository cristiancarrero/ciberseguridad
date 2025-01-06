// Variables globales para las estadísticas
let attackCount = 0;
let countryCount = 0;
const attackTypes = {};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando componentes...');
    
    // Inicializar el mapa
    const mapElement = document.getElementById('worldMap');
    if (!mapElement) {
        console.error('No se encontró el elemento del mapa');
        return;
    }

    try {
        console.log('Creando mapa...');
        // Crear el mapa centrado en el mundo
        const map = L.map('worldMap', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: true,
            attributionControl: false,
            worldCopyJump: true
        });

        console.log('Añadiendo capa de mapa...');
        // Añadir capa de mapa oscuro
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Función para simular ataques
        function simulateAttack() {
            // Coordenadas aleatorias para el ataque
            const lat = Math.random() * 140 - 70;
            const lng = Math.random() * 360 - 180;
            
            // Tipos de ataque con sus colores
            const attackTypes = [
                { type: 'Fuerza Bruta', color: '#ff6b6b' },
                { type: 'DDoS', color: '#ffd700' },
                { type: 'SQL Injection', color: '#4ecdc4' },
                { type: 'Phishing', color: '#9d4edd' }
            ];
            
            const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
            
            // Crear marcador con animación
            const marker = L.circleMarker([lat, lng], {
                radius: 5,
                color: attack.color,
                fillColor: attack.color,
                fillOpacity: 0.7,
                weight: 2
            }).addTo(map);

            // Añadir popup con información
            marker.bindPopup(`
                <div style="text-align: center;">
                    <h3 style="color: ${attack.color};">${attack.type}</h3>
                    <p>Ataque detectado</p>
                    <small>${new Date().toLocaleTimeString()}</small>
                </div>
            `);

            // Animación de pulso
            let radius = 5;
            const pulse = setInterval(() => {
                radius += 2;
                marker.setRadius(radius);
                marker.setStyle({ opacity: 1 - radius/50 });
                
                if (radius > 50) {
                    clearInterval(pulse);
                    map.removeLayer(marker);
                }
            }, 50);

            // Actualizar estadísticas
            updateStats(attack.type);
        }

        // Función para actualizar estadísticas
        function updateStats(attackType) {
            // Incrementar contador de ataques
            attackCount++;
            const attackCountElement = document.getElementById('attackCount');
            if (attackCountElement) {
                attackCountElement.textContent = attackCount;
            }
            
            // Simular países únicos
            if (Math.random() > 0.7) {
                countryCount = Math.min(countryCount + 1, 195);
                const countryCountElement = document.getElementById('countryCount');
                if (countryCountElement) {
                    countryCountElement.textContent = countryCount;
                }
            }

            // Actualizar tipo de ataque más común
            attackTypes[attackType] = (attackTypes[attackType] || 0) + 1;
            const mostCommon = Object.entries(attackTypes).reduce((a, b) => 
                (a[1] > b[1] ? a : b))[0];
            const commonAttackElement = document.getElementById('commonAttack');
            if (commonAttackElement) {
                commonAttackElement.textContent = mostCommon;
            }
        }

        console.log('Iniciando simulación de ataques...');
        // Iniciar simulación de ataques
        setInterval(simulateAttack, 2000);

        // Forzar un redibujado del mapa después de un momento
        setTimeout(() => {
            console.log('Actualizando tamaño del mapa...');
            map.invalidateSize();
        }, 500);

    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
    }

    // Inicializar otros componentes
    initializeVulnerabilityPanel();
    initializeDocumentationCenter();
    initializeReports();
    initializeAttackSimulator();
    initializeDashboard();
});

// Función para inicializar el dashboard
function initializeDashboard() {
    console.log('Inicializando dashboard...');
    
    // Inicializar métricas
    initializeMetrics();
    
    // Inicializar alertas
    initializeAlerts();
    
    // Inicializar estado de servicios AWS
    initializeAWSServices();
}

function initializeMetrics() {
    // Configurar gráficos de métricas
    const cpuChart = document.querySelector('#cpu-usage .metric-chart');
    const networkChart = document.querySelector('#network-traffic .metric-chart');
    
    if (cpuChart) {
        new Chart(cpuChart, {
            type: 'line',
            data: {
                labels: ['12:00', '12:05', '12:10', '12:15', '12:20'],
                datasets: [{
                    label: 'Amenazas Detectadas',
                    data: [65, 59, 80, 81, 56],
                    borderColor: '#4ecdc4',
                    tension: 0.4,
                    fill: false
                }]
            },
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

    if (networkChart) {
        new Chart(networkChart, {
            type: 'line',
            data: {
                labels: ['12:00', '12:05', '12:10', '12:15', '12:20'],
                datasets: [{
                    label: 'Tráfico de Red',
                    data: [2.5, 3.2, 1.8, 4.1, 3.7],
                    borderColor: '#ff6b6b',
                    tension: 0.4,
                    fill: false
                }]
            },
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
}

function initializeAlerts() {
    const alertsList = document.getElementById('security-alerts');
    if (!alertsList) return;

    const alerts = [
        {
            type: 'critical',
            message: 'Intento de acceso no autorizado detectado',
            time: '12:45'
        },
        {
            type: 'warning',
            message: 'Tráfico inusual en puerto 443',
            time: '12:30'
        },
        {
            type: 'info',
            message: 'Actualización de seguridad disponible',
            time: '12:15'
        }
    ];

    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-time">${alert.time}</div>
            <div class="alert-message">${alert.message}</div>
        </div>
    `).join('');
}

function initializeAWSServices() {
    const services = ['ec2-status', 's3-status', 'cloudwatch-status'];
    const statuses = ['Operativo', 'En mantenimiento', 'Operativo'];
    
    services.forEach((serviceId, index) => {
        const element = document.getElementById(serviceId);
        if (element) {
            const statusDiv = element.querySelector('.service-status');
            if (statusDiv) {
                statusDiv.textContent = statuses[index];
                statusDiv.className = `service-status ${statuses[index].toLowerCase().replace(' ', '-')}`;
            }
        }
    });
}

// Panel de Vulnerabilidades
function initializeVulnerabilityPanel() {
    const ctx = document.getElementById('vulnerabilitiesChart').getContext('2d');
    const vulnerabilitiesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Críticas', 'Altas', 'Medias', 'Bajas'],
            datasets: [{
                data: [3, 7, 12, 15],
                backgroundColor: [
                    '#ff0000',
                    '#ff6b6b',
                    '#ffd700',
                    '#4ecdc4'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    // Simular lista de vulnerabilidades
    const vulnList = document.getElementById('vulnList');
    const vulnerabilities = [
        {
            severity: 'critical',
            title: 'Exposición de credenciales en EC2',
            description: 'Se detectaron credenciales expuestas en metadatos de instancia',
            date: '2024-02-20'
        },
        {
            severity: 'high',
            title: 'Configuración insegura de S3',
            description: 'Bucket S3 con acceso público detectado',
            date: '2024-02-19'
        },
        // Añadir más vulnerabilidades simuladas
    ];

    vulnList.innerHTML = vulnerabilities.map(vuln => `
        <div class="vuln-item ${vuln.severity}">
            <div class="vuln-header">
                <span class="vuln-severity">${vuln.severity.toUpperCase()}</span>
                <span class="vuln-date">${vuln.date}</span>
            </div>
            <h4>${vuln.title}</h4>
            <p>${vuln.description}</p>
            <button class="btn-fix">Remediar</button>
        </div>
    `).join('');
}

// Centro de Documentación
function initializeDocumentationCenter() {
    const searchBox = document.querySelector('.search-box input');
    const docCategories = document.querySelectorAll('.doc-category');
    const docsContent = document.querySelector('.docs-content');

    // Simular búsqueda
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Implementar lógica de búsqueda
    });

    // Cambiar categorías
    docCategories.forEach(category => {
        category.addEventListener('click', () => {
            docCategories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            updateDocContent(category.querySelector('span').textContent);
        });
    });
}

// Informes de Seguridad
function initializeReports() {
    const generateBtn = document.querySelector('.generate-report');
    const reportPreview = document.querySelector('.report-preview');

    generateBtn.addEventListener('click', () => {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Simular generación de informe
        reportPreview.innerHTML = `
            <div class="report-header">
                <h3>Informe de Seguridad ${reportType}</h3>
                <p>Período: ${startDate} - ${endDate}</p>
            </div>
            <div class="report-summary">
                <div class="report-stat">
                    <span class="stat-number">147</span>
                    <span class="stat-label">Amenazas Detectadas</span>
                </div>
                <div class="report-stat">
                    <span class="stat-number">98.5%</span>
                    <span class="stat-label">Tasa de Prevención</span>
                </div>
                <div class="report-stat">
                    <span class="stat-number">37</span>
                    <span class="stat-label">Vulnerabilidades Corregidas</span>
                </div>
            </div>
        `;
    });
}

// Simulador de Ataques
function initializeAttackSimulator() {
    const attackBtns = document.querySelectorAll('.attack-btn');
    const simulationScreen = document.querySelector('.simulation-screen');
    const controlBtns = document.querySelectorAll('.control-btn');
    let currentSimulation = null;

    attackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            attackBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            startSimulation(btn.dataset.attack);
        });
    });

    function startSimulation(attackType) {
        simulationScreen.innerHTML = `
            <div class="simulation-${attackType}">
                <div class="simulation-header">
                    <h4>Simulación de ${attackType}</h4>
                    <div class="simulation-status">En progreso...</div>
                </div>
                <div class="simulation-visual">
                    <!-- Visualización específica para cada tipo de ataque -->
                </div>
            </div>
        `;
    }

    // Controles de simulación
    document.getElementById('startSimulation').addEventListener('click', () => {
        // Iniciar simulación
    });

    document.getElementById('pauseSimulation').addEventListener('click', () => {
        // Pausar simulación
    });

    document.getElementById('resetSimulation').addEventListener('click', () => {
        // Reiniciar simulación
    });
}

// Función para alternar información de servicios
function toggleInfo(id) {
    const element = document.getElementById(id);
    element.classList.toggle('active');
}

// Función para simular ataques específicos
function simulateSpecificAttack(attackType) {
    const simulationScreen = document.querySelector('.simulation-screen');
    const simulationInfo = document.querySelector('.simulation-info');
    
    // Configuración de simulaciones
    const simulations = {
        bruteforce: {
            title: 'Simulación de Ataque de Fuerza Bruta',
            steps: [
                'Iniciando intento de acceso...',
                'Probando combinación 1 de 1000000...',
                'Detectado patrón de ataque...',
                'Bloqueando IP maliciosa...',
                'Notificando al equipo de seguridad...',
                'Ataque mitigado exitosamente.'
            ]
        },
        ddos: {
            title: 'Simulación de Ataque DDoS',
            steps: [
                'Detectando tráfico anormal...',
                'Analizando patrones de tráfico...',
                'Identificando IPs maliciosas...',
                'Activando WAF...',
                'Filtrando tráfico malicioso...',
                'Servicio protegido y estable.'
            ]
        },
        injection: {
            title: 'Simulación de SQL Injection',
            steps: [
                'Detectando patrones de inyección SQL...',
                'Analizando consultas sospechosas...',
                'Bloqueando intentos de inyección...',
                'Sanitizando entradas...',
                'Registrando evento de seguridad...',
                'Base de datos protegida.'
            ]
        },
        phishing: {
            title: 'Simulación de Ataque Phishing',
            steps: [
                'Escaneando enlaces sospechosos...',
                'Analizando contenido del email...',
                'Detectando suplantación de identidad...',
                'Bloqueando remitente malicioso...',
                'Alertando a usuarios...',
                'Amenaza neutralizada.'
            ]
        }
    };

    let currentStep = 0;
    const simulation = simulations[attackType];

    // Actualizar pantalla de simulación
    simulationScreen.innerHTML = `
        <div class="simulation-header">
            <h4>${simulation.title}</h4>
            <div class="simulation-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
        <div class="simulation-log"></div>
    `;

    const log = simulationScreen.querySelector('.simulation-log');
    const progressBar = simulationScreen.querySelector('.progress-bar');

    // Función para añadir pasos con delay
    function addStep() {
        if (currentStep < simulation.steps.length) {
            const step = document.createElement('div');
            step.className = 'simulation-step';
            step.innerHTML = `
                <span class="step-time">[${new Date().toLocaleTimeString()}]</span>
                <span class="step-text">${simulation.steps[currentStep]}</span>
            `;
            log.appendChild(step);
            step.scrollIntoView({ behavior: 'smooth' });
            
            // Actualizar barra de progreso
            const progress = ((currentStep + 1) / simulation.steps.length) * 100;
            progressBar.style.width = `${progress}%`;
            
            currentStep++;
            setTimeout(addStep, 1500);
        }
    }

    // Iniciar simulación
    addStep();
}
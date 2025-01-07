// Función para alternar información de servicios
function toggleInfo(infoId) {
    const info = document.getElementById(infoId);
    const button = info.previousElementSibling;
    
    // Toggle del panel actual
    info.classList.toggle('active');
    button.classList.toggle('active');
}

// Inicializar el gráfico de amenazas
function initThreatsChart() {
    const ctx = document.getElementById('threatsPieChart').getContext('2d');
    
    // Datos que coinciden con las tarjetas
    const data = {
        labels: ['Críticas', 'Altas', 'Medias', 'Bajas'],
                datasets: [{
            data: [3, 7, 12, 15],  // Coincide con los números de las tarjetas
            backgroundColor: [
                'rgba(255, 71, 87, 0.8)',   // Críticas - Rojo
                'rgba(255, 165, 2, 0.8)',    // Altas - Naranja
                'rgba(46, 213, 115, 0.8)',   // Medias - Verde
                'rgba(30, 144, 255, 0.8)'    // Bajas - Azul
            ],
            borderWidth: 0,
            borderRadius: 5,
            spacing: 2,
            hoverOffset: -10
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
            options: {
            cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    padding: 15,
                    cornerRadius: 10,
                    titleFont: {
                        size: 16,
                        weight: 'bold',
                        family: 'Poppins'
                    },
                    bodyFont: {
                        size: 14,
                        family: 'Poppins'
                    },
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} vulnerabilidades (${percentage}%)`;
                        },
                        title: function(context) {
                            return `Vulnerabilidades ${context[0].label}`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutCubic'
            },
            hover: {
                mode: 'nearest',
                intersect: true,
                animationDuration: 200
            }
        }
    };

    new Chart(ctx, config);
}

// Función para cambiar entre secciones de documentación
function initDocTabs() {
    const categories = document.querySelectorAll('.doc-category');
    const sections = document.querySelectorAll('.doc-section');
    
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remover active de todas las categorías
            categories.forEach(c => c.classList.remove('active'));
            // Añadir active a la categoría clickeada
            category.classList.add('active');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar la sección correspondiente
            const sectionId = category.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Array global para mantener las alertas seleccionadas
let selectedAlerts = [];

// Array global para mantener registro de todas las alertas para el informe
window.recentAlerts = [];

// Inicializar el mapa de amenazas
function initThreatMap() {
    const map = L.map('threatMap').setView([20, 0], 2);
    
    // Array para mantener registro de los puntos activos
    let activePoints = [];
    
    // Array de alertas simuladas
    const alerts = [
        {
            type: 'high',
            message: 'Intento de Fuerza Bruta',
            details: 'Múltiples intentos de acceso detectados',
            location: { lat: 40.4168, lng: -3.7038 },
            ip: '192.168.1.105',
            region: 'Madrid, España',
            remediation: {
                steps: [
                    'Bloquear temporalmente la IP origen',
                    'Revisar logs de autenticación',
                    'Implementar autenticación de dos factores',
                    'Considerar el uso de CAPTCHA'
                ],
                impact: 'Alto',
                urgency: 'Inmediata',
                recommendations: 'Se recomienda implementar un sistema de bloqueo automático después de múltiples intentos fallidos.'
            }
        },
        {
            type: 'medium',
            message: 'Tráfico Inusual',
            details: 'Incremento del 150% en el tráfico',
            location: { lat: 51.5074, lng: -0.1278 },
            ip: '10.0.0.234',
            region: 'Londres, Reino Unido',
            remediation: {
                steps: [
                    'Analizar patrones de tráfico',
                    'Verificar origen del incremento',
                    'Ajustar límites de ancho de banda',
                    'Monitorear comportamiento de red'
                ],
                impact: 'Medio',
                urgency: 'Moderada',
                recommendations: 'Implementar sistema de monitoreo de tráfico con alertas automáticas para detectar anomalías.'
            }
        },
        {
            type: 'low',
            message: 'Actualización Completada',
            details: 'Parches de seguridad aplicados',
            location: { lat: 40.7128, lng: -74.0060 },
            ip: '172.16.0.100',
            region: 'Nueva York, Estados Unidos',
            remediation: {
                steps: [
                    'Verificar estado de los servicios',
                    'Comprobar logs post-actualización',
                    'Realizar pruebas de funcionalidad',
                    'Documentar cambios aplicados'
                ],
                impact: 'Bajo',
                urgency: 'Baja',
                recommendations: 'Mantener un registro de actualizaciones y establecer un calendario regular de mantenimiento.'
            }
        },
        {
            type: 'high',
            message: 'Intento de SQL Injection',
            details: 'Detectado intento de inyección SQL',
            location: { lat: 35.6762, lng: 139.6503 },
            ip: '192.168.0.50',
            region: 'Tokio, Japón',
            remediation: {
                steps: [
                    'Bloquear IP del atacante',
                    'Revisar y validar todas las entradas de datos',
                    'Implementar prepared statements',
                    'Actualizar WAF rules'
                ],
                impact: 'Alto',
                urgency: 'Inmediata',
                recommendations: 'Implementar validación estricta de entrada y utilizar ORM para prevenir futuros intentos de inyección.'
            }
        },
        {
            type: 'medium',
            message: 'Acceso No Autorizado',
            details: 'Intento de acceso desde IP no reconocida',
            location: { lat: -33.8688, lng: 151.2093 },
            ip: '10.0.1.175',
            region: 'Sídney, Australia',
            remediation: {
                steps: [
                    'Verificar credenciales comprometidas',
                    'Revisar logs de acceso',
                    'Actualizar políticas de acceso',
                    'Implementar geofencing'
                ],
                impact: 'Medio',
                urgency: 'Alta',
                recommendations: 'Implementar autenticación multifactor y restricciones geográficas de acceso.'
            }
        }
    ];

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    map.getContainer().style.filter = 'brightness(1.1) saturate(1.2) contrast(1.1)';

    // Limpiar las alertas iniciales del HTML
    const alertsContainer = document.querySelector('.alerts-container');
    alertsContainer.innerHTML = '';
    
    // Contador para llevar el control del número total de alertas
    let alertCount = 0;

    // Función para reducir la intensidad de los puntos antiguos
    function fadeOldPoints() {
        activePoints.forEach((point, index) => {
            if (index < activePoints.length - 1) { // Si no es el punto más reciente
                // Reducir la opacidad del punto central
                point.centerPoint.setStyle({
                    fillOpacity: 0.6,
                    opacity: 0.6
                });
                
                // Reducir la intensidad de los anillos
                point.glowRings.forEach((ring, i) => {
                    ring.setStyle({
                        fillOpacity: 0.08 - (i * 0.02)
                    });
                });
                
                // Detener la animación intensa
                if (point.pulseAnimation) {
                    clearInterval(point.pulseAnimation);
                }
                
                // Iniciar animación sutil
                point.pulseAnimation = setInterval(() => {
                    point.glowRings.forEach((ring, i) => {
                        const opacity = 0.08 - (i * 0.02) + Math.sin(Date.now() / 2000) * 0.03;
                        ring.setStyle({ fillOpacity: opacity });
                    });
                }, 100);
            }
        });
    }

    // Función para añadir una alerta al mapa
    function addAlert(alert) {
        const colors = {
            high: '#ff4d4d',
            medium: '#ffd700',
            low: '#4ecdc4'
        };

        const popupContent = `
            <div class="alert-popup">
                <h4>${alert.message}</h4>
                <p>${alert.details}</p>
                <p class="ip-address">IP: ${alert.ip}</p>
            </div>
        `;

        // Si ya tenemos 6 puntos activos, eliminar el más antiguo
        if (activePoints.length >= 6) {
            const oldestPoint = activePoints.shift();
            if (oldestPoint.pulseAnimation) {
                clearInterval(oldestPoint.pulseAnimation);
            }
            oldestPoint.glowRings.forEach(ring => ring.remove());
            oldestPoint.centerPoint.remove();
        }

        const glowRings = [];
        const numRings = 3;
        
        // Crear anillos de resplandor
        for (let i = 0; i < numRings; i++) {
            const glowRing = L.circle([alert.location.lat, alert.location.lng], {
                color: colors[alert.type],
                fillColor: colors[alert.type],
                fillOpacity: 0.2 - (i * 0.05),
                radius: 600000 + (i * 150000),
                weight: 0,
                stroke: false
            }).addTo(map);
            glowRings.push(glowRing);
        }

        const centerPoint = L.circle([alert.location.lat, alert.location.lng], {
            color: colors[alert.type],
            fillColor: colors[alert.type],
            fillOpacity: 1,
            radius: 60000,
            weight: 3
        })
        .bindPopup(popupContent)
        .addTo(map);

        const animate = () => {
            let phase = 0;
            const pulseAnimation = setInterval(() => {
                phase += 0.06;
                
                glowRings.forEach((ring, i) => {
                    const offset = i * (Math.PI / numRings);
                    const opacity = 0.25 - (i * 0.07) + Math.sin(phase + offset) * 0.15;
                    ring.setStyle({ fillOpacity: opacity });
                });
            }, 50);

            // Guardar la referencia de la animación
            return pulseAnimation;
        };

        const pulseAnimation = animate();

        // Guardar el nuevo punto y sus anillos
        activePoints.push({
            centerPoint,
            glowRings,
            location: alert.location,
            type: alert.type,
            pulseAnimation
        });

        // Reducir la intensidad de los puntos antiguos
        fadeOldPoints();

        updateAlertsList(alert);

        // Añadir la alerta al registro de alertas recientes
        window.recentAlerts.unshift(alert);
        
        // Generar un informe automático cuando se añade una alerta
        addReportToList(alert);
        
        // Mantener solo las últimas 20 alertas para el informe
        if (window.recentAlerts.length > 20) {
            window.recentAlerts.pop();
        }
    }

    // Función para actualizar la lista de alertas recientes
    function updateAlertsList(alert) {
        if (alertCount >= 6) {
            alertsContainer.removeChild(alertsContainer.lastChild);
        } else {
            alertCount++;
        }

        // Añadir la alerta al registro de alertas recientes
        window.recentAlerts.unshift(alert);
        // Mantener solo las últimas 20 alertas para el informe
        if (window.recentAlerts.length > 20) {
            window.recentAlerts.pop();
        }

        const alertElement = document.createElement('div');
        const typeToClass = {
            high: 'red',
            medium: 'yellow',
            low: 'green'
        };
        alertElement.className = `alert-card ${typeToClass[alert.type]}`;

        alertElement.innerHTML = `
            <div class="alert-header">
                <span class="alert-dot"></span>
                <div class="alert-title-container">
                    <h4>${alert.message}</h4>
                    <span class="alert-type ${alert.type}">${alert.type.toUpperCase()}</span>
                </div>
            </div>
            <p>${alert.details}</p>
            <div class="alert-location">
                <p class="alert-ip">IP: ${alert.ip}</p>
                <p class="alert-region">
                    <i class="fas fa-map-marker-alt"></i> ${alert.region}
                </p>
            </div>
            <div class="alert-actions">
                <button class="remediate-btn" onclick='showRemediation(${JSON.stringify(alert).replace(/'/g, "\\'")})'">
                    <i class="fas fa-shield-alt"></i> Remediar
                </button>
            </div>
        `;

        // Añadir la nueva alerta al principio
        alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
    }

    // Simular alertas aleatorias
    function scheduleNextAlert() {
        // Generar un tiempo aleatorio entre 15 y 25 segundos
        const randomTime = Math.floor(Math.random() * (25000 - 15000) + 15000);
        
        setTimeout(() => {
            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
            addAlert(randomAlert);
            scheduleNextAlert();
        }, randomTime);
    }
    
    // Iniciar el ciclo de alertas
    scheduleNextAlert();

    // Función para generar el informe de seguridad
    window.generateSecurityReport = function() {
        const reportModal = document.createElement('div');
        reportModal.className = 'report-modal';
        
        // Agrupar alertas por tipo
        const alertsByType = {
            high: window.recentAlerts.filter(a => a.type === 'high'),
            medium: window.recentAlerts.filter(a => a.type === 'medium'),
            low: window.recentAlerts.filter(a => a.type === 'low')
        };
        
        // Calcular estadísticas
        const stats = {
            total: window.recentAlerts.length,
            high: alertsByType.high.length,
            medium: alertsByType.medium.length,
            low: alertsByType.low.length,
            regions: [...new Set(window.recentAlerts.map(a => a.region))].length
        };
        
        reportModal.innerHTML = `
            <div class="report-content">
                <div class="report-header">
                    <h2>Informe de Seguridad</h2>
                    <span class="close-report">&times;</span>
                </div>
                <div class="report-body">
                    <div class="report-summary">
                        <h3>Resumen de Alertas</h3>
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Alertas Totales</span>
                            </div>
                            <div class="stat-item high">
                                <span class="stat-value">${stats.high}</span>
                                <span class="stat-label">Alta Prioridad</span>
                            </div>
                            <div class="stat-item medium">
                                <span class="stat-value">${stats.medium}</span>
                                <span class="stat-label">Media Prioridad</span>
                            </div>
                            <div class="stat-item low">
                                <span class="stat-value">${stats.low}</span>
                                <span class="stat-label">Baja Prioridad</span>
                            </div>
                        </div>
                    </div>
                    <div class="report-alerts">
                        <h3>Alertas Críticas</h3>
                        ${alertsByType.high.map(alert => `
                            <div class="report-alert high">
                                <h4>${alert.message}</h4>
                                <p>${alert.details}</p>
                                <div class="alert-meta">
                                    <span class="alert-location">
                                        <i class="fas fa-map-marker-alt"></i> ${alert.region}
                                    </span>
                                    <span class="alert-ip">IP: ${alert.ip}</span>
                                </div>
                            </div>
                        `).join('')}
                        
                        <h3>Otras Alertas</h3>
                        ${alertsByType.medium.concat(alertsByType.low).map(alert => `
                            <div class="report-alert ${alert.type}">
                                <h4>${alert.message}</h4>
                                <p>${alert.details}</p>
                                <div class="alert-meta">
                                    <span class="alert-location">
                                        <i class="fas fa-map-marker-alt"></i> ${alert.region}
                                    </span>
                                    <span class="alert-ip">IP: ${alert.ip}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(reportModal);

        // Cerrar modal
        const closeBtn = reportModal.querySelector('.close-report');
        closeBtn.onclick = () => reportModal.remove();

        // Cerrar al hacer clic fuera
        reportModal.onclick = (e) => {
            if (e.target === reportModal) reportModal.remove();
        };
    };

    // Función para añadir un informe a la lista
    function addReportToList(alert) {
        const reportsList = document.querySelector('.report-items');
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('es-ES');
        const formattedTime = currentDate.toLocaleTimeString('es-ES');
        
        const alertData = JSON.stringify(alert);
        
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.style.opacity = '0';
        reportItem.style.transform = 'translateY(-10px)';
        reportItem.dataset.alert = alertData;
        
        reportItem.innerHTML = `
            <div class="report-item-info">
                <i class="fas fa-file-pdf"></i>
                <div class="report-details">
                    <div>
                        <h4>Alerta de Seguridad - ${alert.type.toUpperCase()}</h4>
                    </div>
                    <div class="report-date">
                        <i class="far fa-calendar"></i> ${formattedDate}
                        <i class="far fa-clock"></i> ${formattedTime}
                    </div>
                </div>
            </div>
            <div class="report-actions">
                <button class="view-report" onclick='event.stopPropagation(); showSingleAlertReport(${alertData})'>
                    <i class="fas fa-eye"></i>
                </button>
                <button class="download-report" onclick='event.stopPropagation(); downloadAlertPDF(${alertData})'>
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        
        // Añadir evento de click para selección
        reportItem.addEventListener('click', () => {
            const alert = JSON.parse(reportItem.dataset.alert);
            if (reportItem.classList.contains('selected')) {
                reportItem.classList.remove('selected');
                selectedAlerts = selectedAlerts.filter(a => a.ip !== alert.ip);
            } else {
                reportItem.classList.add('selected');
                selectedAlerts.push(alert);
            }
            updateBulkDownloadButton();
        });
        
        // Añadir al principio de la lista
        reportsList.insertBefore(reportItem, reportsList.firstChild);
        
        // Animar la entrada de la nueva alerta
        setTimeout(() => {
            reportItem.style.transition = 'all 0.3s ease';
            reportItem.style.opacity = '1';
            reportItem.style.transform = 'translateY(0)';
        }, 50);
        
        // Mantener solo los últimos 10 informes
        const reports = reportsList.children;
        if (reports.length > 10) {
            reportsList.removeChild(reports[reports.length - 1]);
        }
    }

    // Función para descargar el informe en PDF
    function downloadAlertPDF(alert) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar fuente para caracteres especiales
            doc.setFont("helvetica");
            
            // Título
            doc.setFontSize(20);
            doc.text("Informe de Seguridad", 105, 20, { align: "center" });
            
            // Información de la alerta
            doc.setFontSize(16);
            doc.text("Detalles de la Alerta", 20, 40);
            
            doc.setFontSize(12);
            doc.text(`Tipo: ${alert.type.toUpperCase()}`, 20, 55);
            doc.text(`Mensaje: ${alert.message}`, 20, 65);
            doc.text(`Detalles: ${alert.details}`, 20, 75);
            doc.text(`IP: ${alert.ip}`, 20, 85);
            doc.text(`Ubicación: ${alert.region}`, 20, 95);
            
            // Plan de remediación
            doc.setFontSize(16);
            doc.text("Plan de Remediación", 20, 115);
            
            doc.setFontSize(12);
            doc.text(`Impacto: ${alert.remediation.impact}`, 20, 130);
            doc.text(`Urgencia: ${alert.remediation.urgency}`, 20, 140);
            
            // Pasos a seguir
            doc.setFontSize(14);
            doc.text("Pasos a seguir:", 20, 160);
            
            let yPos = 170;
            alert.remediation.steps.forEach((step, index) => {
                doc.setFontSize(12);
                doc.text(`${index + 1}. ${step}`, 25, yPos);
                yPos += 10;
            });
            
            // Recomendaciones
            doc.setFontSize(14);
            doc.text("Recomendaciones:", 20, yPos + 10);
            
            doc.setFontSize(12);
            const splitRecommendations = doc.splitTextToSize(alert.remediation.recommendations, 170);
            doc.text(splitRecommendations, 20, yPos + 20);
            
            // Fecha y hora
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('es-ES');
            const formattedTime = currentDate.toLocaleTimeString('es-ES');
            doc.setFontSize(10);
            doc.text(`Generado el ${formattedDate} a las ${formattedTime}`, 20, 280);
            
            // Descargar el PDF
            doc.save(`alerta-seguridad-${alert.type}-${new Date().toLocaleDateString('es-ES')}.pdf`);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    }

    // Hacer la función accesible globalmente
    window.downloadAlertPDF = downloadAlertPDF;

    // Nueva función para mostrar el informe de una sola alerta
    function showSingleAlertReport(alert) {
        const reportModal = document.createElement('div');
        reportModal.className = 'report-modal';
        
        reportModal.innerHTML = `
            <div class="report-content">
                <div class="report-header">
                    <h2>Informe de Seguridad</h2>
                    <span class="close-report">&times;</span>
                </div>
                <div class="report-body">
                    <div class="report-summary">
                        <h3>Detalles de la Alerta</h3>
                        <div class="summary-stats">
                            <div class="stat-item ${alert.type}">
                                <span class="stat-value">${alert.type.toUpperCase()}</span>
                                <span class="stat-label">Nivel de Amenaza</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${alert.ip}</span>
                                <span class="stat-label">IP Origen</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${alert.region}</span>
                                <span class="stat-label">Ubicación</span>
                            </div>
                        </div>
                    </div>
                    <div class="report-alerts">
                        <h3>Descripción de la Alerta</h3>
                        <div class="report-alert ${alert.type}">
                            <h4>${alert.message}</h4>
                            <p>${alert.details}</p>
                            <div class="alert-meta">
                                <span class="alert-location">
                                    <i class="fas fa-map-marker-alt"></i> ${alert.region}
                                </span>
                                <span class="alert-ip">IP: ${alert.ip}</span>
                            </div>
                        </div>
                        
                        <h3>Plan de Remediación</h3>
                        <div class="remediation-steps">
                            <ol>
                                ${alert.remediation.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                        <div class="remediation-recommendations">
                            <h4>Recomendaciones:</h4>
                            <p>${alert.remediation.recommendations}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reportModal);
        
        // Cerrar modal
        const closeBtn = reportModal.querySelector('.close-report');
        closeBtn.onclick = () => reportModal.remove();
        
        // Cerrar al hacer clic fuera
        reportModal.onclick = (e) => {
            if (e.target === reportModal) reportModal.remove();
        };
    }

    // Hacer la función accesible globalmente
    window.showSingleAlertReport = showSingleAlertReport;

    // Función para actualizar el botón de descarga masiva
    function updateBulkDownloadButton() {
        let bulkDownloadBtn = document.querySelector('.bulk-download-btn');
        if (selectedAlerts.length > 0) {
            if (!bulkDownloadBtn) {
                bulkDownloadBtn = document.createElement('button');
                bulkDownloadBtn.className = 'bulk-download-btn';
                bulkDownloadBtn.innerHTML = `
                    <i class="fas fa-download"></i>
                    Descargar ${selectedAlerts.length} informes
                `;
                bulkDownloadBtn.onclick = downloadSelectedAlerts;
                document.querySelector('.report-filters').appendChild(bulkDownloadBtn);
            } else {
                bulkDownloadBtn.innerHTML = `
                    <i class="fas fa-download"></i>
                    Descargar ${selectedAlerts.length} informes
                `;
            }
        } else if (bulkDownloadBtn) {
            bulkDownloadBtn.remove();
        }
    }

    // Función para descargar múltiples alertas
    function downloadSelectedAlerts() {
        const totalAlerts = selectedAlerts.length;
        let downloadedCount = 0;
        
        selectedAlerts.forEach((alert, index) => {
            setTimeout(() => {
                downloadAlertPDF(alert);
                downloadedCount++;
                
                if (downloadedCount === totalAlerts) {
                    selectedAlerts = [];
                    document.querySelectorAll('.report-item.selected').forEach(item => {
                        item.classList.remove('selected');
                    });
                    updateBulkDownloadButton();
                }
            }, index * 500); // Medio segundo entre cada descarga
        });
    }

    // Inicializar el mapa con algunas alertas
    // Generar una alerta aleatoria cada 30-60 segundos
    setInterval(() => {
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        addAlert(randomAlert);
    }, Math.random() * 30000 + 30000);

    // Añadir una alerta inicial
    addAlert(alerts[0]);
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    initThreatsChart();
    initDocTabs();
    initThreatMap();
    initSolutionsExpand();
});

// Modal handling
const modal = document.getElementById('authModal');
const dashboardLink = document.querySelector('a[href="dashboard.html"]');
const closeModal = document.querySelector('.close-modal');

// Prevent default navigation and show modal
dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

// Close modal when clicking the X
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Función para mostrar el modal de remediación
window.showRemediation = function(alert) {
    const remediationModal = document.createElement('div');
    remediationModal.className = 'remediation-modal';
    
    remediationModal.innerHTML = `
        <div class="remediation-content">
            <div class="remediation-header">
                <h3>Plan de Remediación</h3>
                <span class="close-remediation">&times;</span>
            </div>
            <div class="remediation-body">
                <div class="remediation-info">
                    <div class="info-item">
                        <span class="label">Tipo de Amenaza:</span>
                        <span class="value ${alert.type}">${alert.type.toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Impacto:</span>
                        <span class="value">${alert.remediation.impact}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Urgencia:</span>
                        <span class="value">${alert.remediation.urgency}</span>
                    </div>
                </div>
                <div class="remediation-steps">
                    <h4>Pasos a seguir:</h4>
                    <ol>
                        ${alert.remediation.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <div class="remediation-recommendations">
                    <h4>Recomendaciones adicionales:</h4>
                    <p>${alert.remediation.recommendations}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(remediationModal);

    // Cerrar modal
    const closeBtn = remediationModal.querySelector('.close-remediation');
    closeBtn.onclick = () => remediationModal.remove();

    // Cerrar al hacer clic fuera
    remediationModal.onclick = (e) => {
        if (e.target === remediationModal) remediationModal.remove();
    };
};

function initSolutionsExpand() {
    const moreInfoButtons = document.querySelectorAll('.more-info');
    
    moreInfoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = button.getAttribute('data-target');
            const targetInfo = document.getElementById(targetId);
            
            // Cerrar todos los demás
            document.querySelectorAll('.expanded-info.active').forEach(info => {
                if (info.id !== targetId) {
                    info.classList.remove('active');
                    const otherButton = document.querySelector(`[data-target="${info.id}"]`);
                    otherButton.classList.remove('active');
                }
            });
            
            // Alternar el actual
            targetInfo.classList.toggle('active');
            button.classList.toggle('active');
        });
    });
}

// Función para validar el formulario de registro
function validateRegistrationForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar que todos los campos estén llenos
    if (!name || !email || !password || !confirmPassword) {
        showError('Por favor, rellena todos los campos');
        return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Por favor, introduce un email válido');
        return false;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return false;
    }
    
    // Validar longitud y complejidad de la contraseña
    if (password.length < 8) {
        showError('La contraseña debe tener al menos 8 caracteres');
        return false;
    }
    
    return true;
}

// Función para manejar el registro
function handleRegistration(event) {
    event.preventDefault();
    
    if (!validateRegistrationForm()) {
        return;
    }
    
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    // Simular registro exitoso
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Mostrar mensaje de éxito
    showSuccess('Registro exitoso. Redirigiendo...');
    
    // Redirigir al dashboard después de 2 segundos
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(successDiv, form.firstChild);
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Agregar el event listener al formulario de registro
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});
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

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    initThreatsChart();
    initDocTabs();
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
class DashboardManager {
    constructor() {
        // Verificar autenticación al inicio
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.replace('auth.html');
            return;
        }

        this.charts = {};
        this.currentSection = 'overview';
        
        // Inicializar todo
        this.initializeEventListeners();
        this.loadSection(this.currentSection);
        // ... resto del constructor
    }

    // ... resto de la clase sin cambios
} 
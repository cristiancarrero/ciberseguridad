class AuthManager {
    constructor() {
        this.form = document.querySelector('form');
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Si ya está autenticado, redirigir al dashboard
        if (this.isAuthenticated() && window.location.pathname.includes('auth.html')) {
            window.location.replace('dashboard.html');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;

        // Aquí irían las validaciones y la llamada al backend
        // Por ahora simulamos una autenticación exitosa
        if (email && password) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                email: email,
                role: 'admin'
            }));
            window.location.replace('dashboard.html');
        }
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        window.location.replace('auth.html');
    }

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }
}

// Inicializar el auth manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
}); 
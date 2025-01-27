const AuthService = {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
    AUTH_URL: 'http://localhost:8000/auth/index.html',
    DASHBOARD_URL: 'http://localhost:3000',

    isValidSession() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const lastLoginTime = parseInt(localStorage.getItem('lastLoginTime') || '0');
        const isValid = isLoggedIn && (Date.now() - lastLoginTime < this.SESSION_TIMEOUT);
        
        // Si la sesión no es válida, limpiar todo
        if (!isValid) {
            this.clearSession();
        }
        
        return isValid;
    },

    login(username, isAdmin = false) {
        const now = Date.now();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('isAdmin', isAdmin);
        localStorage.setItem('lastLoginTime', now.toString());
        
        // Redirigir al dashboard después del login
        window.location.replace(this.DASHBOARD_URL);
    },

    clearSession() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('lastLoginTime');
    },

    logout() {
        this.clearSession();
        window.location.replace(this.AUTH_URL);
    },

    getUsername() {
        return localStorage.getItem('username');
    },

    isAdmin() {
        return localStorage.getItem('isAdmin') === 'true';
    },

    // Nuevo método para verificar si estamos en la página de auth
    isAuthPage() {
        return window.location.href.includes('/auth/');
    },

    // Nuevo método para manejar redirecciones de forma segura
    handleAuthRedirect() {
        const isValid = this.isValidSession();
        const isInAuthPage = this.isAuthPage();

        if (isValid && isInAuthPage) {
            // Si tiene sesión válida y está en la página de auth, enviar al dashboard
            window.location.replace(this.DASHBOARD_URL);
        } else if (!isValid && !isInAuthPage) {
            // Si no tiene sesión válida y no está en la página de auth, enviar a login
            window.location.replace(this.AUTH_URL);
        }
    }
};

// Para uso en páginas HTML
if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}
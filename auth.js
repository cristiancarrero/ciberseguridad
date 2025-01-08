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

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.querySelector(`#${tabId}Form`).classList.add('active');
        });
    });
});

document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const passwordField = this.parentElement;
        
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.add('active');
            passwordField.classList.add('showing');
        } else {
            input.type = 'password';
            this.classList.remove('active');
            passwordField.classList.remove('showing');
        }
    });
}); 
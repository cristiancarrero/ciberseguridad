class Auth {
    constructor() {
        // Si ya está logueado y estamos en auth.html, redirigir al dashboard
        if (window.location.pathname.includes('auth.html') && localStorage.getItem('isLoggedIn')) {
            window.location.replace('dashboard.html');
            return;
        }

        this.form = document.querySelector('#loginForm');
        if (this.form) {
            this.form.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Inicializar las pestañas y el toggle de contraseña
        this.initTabs();
        this.initPasswordToggle();
    }

    handleLogin(e) {
        e.preventDefault();
        
        const emailInput = this.form.querySelector('input[type="email"]');
        const passwordInput = this.form.querySelector('input[type="password"]');

        if (!emailInput || !passwordInput) {
            console.error('No se encontraron los campos del formulario');
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        if (email === 'admin@example.com' && password === 'admin123') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify({
                username: 'Admin',
                email: email,
                role: 'admin'
            }));
            window.location.replace('dashboard.html');
        } else {
            alert('Credenciales incorrectas. Use admin@example.com / admin123');
        }
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase active de todos los botones y contenidos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Añadir clase active al botón clickeado y su contenido
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.querySelector(`#${tabId}Form`).classList.add('active');
            });
        });
    }

    initPasswordToggle() {
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
    }

    logout() {
        localStorage.clear();
        window.location.replace('auth.html');
    }

    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
}

// Solo inicializar en la página de autenticación
if (window.location.pathname.includes('auth.html')) {
    new Auth();
} 
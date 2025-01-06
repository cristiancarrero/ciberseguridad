// Clase para manejar la autenticación
class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
        this.users = JSON.parse(localStorage.getItem('users')) || [
            // Usuario de prueba predeterminado
            {
                name: 'Admin',
                email: 'admin@test.com',
                password: '123456'
            }
        ];
        this.setupLoginForm();
        this.setupTabs();
    }

    checkAuthStatus() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                this.login({ email, password });
            });
        }
    }

    login(credentials) {
        // Buscar el usuario en el array de usuarios
        const user = this.users.find(u => 
            u.email === credentials.email && 
            u.password === credentials.password
        );

        if (user) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
                name: user.name,
                email: user.email
            }));
            window.location.href = 'dashboard.html';
        } else {
            this.showNotification('Email o contraseña incorrectos', 'error');
        }
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    updateNavigation() {
        const guestLinks = document.getElementById('guest-links');
        const userLinks = document.getElementById('user-links');
        const username = document.getElementById('username');
        
        if (this.isAuthenticated) {
            if (guestLinks) guestLinks.style.display = 'none';
            if (userLinks) userLinks.style.display = 'block';
            if (username) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                username.textContent = user.name || 'Usuario';
            }
        } else {
            if (guestLinks) guestLinks.style.display = 'block';
            if (userLinks) userLinks.style.display = 'none';
        }
    }

    checkAuth() {
        if (!this.isAuthenticated) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const loginForm = document.getElementById('loginForm');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover active de todas las pestañas
                tabs.forEach(t => t.classList.remove('active'));
                // Añadir active a la pestaña clickeada
                tab.classList.add('active');
                
                // Cambiar el formulario según la pestaña
                if (tab.textContent.trim() === 'Registrarse') {
                    loginForm.innerHTML = `
                        <div class="input-group">
                            <input type="text" id="name" placeholder="Nombre completo" required>
                        </div>
                        <div class="input-group">
                            <input type="email" id="email" placeholder="Email" required>
                        </div>
                        <div class="input-group">
                            <input type="password" id="password" placeholder="Contraseña" required>
                        </div>
                        <div class="input-group">
                            <input type="password" id="confirmPassword" placeholder="Confirmar contraseña" required>
                        </div>
                        <button type="submit" class="submit-btn">Registrarse</button>
                    `;
                } else {
                    loginForm.innerHTML = `
                        <div class="input-group">
                            <input type="email" id="email" placeholder="Email" required>
                        </div>
                        <div class="input-group">
                            <input type="password" id="password" placeholder="Contraseña" required>
                        </div>
                        <div class="form-options">
                            <label>
                                <input type="checkbox" id="remember"> Recordarme
                            </label>
                            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                        </div>
                        <button type="submit" class="submit-btn">Iniciar Sesión</button>
                    `;
                }
                
                // Volver a configurar el formulario
                this.setupLoginForm();
            });
        });
    }

    register(userData) {
        // Verificar si el email ya existe
        if (this.users.some(u => u.email === userData.email)) {
            this.showNotification('El email ya está registrado', 'error');
            return;
        }

        // Añadir nuevo usuario
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: userData.password
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Auto login después del registro
        this.login({
            email: userData.email,
            password: userData.password
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Estilos para la notificación
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.backgroundColor = type === 'error' ? '#ff6b6b' : '#4ecdc4';
        notification.style.zIndex = '1000';

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Crear una instancia global
window.authManager = new AuthManager();

// Actualizar la navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authManager.updateNavigation();
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');

    const registerForm = document.getElementById('register-form');
    console.log('Formulario encontrado:', registerForm);

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Formulario enviado');

            const userData = {
                fullName: e.target.querySelector('input[type="text"]').value,
                email: e.target.querySelector('input[type="email"]').value,
                password: e.target.querySelectorAll('input[type="password"]')[0].value,
                confirmPassword: e.target.querySelectorAll('input[type="password"]')[1].value
            };

            console.log('Datos del usuario:', userData);

            try {
                if (userData.password !== userData.confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                await authManager.register({
                    fullName: userData.fullName,
                    email: userData.email,
                    password: userData.password
                });

                alert('¡Registro exitoso!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error en el registro:', error);
                alert(error.message || 'Error al registrar usuario');
            }
        });
    }
});

// Función para cambiar entre pestañas
function switchTab(tab) {
    console.log('Cambiando a pestaña:', tab);
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.querySelector('.tab-btn:nth-child(1)');
    const registerTab = document.querySelector('.tab-btn:nth-child(2)');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Manejar el inicio de sesión
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const user = authManager.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
});

// Manejar "Olvidé mi contraseña"
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Por favor, contacta al administrador para restablecer tu contraseña');
});

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Añadir al DOM
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 
// Clase para manejar la autenticación
class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
    }

    checkAuthStatus() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    logout() {
        // Limpiar el estado de autenticación
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        
        // Redirigir al index
        window.location.href = 'index.html';
    }
}

// Crear una instancia global
window.authManager = new AuthManager();

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
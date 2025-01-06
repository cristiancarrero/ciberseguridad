// Simulación de base de datos de usuarios
const users = JSON.parse(localStorage.getItem('users')) || [];

// Función para cambiar entre pestañas
function switchTab(tab) {
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

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
});

// Manejar el registro
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;
    const fullName = e.target.querySelector('input[type="text"]').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (users.some(u => u.email === email)) {
        alert('Este email ya está registrado');
        return;
    }

    const newUser = {
        id: Date.now(),
        email,
        password,
        fullName
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'dashboard.html';
});

// Manejar "Olvidé mi contraseña"
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Por favor, contacta al administrador para restablecer tu contraseña');
}); 
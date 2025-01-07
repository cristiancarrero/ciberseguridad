// Función para proteger rutas específicas
function protectRoute() {
    const protectedRoutes = ['dashboard.html'];
    const currentPath = window.location.pathname;
    
    // Si la ruta actual está en la lista de rutas protegidas
    if (protectedRoutes.some(route => currentPath.endsWith(route))) {
        if (!localStorage.getItem('isAuthenticated')) {
            window.location.href = 'auth.html';
        }
    }
}

// Ejecutar al cargar la página
protectRoute(); 
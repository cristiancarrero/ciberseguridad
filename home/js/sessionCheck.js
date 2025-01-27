// Solo verificar en páginas protegidas y redirigir una sola vez
const protectedPages = ['dashboard.html', 'pentesting.html'];
const currentPage = window.location.pathname.split('/').pop();

if (protectedPages.includes(currentPage) && !localStorage.getItem('isLoggedIn')) {
    window.location.replace('../auth/index.html');
} 
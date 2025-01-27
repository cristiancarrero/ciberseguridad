document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    // Verificar tema guardado
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.checked = currentTheme === 'light';

    // Aplicar tema inicial
    applyTheme(currentTheme);

    // Manejar cambios en el switch
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
});

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.style.setProperty('--bg-color', '#f5f5f5');
        root.style.setProperty('--text-color', '#333');
        root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--primary-gradient', 'linear-gradient(45deg, #4ecdc4, #ff6b6b)');
        document.body.style.background = '#f5f5f5';
    } else {
        root.style.setProperty('--bg-color', '#1a1a1a');
        root.style.setProperty('--text-color', '#fff');
        root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--primary-gradient', 'linear-gradient(45deg, #ff6b6b, #4ecdc4)');
        document.body.style.background = '#1a1a1a';
    }
} 
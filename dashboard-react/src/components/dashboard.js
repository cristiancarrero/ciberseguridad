// Clase principal para el Dashboard
class Dashboard {
  constructor() {
    // Obtener la vista actual antes de cualquier inicialización
    this.currentView = localStorage.getItem('currentView') || 'dashboard-section';
    
    // Prevenir el flash inicial ocultando todo momentáneamente
    document.body.style.visibility = 'hidden';
    
    // Inicializar cuando el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Establecer la vista correcta inmediatamente
    this.setInitialState();
    
    // Inicializar el resto de la aplicación
    this.setupEventListeners();
    this.initializeCharts();
    
    // Mostrar el contenido cuando todo esté listo
    requestAnimationFrame(() => {
      document.body.style.visibility = 'visible';
    });
  }

  setInitialState() {
    // Actualizar navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-section') === this.currentView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Actualizar secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
      if (section.id === this.currentView) {
        section.classList.add('active');
        section.style.display = 'block';
        section.style.opacity = '1';
      } else {
        section.classList.remove('active');
        section.style.display = 'none';
        section.style.opacity = '0';
      }
    });

    // Actualizar título
    const title = document.querySelector('.content-title');
    if (title) {
      title.textContent = this.getViewTitle(this.currentView);
    }
  }

  setupEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-section');
        if (targetView && targetView !== this.currentView) {
          this.changeView(targetView);
        }
      });
    });
  }

  async changeView(viewId) {
    if (this.isChangingView) return;
    this.isChangingView = true;

    try {
      // Actualizar estado actual
      this.currentView = viewId;
      localStorage.setItem('currentView', viewId);

      // Actualizar UI
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-section') === viewId);
      });

      // Cambiar sección
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => {
        if (section.id === viewId) {
          section.style.display = 'block';
          requestAnimationFrame(() => {
            section.classList.add('active');
            section.style.opacity = '1';
          });
        } else {
          section.classList.remove('active');
          section.style.opacity = '0';
          setTimeout(() => {
            section.style.display = 'none';
          }, 300);
        }
      });

      // Actualizar título
      const title = document.querySelector('.content-title');
      if (title) {
        title.textContent = this.getViewTitle(viewId);
      }
    } finally {
      this.isChangingView = false;
    }
  }

  getViewTitle(viewId) {
    const titles = {
      'dashboard-section': 'Panel de Control',
      'metrics-section': 'Métricas',
      'security-section': 'Seguridad'
    };
    return titles[viewId] || 'Panel de Control';
  }

  async initializeCharts() {
    // Tu código existente de inicialización de gráficos
    // Asegúrate de que devuelva una promesa si es asíncrono
  }
}

// Inicializar el dashboard
new Dashboard();

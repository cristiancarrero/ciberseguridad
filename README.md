# 🛡️ Proyecto de Ciberseguridad

Plataforma web dedicada a la gestión y monitorización de seguridad informática, ofreciendo herramientas de análisis, pruebas de penetración y formación en ciberseguridad.

## 🚀 Características

- Dashboard interactivo para monitorización en tiempo real
- Sistema de autenticación seguro
- Herramientas de pentesting integradas
- Integración con servicios AWS
- Informes detallados de seguridad
- Interface responsive y moderna

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v14 o superior)
- npm (v6 o superior)
- Python (v3.8 o superior)
- Cuenta de AWS (para funcionalidades en la nube)
- Docker (para el chatbot)

## 🔧 Instalación

1. Clona el repositorio

   ```bash
   git clone https://github.com/cristiancarrero/ciberseguridad.git
   cd ciberseguridad
   ```

2. Instala las dependencias

   ```bash
   npm install
   ```

3. Configura las variables de entorno

   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

4. Construye y ejecuta el chatbot con Docker

   ```bash
   # Construir la imagen
   docker build -t ciberseguridad-chatbot ./chatbot
   
   # Ejecutar el contenedor
   docker run -p 8080:8080 ciberseguridad-chatbot
   ```

5. Inicia el servidor de desarrollo

   ```bash
   npm run dev
   ```

## 🔍 Uso

1. Accede a la plataforma a través de `http://localhost:3000`
2. Inicia sesión con tus credenciales
3. Navega por el dashboard para acceder a las diferentes herramientas
4. Utiliza el panel de control para gestionar la seguridad

## 📊 Módulos Principales

### Dashboard
- Monitorización en tiempo real
- Visualización de métricas
- Gestión de alertas

### Pentesting
- Análisis de vulnerabilidades
- Pruebas de penetración
- Informes de seguridad

### Gestión de Usuarios
- Control de accesos
- Gestión de roles
- Auditoría de actividades

### Chatbot de Seguridad (En desarrollo)
- Asistente virtual para consultas
- Recomendaciones de seguridad
- Soporte 24/7

## 🔐 Seguridad

Este proyecto implementa las siguientes medidas de seguridad:

- Autenticación de dos factores
- Encriptación de datos sensibles
- Logs de auditoría
- Protección contra ataques comunes (XSS, CSRF, etc.)
- Monitorización continua
- Análisis de vulnerabilidades automatizado

## 📦 Estructura del Proyecto

```
ciberseguridad/
├── auth/               # Autenticación y autorización
├── backend/           # Lógica del servidor
├── dashboard/         # Interface de administración
├── Pentest/          # Herramientas de penetración
├── chatbot/          # Servicio de chatbot
├── shared/           # Servicios compartidos
│   └── services/
└── docs/             # Documentación
```

## 🛠️ Construido con

- JavaScript - Lenguaje principal
- CSS - Estilos
- HTML - Estructura
- Python - Scripts de backend
- AWS - Servicios en la nube
- Vite - Build tool
- Docker - Contenedores
- Socket.IO - Comunicación en tiempo real

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles

## ✒️ Autores

* **Cristian Carrero** - *Desarrollador principal* - [cristiancarrero](https://github.com/cristiancarrero)
* **Vittoria de Novellis** - *Desarrolladora chatbot* - [Dolcevitta95](https://github.com/Dolcevitta95)

## 📞 Soporte

Para soporte y consultas:
- Email: soporte@ciberseguridad.com
- Issues: [GitHub Issues](https://github.com/cristiancarrero/ciberseguridad/issues)
- Chat: Disponible en la plataforma 24/7

## 🎉 Agradecimientos

* A todos los contribuidores que participan en este proyecto
* A la comunidad de ciberseguridad por su continuo apoyo

# Ciberseguridad Chatbot

Este proyecto es un chatbot diseñado para ayudar en temas de ciberseguridad. Utiliza tecnologías modernas para proporcionar respuestas rápidas y precisas a preguntas relacionadas con la seguridad informática.

## Características

- Respuestas automatizadas a preguntas frecuentes sobre ciberseguridad.
- Integración con bases de datos de amenazas conocidas.
- Capacidad de aprendizaje para mejorar las respuestas con el tiempo.

## Requisitos

- Docker
- Git

## Instalación

1. **Clonar el repositorio**

   Clona este repositorio en tu máquina local usando el siguiente comando:

   ```bash
   git clone https://github.com/cristiancarrero/ciberseguridad.git
   cd ciberseguridad
   ```

2. **Construir la imagen de Docker**

   Asegúrate de tener Docker instalado y ejecutándose en tu sistema. Luego, construye la imagen de Docker con el siguiente comando:

   ```bash
   docker build -t ciberseguridad-chatbot ./chatbot
   ```

3. **Ejecutar el contenedor de Docker**

   Una vez que la imagen esté construida, puedes ejecutar el contenedor con:

   ```bash
   docker run -p 8080:8080 ciberseguridad-chatbot
   ```

   Esto expondrá el servicio en el puerto 8080 de tu máquina local.

## Uso

Accede al chatbot a través de tu navegador web en `http://localhost:8080`. Desde allí, puedes interactuar con el chatbot y explorar sus capacidades.

## Contribuir

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Para más detalles, consulta el archivo `LICENSE`. 

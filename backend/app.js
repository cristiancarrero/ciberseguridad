const express = require('express');
const cors = require('cors');
const app = express();

// Configuración de CORS y middleware
app.use(cors());
app.use(express.json());

// Importar las rutas de S3
const s3Routes = require('./routes/s3Routes');

// Montar las rutas de S3 en el prefijo correcto
app.use('/api/s3', s3Routes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app; 
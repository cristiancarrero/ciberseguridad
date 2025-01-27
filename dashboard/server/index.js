import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { router as s3Routes } from './routes/s3Routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/s3', s3Routes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

// Intentar cerrar el servidor anterior si existe
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`S3 API available at http://localhost:${PORT}/api/s3`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} en uso, intentando cerrar el servidor anterior...`);
    server.close();
  } else {
    console.error('Error iniciando servidor:', err);
  }
}); 
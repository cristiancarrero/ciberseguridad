import express from 'express';
import multer from 'multer';
import { 
  S3Client, 
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectTaggingCommand,
  PutObjectTaggingCommand
} from '@aws-sdk/client-s3';

const router = express.Router();

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Middleware para verificar credenciales AWS
const verifyAWSCredentials = (req, res, next) => {
  console.log('Verificando credenciales AWS:', req.body);
  const { credentials } = req.body;
  if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
    return res.status(401).json({ error: 'Credenciales AWS no proporcionadas' });
  }
  req.awsCredentials = credentials;
  next();
};

// Crear S3Client con credenciales
const createS3Client = (credentials) => {
  return new S3Client({
    region: credentials.region || 'us-west-2',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  });
};

// Rutas
router.post('/list-buckets', verifyAWSCredentials, async (req, res) => {
  try {
    const s3Client = createS3Client(req.awsCredentials);
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    res.json(response.Buckets || []);
  } catch (error) {
    console.error('Error listing buckets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear bucket
router.post('/create-bucket', verifyAWSCredentials, async (req, res) => {
  console.log('Recibida petición para crear bucket:', req.body);
  try {
    const { bucketName } = req.body;
    if (!bucketName) {
      return res.status(400).json({ error: 'Nombre del bucket no proporcionado' });
    }

    const s3Client = createS3Client(req.awsCredentials);
    
    // Validar nombre del bucket
    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucketName)) {
      return res.status(400).json({ 
        error: 'Nombre de bucket inválido. Use solo letras minúsculas, números, puntos y guiones.' 
      });
    }

    console.log('Creando bucket con nombre:', bucketName);
    const command = new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: req.awsCredentials.region || 'us-west-2'
      }
    });

    await s3Client.send(command);
    console.log('Bucket creado exitosamente');
    res.json({ message: 'Bucket creado exitosamente' });
  } catch (error) {
    console.error('Error creating bucket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar bucket
router.post('/delete-bucket', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName } = req.body;
    if (!bucketName) {
      return res.status(400).json({ error: 'Nombre del bucket no proporcionado' });
    }

    const s3Client = createS3Client(req.awsCredentials);
    
    // Primero verificamos si el bucket está vacío
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName
    });
    
    const objects = await s3Client.send(listCommand);
    if (objects.Contents && objects.Contents.length > 0) {
      return res.status(400).json({ error: 'El bucket debe estar vacío antes de eliminarlo' });
    }

    // Si está vacío, procedemos a eliminarlo
    const deleteCommand = new DeleteBucketCommand({
      Bucket: bucketName
    });

    await s3Client.send(deleteCommand);
    res.json({ message: 'Bucket eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exportar el router
export default router; 
import express from 'express';
import multer from 'multer';
import { 
  listBuckets,
  createBucket,
  deleteBucket,
  listObjects,
  uploadObject,
  downloadObject,
  deleteObject,
  copyObject,
  getObjectMetadata,
  generatePresignedUrl,
  setEncryption
} from './s3Controller.js';
import { S3Client, GetObjectTaggingCommand, PutObjectTaggingCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB límite
  }
});

// Middleware para verificar credenciales AWS
const verifyAWSCredentials = (req, res, next) => {
  const { credentials } = req.body;
  
  if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
    return res.status(401).json({ error: 'Credenciales AWS no proporcionadas' });
  }
  
  req.awsCredentials = credentials;
  next();
};

// Middleware para verificar credenciales AWS en FormData
const verifyFormDataCredentials = (req, res, next) => {
  const { accessKeyId, secretAccessKey } = req.body;
  
  if (!accessKeyId || !secretAccessKey) {
    return res.status(401).json({ error: 'Credenciales AWS no proporcionadas' });
  }
  
  next();
};

// Rutas
router.post('/list-buckets', verifyAWSCredentials, listBuckets);
router.post('/create-bucket', verifyAWSCredentials, createBucket);
router.post('/delete-bucket', verifyAWSCredentials, deleteBucket);
router.post('/list-objects', verifyAWSCredentials, listObjects);
router.post('/upload-object', upload.single('file'), verifyFormDataCredentials, uploadObject);
router.post('/download-object', verifyAWSCredentials, downloadObject);
router.post('/delete-object', verifyAWSCredentials, deleteObject);
router.post('/copy-object', verifyAWSCredentials, copyObject);
router.post('/object-metadata', verifyAWSCredentials, getObjectMetadata);
router.post('/set-encryption', verifyAWSCredentials, setEncryption);
router.post('/get-object-tags', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const credentials = req.awsCredentials;
    
    const s3Client = new S3Client({
      region: credentials.region || 'us-west-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    const command = new GetObjectTaggingCommand({
      Bucket: bucketName,
      Key: key
    });

    const response = await s3Client.send(command);
    res.json(response);
  } catch (error) {
    console.error('Error getting object tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manejador de errores para multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'El archivo excede el límite de tamaño permitido (100MB)' 
      });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export { router }; 
import express from 'express';
import multer from 'multer';
import { 
  S3Client, 
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  GetObjectTaggingCommand,
  PutObjectTaggingCommand,
  DeleteObjectTaggingCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const router = express.Router();

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
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

// Listar buckets
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

// Crear bucket
router.post('/create-bucket', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName } = req.body;
    if (!bucketName) {
      return res.status(400).json({ error: 'Nombre del bucket no proporcionado' });
    }
    
    console.log('Creando bucket:', bucketName);
    const s3Client = createS3Client(req.awsCredentials);
    const command = new CreateBucketCommand({
      Bucket: bucketName
    });
    
    await s3Client.send(command);
    console.log('Bucket creado exitosamente:', bucketName);
    res.json({ message: 'Bucket creado exitosamente', bucketName });
  } catch (error) {
    console.error('Error creating bucket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar bucket
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
    console.log('Bucket eliminado exitosamente:', bucketName);
    res.json({ message: 'Bucket eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar objetos
router.post('/list-objects', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, prefix = '', maxKeys = 1000 } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys
    });
    const response = await s3Client.send(command);
    res.json(response.Contents || []);
  } catch (error) {
    console.error('Error listing objects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subir objeto
router.post('/upload-object', upload.single('file'), async (req, res) => {
  try {
    console.log('Iniciando subida de objeto a S3');
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { bucketName, key } = req.body;
    console.log('Datos recibidos:', { bucketName, key, fileSize: req.file.size });
    
    let credentials;
    try {
      credentials = typeof req.body.credentials === 'string' 
        ? JSON.parse(req.body.credentials)
        : req.body.credentials;
      console.log('Credenciales procesadas correctamente');
    } catch (error) {
      console.error('Error procesando credenciales:', error);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      console.error('Credenciales incompletas');
      return res.status(401).json({ error: 'Credenciales AWS no proporcionadas' });
    }

    console.log('Creando cliente S3...');
    const s3Client = createS3Client(credentials);

    console.log('Preparando comando de subida...');
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    console.log('Enviando archivo a S3...');
    await s3Client.send(command);
    console.log('Archivo subido exitosamente');
    
    res.json({ 
      message: 'Archivo subido exitosamente',
      details: {
        bucket: bucketName,
        key: key,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error detallado al subir objeto:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// Descargar objeto
router.post('/download-object', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Previsualizar objeto
router.post('/preview-object', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    console.log('Previsualizando objeto:', { bucketName, key });
    
    const s3Client = createS3Client(req.awsCredentials);
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(command);
    
    // Establecer los headers de la respuesta
    res.setHeader('Content-Type', response.ContentType);
    res.setHeader('Content-Length', response.ContentLength);
    res.setHeader('Content-Disposition', `inline; filename="${key.split('/').pop()}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Transmitir el stream directamente al cliente
    response.Body.pipe(res);
  } catch (error) {
    console.error('Error previewing object:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar objeto
router.post('/delete-object', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    await s3Client.send(command);
    res.json({ message: 'Objeto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting object:', error);
    res.status(500).json({ error: error.message });
  }
});

// Copiar objeto
router.post('/copy-object', verifyAWSCredentials, async (req, res) => {
  try {
    const { sourceBucket, sourceKey, destinationBucket, destinationKey } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    const command = new CopyObjectCommand({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: destinationBucket,
      Key: destinationKey
    });
    await s3Client.send(command);
    res.json({ message: 'Objeto copiado exitosamente' });
  } catch (error) {
    console.error('Error copying object:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener tags
router.post('/get-object-tags', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    const command = new GetObjectTaggingCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(command);
    res.json(response);
  } catch (error) {
    console.error('Error getting object tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para cifrar objetos
router.post('/set-encryption', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key, encryptionSettings } = req.body;
    const s3Client = createS3Client(req.awsCredentials);

    // Primero obtener el objeto original
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const object = await s3Client.send(getCommand);

    // Preparar los parámetros para la copia cifrada
    const putParams = {
      Bucket: bucketName,
      Key: key,
      Body: await object.Body.transformToByteArray(),
      ContentType: object.ContentType,
      ServerSideEncryption: encryptionSettings.type
    };

    // Si se está usando KMS, añadir el ID de la clave
    if (encryptionSettings.type === 'aws:kms' && encryptionSettings.kmsKeyId) {
      putParams.SSEKMSKeyId = encryptionSettings.kmsKeyId;
    }

    // Subir la versión cifrada
    const putCommand = new PutObjectCommand(putParams);
    await s3Client.send(putCommand);

    res.json({
      message: 'Cifrado aplicado correctamente',
      encryption: encryptionSettings.type,
      isEncrypted: true
    });
  } catch (error) {
    console.error('Error al cifrar objeto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener metadatos del objeto
router.post('/get-object-metadata', verifyAWSCredentials, async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    if (!bucketName || !key) {
      return res.status(400).json({ error: 'Nombre del bucket y key son requeridos' });
    }

    const s3Client = createS3Client(req.awsCredentials);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    try {
      const response = await s3Client.send(command);
      res.json({
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        serverSideEncryption: response.ServerSideEncryption,
        sseKMSKeyId: response.SSEKMSKeyId,
        metadata: response.Metadata
      });
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return res.status(404).json({ error: 'Objeto no encontrado' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting object metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exportar el router
export default router; 
const { 
  S3Client, 
  ListBucketsCommand, 
  CreateBucketCommand, 
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ServerSideEncryption,
  PutBucketEncryptionCommand
} = require('@aws-sdk/client-s3');

// Función para crear cliente S3
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

// Función para manejar errores
const handleError = (res, error) => {
  console.error('Error en operación S3:', error);
  if (error.name === 'AccessDenied') {
    return res.status(403).json({ error: 'Acceso denegado. Verifique sus credenciales.' });
  }
  res.status(500).json({ 
    error: 'Error en la operación', 
    details: error.message 
  });
};

// Listar buckets
const listBuckets = async (req, res) => {
  try {
    const s3Client = createS3Client(req.awsCredentials);
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    res.json(response.Buckets);
  } catch (error) {
    handleError(res, error);
  }
};

// Crear bucket
const createBucket = async (req, res) => {
  try {
    const { bucketName, encryptionSettings } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    
    // Validar nombre del bucket
    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucketName)) {
      return res.status(400).json({ 
        error: 'Nombre de bucket inválido. Use solo letras minúsculas, números, puntos y guiones.' 
      });
    }

    // Configurar parámetros del bucket
    const bucketParams = {
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: req.awsCredentials.region || 'us-west-2'
      }
    };

    // Crear el bucket
    await s3Client.send(new CreateBucketCommand(bucketParams));

    // Si se especifica cifrado, configurarlo
    if (encryptionSettings && encryptionSettings.type !== 'none') {
      const encryptionConfig = {
        ServerSideEncryptionConfiguration: {
          Rules: [
            {
              ApplyServerSideEncryptionByDefault: {
                SSEAlgorithm: encryptionSettings.type === 'aws:kms' ? 'aws:kms' : 'AES256',
                ...(encryptionSettings.type === 'aws:kms' && encryptionSettings.kmsKeyId && {
                  KMSMasterKeyID: encryptionSettings.kmsKeyId
                })
              }
            }
          ]
        }
      };

      const putEncryptionCommand = new PutBucketEncryptionCommand({
        Bucket: bucketName,
        ...encryptionConfig
      });

      await s3Client.send(putEncryptionCommand);
    }

    res.json({ message: 'Bucket creado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Eliminar bucket
const deleteBucket = async (req, res) => {
  try {
    const { bucketName } = req.body;
    const s3Client = createS3Client(req.awsCredentials);
    
    // Verificar si el bucket está vacío
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
    const objects = await s3Client.send(listCommand);
    
    if (objects.Contents?.length > 0) {
      return res.status(400).json({ error: 'El bucket debe estar vacío para eliminarlo' });
    }

    const command = new DeleteBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    res.json({ message: 'Bucket eliminado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Listar objetos
const listObjects = async (req, res) => {
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
    handleError(res, error);
  }
};

// Subir objeto
const uploadObject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { bucketName, key, accessKeyId, secretAccessKey, sessionToken, region } = req.body;
    
    // Construir objeto de credenciales
    const credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
      region: region || 'us-west-2'
    };

    const s3Client = createS3Client(credentials);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);
    res.json({ message: 'Archivo subido exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Descargar objeto
const downloadObject = async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const response = await s3Client.send(command);
    const stream = response.Body;
    
    // Configurar headers
    res.setHeader('Content-Type', response.ContentType);
    res.setHeader('Content-Length', response.ContentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);

    // Enviar stream
    stream.pipe(res);
  } catch (error) {
    handleError(res, error);
  }
};

// Eliminar objeto
const deleteObject = async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
    res.json({ message: 'Objeto eliminado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Copiar objeto
const copyObject = async (req, res) => {
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
    handleError(res, error);
  }
};

// Obtener metadatos del objeto
const getObjectMetadata = async (req, res) => {
  try {
    const { bucketName, key } = req.body;
    const s3Client = createS3Client(req.awsCredentials);

    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const response = await s3Client.send(command);
    res.json({
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Aplicar cifrado a un objeto
const setEncryption = async (req, res) => {
  try {
    const { bucketName, key, encryptionSettings } = req.body;
    const s3Client = createS3Client(req.awsCredentials);

    // Primero obtenemos el objeto actual
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const currentObject = await s3Client.send(getCommand);

    // Preparar parámetros para la copia con cifrado
    const copyParams = {
      Bucket: bucketName,
      Key: key,
      CopySource: `${bucketName}/${key}`,
      ServerSideEncryption: encryptionSettings.type === 'aws:kms' ? 'aws:kms' : 'AES256',
      Body: currentObject.Body
    };

    // Si se especifica una clave KMS, agregarla a los parámetros
    if (encryptionSettings.type === 'aws:kms' && encryptionSettings.kmsKeyId) {
      copyParams.SSEKMSKeyId = encryptionSettings.kmsKeyId;
    }

    // Copiar el objeto con la nueva configuración de cifrado
    const copyCommand = new CopyObjectCommand(copyParams);
    await s3Client.send(copyCommand);

    res.json({ message: 'Cifrado aplicado exitosamente' });
  } catch (error) {
    console.error('Error al aplicar cifrado:', error);
    handleError(res, error);
  }
};

module.exports = {
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
}; 
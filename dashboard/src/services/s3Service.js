import axios from 'axios';
import { 
  S3Client, 
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  ListObjectVersionsCommand,
  GetObjectTaggingCommand,
  PutObjectTaggingCommand,
  DeleteObjectTaggingCommand,
  ServerSideEncryption,
  PutObjectAclCommand,
  PutBucketCorsCommand,
  GetBucketEncryptionCommand
} from '@aws-sdk/client-s3';
import { getAwsConfig, getS3Client } from './awsClientsService';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/s3';

// Función para manejar errores de manera consistente
const handleError = (error) => {
  console.error('Error en operación S3:', error);
  throw error.response?.data?.error || error.message;
};

// Función para obtener credenciales en formato consistente
const getCredentialsConfig = () => {
  const awsCredentials = localStorage.getItem('awsCredentials');
  if (!awsCredentials) {
    throw new Error('Credenciales AWS no encontradas');
  }
  const credentials = JSON.parse(awsCredentials);
  return { credentials };
};

// Sistema de cache
const cache = {
  objects: new Map(),
  policies: new Map(),
  tags: new Map(),

  set(key, value, ttl = 300000) { // 5 minutos por defecto
    this.objects.set(key, {
      value,
      expires: Date.now() + ttl
    });
  },

  get(key) {
    const item = this.objects.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.objects.delete(key);
      return null;
    }
    return item.value;
  },

  clear() {
    this.objects.clear();
    this.policies.clear();
    this.tags.clear();
  }
};

// Listar buckets
export const listBuckets = async () => {
  try {
    const config = getCredentialsConfig();
    const response = await axios.post(`${API_URL}/list-buckets`, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Función para crear un bucket
export const createBucket = async (bucketName, encryptionSettings) => {
  try {
    const response = await axios.post(`${API_URL}/create-bucket`, {
      ...getCredentialsConfig(),
      bucketName,
      encryptionSettings,
      configureCors: true
    });

    // Si el bucket se creó con cifrado, guardamos la configuración
    if (encryptionSettings) {
      const encryptedBuckets = JSON.parse(localStorage.getItem('encryptedBuckets') || '[]');
      if (!encryptedBuckets.includes(bucketName)) {
        encryptedBuckets.push(bucketName);
        localStorage.setItem('encryptedBuckets', JSON.stringify(encryptedBuckets));
        // Guardar la configuración específica de cifrado
        localStorage.setItem(`encryption:${bucketName}`, JSON.stringify({
          ServerSideEncryptionConfiguration: {
            Rules: [{
              ApplyServerSideEncryptionByDefault: {
                SSEAlgorithm: encryptionSettings.algorithm,
                KMSMasterKeyID: encryptionSettings.kmsKeyId
              }
            }]
          }
        }));
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error al crear bucket:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Función para eliminar un bucket
export const deleteBucket = async (bucketName) => {
  try {
    const response = await axios.post(`${API_URL}/delete-bucket`, {
      ...getCredentialsConfig(),
      bucketName
    });
    
    // Limpiar información de cifrado si existe
    const encryptedBuckets = JSON.parse(localStorage.getItem('encryptedBuckets') || '[]');
    const updatedBuckets = encryptedBuckets.filter(b => b !== bucketName);
    localStorage.setItem('encryptedBuckets', JSON.stringify(updatedBuckets));
    localStorage.removeItem(`encryption:${bucketName}`);
    
    return response.data;
  } catch (error) {
    console.error('Error al eliminar bucket:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Listar objetos
export const listObjects = async (bucketName, prefix = '') => {
  try {
    console.log('Listando objetos para bucket:', bucketName, 'prefix:', prefix);
    // Limpiar caché para este bucket
    cache.objects.delete(`${bucketName}:${prefix}`);

    const response = await axios.post(`${API_URL}/list-objects`, {
      ...getCredentialsConfig(),
      bucketName,
      prefix
    });

    console.log('Objetos obtenidos:', response.data);
    cache.set(`${bucketName}:${prefix}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error listando objetos:', error);
    handleError(error);
  }
};

// Cola de transferencias
class TransferQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  add(transfer) {
    this.queue.push(transfer);
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const transfer = this.queue[0];

    try {
      await transfer.execute();
      this.queue.shift();
      this.process();
    } catch (error) {
      console.error('Error en transferencia:', error);
      this.queue.shift();
      this.process();
    }
  }
}

export const transferQueue = new TransferQueue();

// Función básica para subir un archivo
export const uploadFile = async (bucketName, file, key, credentials) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucketName', bucketName);
    formData.append('key', key);
    formData.append('credentials', JSON.stringify(credentials));

    const response = await axios.post(`${API_URL}/upload-object`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error en uploadFile:', error);
    throw error.response?.data?.error || error.message || 'Error al subir el archivo';
  }
};

// Función mejorada para subir archivos con progreso
export const uploadFileWithProgress = async (bucketName, file, key, onProgress) => {
  const upload = {
    execute: async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', bucketName);
      formData.append('key', key);

      await axios.post(`${API_URL}/upload-object`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress && onProgress(percentCompleted);
        }
      });
    }
  };

  transferQueue.add(upload);
};

// Función para eliminar un objeto
export const deleteObject = async (bucketName, key) => {
  try {
    const response = await axios.post(`${API_URL}/delete-object`, {
      ...getCredentialsConfig(),
      bucketName,
      key
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Función para descargar un objeto
export const downloadObject = async (bucketName, key) => {
  try {
    const response = await axios.post(`${API_URL}/download-object`, {
      ...getCredentialsConfig(),
      bucketName,
      key
    }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Función para copiar un objeto entre buckets
export const copyObject = async (sourceBucket, sourceKey, destinationBucket, destinationKey) => {
  try {
    const credentials = getCredentialsConfig();
    const response = await axios.post(`${API_URL}/copy-object`, {
      ...credentials,
      sourceBucket,
      sourceKey,
      destinationBucket,
      destinationKey
    });
    return response.data;
  } catch (error) {
    console.error('Error copying object:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Función para mover un objeto entre buckets
export const moveObject = async (sourceBucket, sourceKey, destinationBucket, destinationKey) => {
  try {
    const credentials = getCredentialsConfig();
    const response = await axios.post(`${API_URL}/move-object`, {
      ...credentials,
      sourceBucket,
      sourceKey,
      destinationBucket,
      destinationKey
    });
    return response.data;
  } catch (error) {
    console.error('Error moving object:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Función para obtener la previsualización de un objeto
export const getObjectPreview = async (bucketName, key) => {
  try {
    const credentials = getCredentialsConfig();
    const response = await axios.post(`${API_URL}/preview-object`, {
      ...credentials,
      bucketName,
      key
    }, {
      responseType: 'blob'
    });
    
    return {
      data: response.data,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length']
    };
  } catch (error) {
    console.error('Error getting object preview:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Obtener política del bucket
export const getBucketPolicy = async (bucketName) => {
  try {
    const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });

    const command = new GetBucketPolicyCommand({
      Bucket: bucketName
    });

    const response = await s3Client.send(command);
    return JSON.parse(response.Policy);
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
      return null;
    }
    throw error;
  }
};

// Actualizar política del bucket
export const updateBucketPolicy = async (bucketName, policy) => {
  const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
  const s3Client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });

  const command = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: policy
  });

  await s3Client.send(command);
};

// Listar versiones de un objeto
export const listObjectVersions = async (bucketName, prefix = '') => {
  const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
  const s3Client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });

  const command = new ListObjectVersionsCommand({
    Bucket: bucketName,
    Prefix: prefix
  });

  const response = await s3Client.send(command);
  return response.Versions || [];
};

// Descargar una versión específica
export const downloadVersion = async (bucketName, key, versionId) => {
  const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
  const s3Client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    VersionId: versionId
  });

  const response = await s3Client.send(command);
  return response.Body;
};

// Obtener metadatos del objeto
export const getObjectMetadata = async (bucketName, key) => {
  try {
    const response = await axios.post(`${API_URL}/get-object-metadata`, {
      ...getCredentialsConfig(),
      bucketName,
      key
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Función para formatear bytes
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Función para generar URL presignada
export const getPresignedUrl = async (bucketName, key) => {
  try {
    const { credentials } = getCredentialsConfig();
    const region = credentials.region || 'us-west-2'; // Cambiado a us-west-2 por defecto
    
    // Crear el cliente S3 con la configuración correcta
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      },
      endpoint: undefined, // Dejar que AWS SDK maneje el endpoint automáticamente
      forcePathStyle: false // Usar virtual hosted-style URLs
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    // Generar URL con configuración específica para virtual hosted-style
    const url = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
      // Usar la región del bucket
      useArnRegion: true,
      // Asegurar que se use el endpoint correcto
      urlPrefix: `https://${bucketName}.s3.${region}.amazonaws.com`
    });

    return url;
  } catch (error) {
    console.error('Error generando URL presignada:', error);
    throw new Error(`Error al generar la URL presignada: ${error.message}`);
  }
};

// Obtener etiquetas de un objeto
export const getObjectTags = async (bucketName, key) => {
  try {
    const objectKey = `${bucketName}:${key}:tags`;
    const storedTags = localStorage.getItem(objectKey);
    return storedTags ? JSON.parse(storedTags) : [];
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    throw error;
  }
};

// Añadir una etiqueta a un objeto
export const addObjectTag = async (bucketName, key, newTag) => {
  try {
    const objectKey = `${bucketName}:${key}:tags`;
    const currentTags = await getObjectTags(bucketName, key);
    const updatedTags = [...currentTags, { Key: newTag.key, Value: newTag.value }];
    localStorage.setItem(objectKey, JSON.stringify(updatedTags));
    return updatedTags;
  } catch (error) {
    console.error('Error al añadir etiqueta:', error);
    throw error;
  }
};

// Eliminar una etiqueta de un objeto
export const removeObjectTag = async (bucketName, key, tagKey) => {
  try {
    const objectKey = `${bucketName}:${key}:tags`;
    const currentTags = await getObjectTags(bucketName, key);
    const updatedTags = currentTags.filter(tag => tag.Key !== tagKey);
    localStorage.setItem(objectKey, JSON.stringify(updatedTags));
    return updatedTags;
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    throw error;
  }
};

// Función para aplicar cifrado a un objeto
export const setObjectEncryption = async (bucketName, key, encryptionSettings) => {
  try {
    const response = await axios.post(`${API_URL}/set-encryption`, {
      ...getCredentialsConfig(),
      bucketName,
      key,
      encryptionSettings
    });
    return response.data;
  } catch (error) {
    console.error('Error al aplicar cifrado:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Configurar CORS para un bucket
export const configureBucketCors = async (bucketName) => {
  try {
    const response = await axios.post(`${API_URL}/configure-cors`, {
      ...getCredentialsConfig(),
      bucketName
    });
    
    console.log('Configuración CORS aplicada correctamente al bucket:', bucketName);
    return response.data;
  } catch (error) {
    console.error('Error al configurar CORS:', error);
    throw error.response?.data?.error || error.message;
  }
};

// Obtener configuración de cifrado del bucket
export const getBucketEncryption = async (bucketName) => {
  try {
    // Verificar si el bucket fue creado con cifrado
    const encryptedBuckets = JSON.parse(localStorage.getItem('encryptedBuckets') || '[]');
    const bucketEncryption = JSON.parse(localStorage.getItem(`encryption:${bucketName}`) || 'null');
    
    if (!encryptedBuckets.includes(bucketName)) {
      return null; // Si el bucket no fue creado con cifrado, retornamos null
    }
    
    return bucketEncryption;
  } catch (error) {
    console.error('Error al obtener cifrado del bucket:', error);
    return null;
  }
};

// Obtener configuración de cifrado de un objeto
export const getObjectEncryption = async (bucketName, key) => {
  try {
    const response = await axios.post(`${API_URL}/get-object-metadata`, {
      ...getCredentialsConfig(),
      bucketName,
      key
    });
    
    return {
      algorithm: response.data.serverSideEncryption, // 'AES256' o 'aws:kms'
      kmsKeyId: response.data.sseKMSKeyId // Solo presente si se usa KMS
    };
  } catch (error) {
    console.error('Error al obtener cifrado del objeto:', error);
    throw error.response?.data?.error || error.message;
  }
}; 
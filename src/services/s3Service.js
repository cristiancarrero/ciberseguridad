import { 
  S3Client, 
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  GetBucketPolicyCommand,
  DeleteBucketPolicyCommand,
  PutBucketCorsCommand
} from "@aws-sdk/client-s3";

let s3Client = null;

export const initializeS3Client = (credentials) => {
  try {
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
      throw new Error('Missing required AWS credentials');
    }

    s3Client = new S3Client({
      region: credentials.region || 'us-west-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    console.log('S3 client initialized successfully');
    return s3Client;
  } catch (error) {
    console.error('Failed to initialize S3 client:', error);
    throw error;
  }
};

export const getS3Client = () => {
  if (!s3Client) {
    const storedCredentials = localStorage.getItem('awsCredentials');
    if (storedCredentials) {
      initializeS3Client(JSON.parse(storedCredentials));
    } else {
      throw new Error('AWS credentials not found');
    }
  }
  return s3Client;
};

export const listBuckets = async () => {
  try {
    const client = getS3Client();
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    return response.Buckets || [];
  } catch (error) {
    console.error('Error listing buckets:', error);
    throw error;
  }
};

export const createBucket = async (bucketName) => {
  try {
    const client = getS3Client();
    const command = new CreateBucketCommand({
      Bucket: bucketName
    });
    await client.send(command);

    // Configurar CORS después de crear el bucket
    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: []
          }
        ]
      }
    });
    await client.send(corsCommand);

    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }
};

export const deleteBucket = async (bucketName) => {
  try {
    const client = getS3Client();
    const command = new DeleteBucketCommand({
      Bucket: bucketName
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting bucket:', error);
    throw error;
  }
};

export const listObjects = async (bucketName, prefix = '') => {
  try {
    const client = getS3Client();
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    });
    const response = await client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
};

export const uploadObject = async (bucketName, key, file) => {
  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: file.type
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error uploading object:', error);
    throw error;
  }
};

export const deleteObject = async (bucketName, key) => {
  try {
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting object:', error);
    throw error;
  }
};

export const getObject = async (bucketName, key) => {
  try {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error('Error getting object:', error);
    throw error;
  }
};

export const clearS3Client = () => {
  s3Client = null;
}; 
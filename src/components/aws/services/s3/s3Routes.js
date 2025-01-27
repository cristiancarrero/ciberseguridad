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
  generatePresignedUrl
} from './s3Controller.js';
import { S3Client, GetObjectTaggingCommand, PutObjectTaggingCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// ... resto del código ...

export { router }; 
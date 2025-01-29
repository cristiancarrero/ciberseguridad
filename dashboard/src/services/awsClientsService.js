import { EC2Client } from "@aws-sdk/client-ec2";
import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { STSClient } from "@aws-sdk/client-sts";
import { S3Client } from "@aws-sdk/client-s3";
import { KMSClient } from "@aws-sdk/client-kms";

let ec2Client = null;
let cloudWatchClient = null;
let stsClient = null;
let s3Client = null;
let kmsClient = null;

export const getAwsConfig = () => {
  const credentials = localStorage.getItem('awsCredentials');
  const region = localStorage.getItem('awsRegion');

  if (!credentials) {
    throw new Error('No hay credenciales AWS configuradas');
  }

  return {
    region: region || 'us-west-2',
    credentials: JSON.parse(credentials)
  };
};

export const getEC2Client = () => {
  if (!ec2Client) {
    ec2Client = new EC2Client(getAwsConfig());
  }
  return ec2Client;
};

export const getCloudWatchClient = () => {
  if (!cloudWatchClient) {
    cloudWatchClient = new CloudWatchClient(getAwsConfig());
  }
  return cloudWatchClient;
};

export const getSTSClient = () => {
  if (!stsClient) {
    stsClient = new STSClient(getAwsConfig());
  }
  return stsClient;
};

export const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client(getAwsConfig());
  }
  return s3Client;
};

export const getKMSClient = () => {
  if (!kmsClient) {
    kmsClient = new KMSClient(getAwsConfig());
  }
  return kmsClient;
};

export const resetClients = () => {
  ec2Client = null;
  cloudWatchClient = null;
  stsClient = null;
  s3Client = null;
  kmsClient = null;
}; 
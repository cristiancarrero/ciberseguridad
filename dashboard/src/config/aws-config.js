import { S3Client } from "@aws-sdk/client-s3";
import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { EC2Client } from "@aws-sdk/client-ec2";
import { IAMClient } from "@aws-sdk/client-iam";

let clients = {
  s3: null,
  cloudwatch: null,
  ec2: null,
  iam: null
};

export const initializeAWSClients = (credentials) => {
  const config = {
    region: credentials.region || 'us-west-2',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  clients.s3 = new S3Client(config);
  clients.cloudwatch = new CloudWatchClient(config);
  clients.ec2 = new EC2Client(config);
  clients.iam = new IAMClient(config);

  console.log('AWS clients initialized successfully');
};

export const getAWSClient = (service) => {
  if (!clients[service]) {
    const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
    if (awsConfig) {
      initializeAWSClients(awsConfig);
    } else {
      throw new Error('AWS no está configurado');
    }
  }
  return clients[service];
};

export const clearAWSClients = () => {
  clients = {
    s3: null,
    cloudwatch: null,
    ec2: null,
    iam: null
  };
}; 
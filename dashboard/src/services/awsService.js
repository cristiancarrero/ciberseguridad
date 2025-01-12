import { EC2Client, DescribeSecurityGroupsCommand, DescribeVpcsCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { IAMClient, ListUsersCommand } from "@aws-sdk/client-iam";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { CloudWatchClient, DescribeAlarmsCommand } from "@aws-sdk/client-cloudwatch";
import { GuardDutyClient, ListDetectorsCommand } from "@aws-sdk/client-guardduty";
import { initializeEC2Client } from './ec2Service';

let awsConfig = null;

export const initializeAWS = async (credentials) => {
  try {
    if (!credentials.sessionToken) {
      throw new Error('Se requiere un token de sesión para AWS Academy');
    }

    awsConfig = {
      region: credentials.region || 'us-west-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    };

    console.log('Inicializando AWS con configuración:', {
      region: awsConfig.region,
      hasAccessKey: !!awsConfig.credentials.accessKeyId,
      hasSecretKey: !!awsConfig.credentials.secretAccessKey,
      hasSessionToken: !!awsConfig.credentials.sessionToken
    });

    localStorage.setItem('awsConfig', JSON.stringify(awsConfig));
    
    initializeEC2Client(awsConfig);
    
    const ec2Client = new EC2Client(awsConfig);
    await ec2Client.send(new DescribeInstancesCommand({}));
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing AWS:', error);
    return { 
      success: false, 
      error: 'Error al conectar con AWS Academy. Verifica tus credenciales temporales.' 
    };
  }
};

export const loadAwsConfig = () => {
  const savedConfig = localStorage.getItem('awsConfig');
  if (savedConfig) {
    awsConfig = JSON.parse(savedConfig);
    initializeEC2Client(awsConfig);
    return true;
  }
  return false;
};

loadAwsConfig();

export const checkAwsServices = async () => {
  if (!awsConfig) {
    throw new Error('AWS no está inicializado');
  }

  const services = {
    ec2: false,
    iam: false,
    vpc: false,
    s3: false,
    cloudwatch: false,
    guardduty: false,
    ecs: false,
    config: false,
    eventbridge: false
  };

  try {
    // Verificar EC2
    try {
      const ec2Client = new EC2Client(awsConfig);
      await ec2Client.send(new DescribeInstancesCommand({}));
      services.ec2 = true;
    } catch (error) {
      console.log('EC2 no disponible:', error);
    }

    // Verificar VPC (usando el mismo cliente EC2)
    try {
      await ec2Client.send(new DescribeVpcsCommand({}));
      services.vpc = true;
    } catch (error) {
      console.log('VPC no disponible:', error);
    }

    // Verificar IAM
    try {
      const iamClient = new IAMClient(awsConfig);
      await iamClient.send(new ListUsersCommand({}));
      services.iam = true;
    } catch (error) {
      console.log('IAM no disponible:', error);
    }

    // Verificar S3
    try {
      const s3Client = new S3Client(awsConfig);
      await s3Client.send(new ListBucketsCommand({}));
      services.s3 = true;
    } catch (error) {
      console.log('S3 no disponible:', error);
    }

    // Verificar CloudWatch
    try {
      const cloudwatchClient = new CloudWatchClient(awsConfig);
      await cloudwatchClient.send(new DescribeAlarmsCommand({}));
      services.cloudwatch = true;
    } catch (error) {
      console.log('CloudWatch no disponible:', error);
    }

    // Verificar GuardDuty
    try {
      const guarddutyClient = new GuardDutyClient(awsConfig);
      await guarddutyClient.send(new ListDetectorsCommand({}));
      services.guardduty = true;
    } catch (error) {
      console.log('GuardDuty no disponible:', error);
    }

    return services;
  } catch (error) {
    console.error('Error checking AWS services:', error);
    throw error;
  }
};

const isCredentialValid = (credential) => {
  return typeof credential === 'string' && credential.length > 0;
};

export const validateCredentials = (credentials) => {
  if (!isCredentialValid(credentials.accessKeyId)) {
    throw new Error('Access Key ID no válido');
  }
  if (!isCredentialValid(credentials.secretAccessKey)) {
    throw new Error('Secret Access Key no válido');
  }
  if (!isCredentialValid(credentials.sessionToken)) {
    throw new Error('Session Token no válido');
  }
  if (!isCredentialValid(credentials.region)) {
    throw new Error('Región no válida');
  }
}; 
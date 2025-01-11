import { EC2Client, DescribeSecurityGroupsCommand, DescribeVpcsCommand } from "@aws-sdk/client-ec2";
import { IAMClient, ListUsersCommand } from "@aws-sdk/client-iam";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { CloudWatchClient, DescribeAlarmsCommand } from "@aws-sdk/client-cloudwatch";
import { GuardDutyClient, ListDetectorsCommand } from "@aws-sdk/client-guardduty";

let awsConfig = null;

export const initializeAWS = async (credentials) => {
  try {
    awsConfig = {
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    };
    
    // Verificar la conexión intentando listar usuarios IAM
    const iamClient = new IAMClient(awsConfig);
    await iamClient.send(new ListUsersCommand({}));
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing AWS:', error);
    return { 
      success: false, 
      error: 'Error al conectar con AWS. Verifica tus credenciales.' 
    };
  }
};

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
    guardduty: false
  };

  try {
    // Crear el cliente EC2 una sola vez para EC2 y VPC
    const ec2Client = new EC2Client(awsConfig);

    // Verificar EC2
    try {
      await ec2Client.send(new DescribeSecurityGroupsCommand({}));
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
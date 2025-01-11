import { EC2Client, DescribeInstancesCommand, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand, TerminateInstancesCommand } from "@aws-sdk/client-ec2";

let ec2Client = null;

export const initializeEC2Client = (credentials) => {
  ec2Client = new EC2Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  });
};

export const listInstances = async () => {
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    
    const instances = [];
    response.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
        instances.push({
          id: instance.InstanceId,
          name: nameTag?.Value || instance.InstanceId,
          type: instance.InstanceType,
          status: instance.State.Name,
          publicIp: instance.PublicIpAddress,
          privateIp: instance.PrivateIpAddress,
          launchTime: instance.LaunchTime
        });
      });
    });
    
    return instances;
  } catch (error) {
    console.error('Error listing EC2 instances:', error);
    throw error;
  }
};

export const launchInstance = async (instanceData) => {
  try {
    const command = new RunInstancesCommand({
      ImageId: 'ami-0c55b159cbfafe1f0', // Amazon Linux 2 AMI
      InstanceType: instanceData.type,
      KeyName: instanceData.keyPair,
      SecurityGroupIds: [instanceData.securityGroup],
      MinCount: 1,
      MaxCount: 1,
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [{
          Key: 'Name',
          Value: instanceData.name
        }]
      }]
    });
    
    const response = await ec2Client.send(command);
    return response.Instances[0].InstanceId;
  } catch (error) {
    console.error('Error launching EC2 instance:', error);
    throw error;
  }
};

export const startInstance = async (instanceId) => {
  try {
    const command = new StartInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
  } catch (error) {
    console.error('Error starting EC2 instance:', error);
    throw error;
  }
};

export const stopInstance = async (instanceId) => {
  try {
    const command = new StopInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
  } catch (error) {
    console.error('Error stopping EC2 instance:', error);
    throw error;
  }
};

export const terminateInstance = async (instanceId) => {
  try {
    const command = new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
  } catch (error) {
    console.error('Error terminating EC2 instance:', error);
    throw error;
  }
}; 
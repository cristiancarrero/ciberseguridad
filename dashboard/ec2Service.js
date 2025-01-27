import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";

let ec2Client = null;

export const getEC2Client = () => {
  if (!ec2Client) {
    console.warn('EC2Client no está inicializado');
  }
  return ec2Client;
};

export const initializeEC2Client = async (credentials) => {
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      console.error('Credenciales incompletas:', credentials);
      throw new Error('Credenciales incompletas');
    }

    // Crear nuevo cliente EC2
    const client = new EC2Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    // Verificar que el cliente se creó correctamente
    try {
      // Hacer una llamada simple para verificar las credenciales
      await client.send(new RunInstancesCommand({
        DryRun: true,
        ImageId: 'ami-test',
        InstanceType: 't2.micro',
        MinCount: 1,
        MaxCount: 1
      }));
    } catch (error) {
      // DryRun siempre fallará, pero nos dirá si las credenciales son válidas
      if (error.name === 'DryRunOperation') {
        console.log('Credenciales verificadas correctamente');
      } else {
        console.error('Error al verificar credenciales:', error);
        throw error;
      }
    }

    ec2Client = client;
    console.log('Cliente EC2 inicializado correctamente');
    return client;
  } catch (error) {
    console.error('Error al inicializar EC2 client:', error);
    ec2Client = null;
    throw error;
  }
};

export const launchInstance = async (instanceConfig) => {
  const client = getEC2Client();
  if (!client) {
    console.error('Cliente EC2 no disponible');
    throw new Error('EC2 Client no inicializado. Llame a initializeEC2Client primero.');
  }

  console.log('Lanzando nueva instancia EC2 con cliente:', !!client);
  
  try {
    const command = new RunInstancesCommand({
      ImageId: instanceConfig.imageId,
      InstanceType: instanceConfig.type,
      MinCount: 1,
      MaxCount: 1,
      KeyName: instanceConfig.keyName,
      SecurityGroups: [instanceConfig.securityGroup],
      TagSpecifications: [{
        ResourceType: "instance",
        Tags: [
          {
            Key: "Name",
            Value: instanceConfig.name
          }
        ]
      }]
    });

    const response = await client.send(command);
    console.log('Instancia lanzada correctamente:', response);
    return response;
  } catch (error) {
    console.error('Error al lanzar instancia:', error);
    throw error;
  }
}; 
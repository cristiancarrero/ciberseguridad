import { resetClients } from './awsClientsService';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { initializeSSMService } from './ssmService.js';

export const resetServices = () => {
  const config = loadAwsConfig();
  
  // Inicializar todos los servicios con las nuevas credenciales
  initializeSSMService({
    credentials: config.credentials,
    region: config.region
  });
  // ... inicializar otros servicios si es necesario ...
};

const configureAWS = async (credentials) => {
  try {
    // Guardar las credenciales en localStorage
    localStorage.setItem('awsCredentials', JSON.stringify({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }));
    localStorage.setItem('awsRegion', credentials.region || 'us-west-2');
    
    // Resetear los clientes de AWS para que usen las nuevas credenciales
    resetClients();
    resetServices();
    
    return true;
  } catch (error) {
    console.error('Error configurando AWS:', error);
    throw error;
  }
};

export const connectToAWS = async (credentials) => {
  try {
    console.log('Configurando credenciales AWS...');
    // Configurar las credenciales de AWS
    await configureAWS(credentials);
    
    // Verificar la conexión intentando una operación simple
    const isValid = await validateAWSConnection();
    
    if (!isValid) {
      throw new Error('No se pudo validar la conexión con AWS');
    }

    return true;
  } catch (error) {
    console.error('Error en connectToAWS:', error);
    throw new Error('No se pudo establecer la conexión con AWS');
  }
};

const validateAWSConnection = async () => {
  try {
    // Intentar una operación simple para validar las credenciales
    const sts = new STSClient({ 
      region: localStorage.getItem('awsRegion') || 'us-west-2',
      credentials: JSON.parse(localStorage.getItem('awsCredentials'))
    });
    await sts.send(new GetCallerIdentityCommand({}));
    return true;
  } catch (error) {
    console.error('Error validando conexión AWS:', error);
    return false;
  }
};

export const disconnectFromAWS = () => {
  try {
    localStorage.removeItem('awsCredentials');
    localStorage.removeItem('awsRegion');
    resetClients();
    return true;
  } catch (error) {
    console.error('Error desconectando de AWS:', error);
    throw error;
  }
};

export const isConnectedToAWS = () => {
  const credentials = localStorage.getItem('awsCredentials');
  return !!credentials;
};

// Si necesitas la función loadAwsConfig
export const loadAwsConfig = () => {
  const credentials = localStorage.getItem('awsCredentials');
  const region = localStorage.getItem('awsRegion');
  
  if (!credentials || !region) {
    throw new Error('No hay configuración de AWS guardada');
  }

  return {
    credentials: JSON.parse(credentials),
    region
  };
}; 
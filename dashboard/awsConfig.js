export const initializeAWS = () => {
  const credentials = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION || 'us-west-2'
  };

  // Verificación detallada de credenciales
  console.log('Verificando credenciales...');
  if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID) {
    console.error('ACCESS_KEY_ID no encontrada en variables de entorno');
  }
  if (!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
    console.error('SECRET_ACCESS_KEY no encontrada en variables de entorno');
  }
  if (!process.env.REACT_APP_AWS_REGION) {
    console.warn('REGION no encontrada en variables de entorno, usando default: us-west-2');
  }

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('Credenciales incompletas:', {
      hasAccessKey: !!credentials.accessKeyId,
      hasSecretKey: !!credentials.secretAccessKey,
      region: credentials.region
    });
    throw new Error('Credenciales incompletas');
  }

  return credentials;
}; 
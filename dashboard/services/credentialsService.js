let awsCredentials = null;

export const setAWSCredentials = (credentials) => {
  if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
    console.error('Intento de guardar credenciales inválidas');
    return false;
  }

  awsCredentials = {
    ...credentials,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
    console.log('Credenciales guardadas correctamente');
    return true;
  } catch (error) {
    console.error('Error al guardar credenciales:', error);
    return false;
  }
};

export const getAWSCredentials = () => {
  // Si no hay credenciales en memoria, intentar recuperar de localStorage
  if (!awsCredentials) {
    try {
      const storedCredentials = localStorage.getItem('awsCredentials');
      if (storedCredentials) {
        awsCredentials = JSON.parse(storedCredentials);
        console.log('Credenciales recuperadas de localStorage');
      }
    } catch (error) {
      console.error('Error al recuperar credenciales:', error);
      clearAWSCredentials();
      return null;
    }
  }

  // Verificar si las credenciales son válidas y no han expirado
  if (awsCredentials) {
    const expirationTime = 12 * 60 * 60 * 1000; // 12 horas
    if (Date.now() - awsCredentials.timestamp > expirationTime) {
      console.log('Credenciales expiradas');
      clearAWSCredentials();
      return null;
    }

    if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey) {
      console.log('Credenciales inválidas');
      clearAWSCredentials();
      return null;
    }

    return awsCredentials;
  }

  return null;
};

export const clearAWSCredentials = () => {
  console.log('Limpiando credenciales');
  awsCredentials = null;
  try {
    localStorage.removeItem('awsCredentials');
  } catch (error) {
    console.error('Error al limpiar credenciales:', error);
  }
};

export const isCredentialsValid = () => {
  const credentials = getAWSCredentials();
  return !!(credentials?.accessKeyId && credentials?.secretAccessKey);
}; 
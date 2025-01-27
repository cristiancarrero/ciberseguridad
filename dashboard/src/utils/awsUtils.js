export const parseAWSCredentials = (credentialsText) => {
  try {
    // Expresiones regulares para extraer las credenciales
    const accessKeyRegex = /aws_access_key_id\s*=\s*([A-Z0-9]+)/;
    const secretKeyRegex = /aws_secret_access_key\s*=\s*([A-Za-z0-9+/]+)/;
    const sessionTokenRegex = /aws_session_token\s*=\s*([A-Za-z0-9+/=]+)/;

    // Extraer valores
    const accessKeyMatch = credentialsText.match(accessKeyRegex);
    const secretKeyMatch = credentialsText.match(secretKeyRegex);
    const sessionTokenMatch = credentialsText.match(sessionTokenRegex);

    if (!accessKeyMatch || !secretKeyMatch || !sessionTokenMatch) {
      throw new Error('Formato de credenciales inválido');
    }

    return {
      accessKeyId: accessKeyMatch[1],
      secretAccessKey: secretKeyMatch[1],
      sessionToken: sessionTokenMatch[1]
    };
  } catch (error) {
    console.error('Error parseando credenciales:', error);
    throw new Error('Error al procesar las credenciales. Asegúrate de que el formato sea correcto.');
  }
}; 
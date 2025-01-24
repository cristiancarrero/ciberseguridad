import { ListKeysCommand, DescribeKeyCommand } from "@aws-sdk/client-kms";
import { getKMSClient } from './awsClientsService';

// Función para listar las claves KMS disponibles
export const listKMSKeys = async () => {
  try {
    const client = getKMSClient();
    const command = new ListKeysCommand({});
    const response = await client.send(command);
    
    // Obtener detalles de cada clave
    const keyDetails = await Promise.all(
      response.Keys.map(async (key) => {
        try {
          const describeCommand = new DescribeKeyCommand({
            KeyId: key.KeyId
          });
          const keyDetails = await client.send(describeCommand);
          return {
            KeyId: key.KeyId,
            Arn: key.KeyArn,
            ...keyDetails.KeyMetadata
          };
        } catch (error) {
          console.error(`Error al obtener detalles de la clave ${key.KeyId}:`, error);
          return null;
        }
      })
    );

    // Filtrar las claves nulas (error al obtener detalles) y las claves que no están activas
    return keyDetails
      .filter(key => key !== null && key.KeyState === 'Enabled')
      .map(key => ({
        id: key.KeyId,
        arn: key.Arn,
        description: key.Description || 'Sin descripción',
        enabled: key.KeyState === 'Enabled'
      }));
  } catch (error) {
    console.error('Error al listar claves KMS:', error);
    throw error;
  }
}; 
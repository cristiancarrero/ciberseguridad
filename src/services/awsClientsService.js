import { resetClient as resetSSMClient } from './ssmService';

export const resetClients = () => {
  resetSSMClient();
  // ... otros resets ...
}; 
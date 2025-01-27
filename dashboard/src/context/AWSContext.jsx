import React, { createContext, useContext, useState } from 'react';
import { connectToAWS, disconnectFromAWS, isConnectedToAWS } from '../services/awsService';

const AWSContext = createContext();

export const AWSProvider = ({ children }) => {
  const [instances, setInstances] = useState([]);
  const [securityGroups, setSecurityGroups] = useState([]);

  const updateInstances = (newInstances) => {
    setInstances(newInstances);
  };

  const updateSecurityGroups = (newGroups) => {
    setSecurityGroups(newGroups);
  };

  return (
    <AWSContext.Provider value={{
      instances,
      securityGroups,
      updateInstances,
      updateSecurityGroups
    }}>
      {children}
    </AWSContext.Provider>
  );
};

export const useAWS = () => {
  const context = useContext(AWSContext);
  if (context === undefined) {
    throw new Error('useAWS must be used within an AWSProvider');
  }
  return context;
};

export default AWSProvider; 
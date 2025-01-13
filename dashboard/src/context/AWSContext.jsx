import React, { createContext, useContext, useState } from 'react';

const AWSContext = createContext();

export const AWSProvider = ({ children }) => {
  const [instances, setInstances] = useState([]);
  const [securityGroups, setSecurityGroups] = useState([]);

  const updateInstances = (newInstances) => {
    console.log('Actualizando instancias:', newInstances);
    setInstances(newInstances);
  };

  const updateSecurityGroups = (newGroups) => {
    console.log('Actualizando security groups:', newGroups);
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

export const useAWS = () => useContext(AWSContext);

export default AWSProvider; 
import React, { useState } from 'react';
import GuardDutyManager from './aws/services/guardduty/GuardDutyManager';

const [awsServices, setAwsServices] = useState(() => {
  const savedServices = localStorage.getItem('awsServices');
  return savedServices ? JSON.parse(savedServices) : {
    // ... otros servicios ...
    guardduty: false, // GuardDuty no está disponible
  };
}); 
import React, { useState } from 'react';
import { useAWS } from '../context/AWSContext';

export const Login = () => {
  const { login } = useAWS();
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-west-2'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);
    if (success) {
      // Redirigir a dashboard
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario de login */}
    </form>
  );
}; 
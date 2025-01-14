import { useAWS } from '../context/AWSContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { setCredentials } = useAWS();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      // ... lógica de login
      setCredentials(credentials);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  // ... resto del componente
}; 
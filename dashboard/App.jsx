import { AWSProvider } from './AWSContext';
import { EC2Manager } from './EC2Manager';

function App() {
  return (
    <AWSProvider>
      <EC2Manager />
    </AWSProvider>
  );
} 
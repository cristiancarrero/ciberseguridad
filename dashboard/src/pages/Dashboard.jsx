import React, { useState } from 'react';
import { FaAws } from 'react-icons/fa';
import AWSServiceWidget from '../components/AWSServiceWidget';
import AwsConnectModal from '../components/AwsConnectModal';
import "../styles/responsive.css";
import "../styles/dashboard.css";
import "../styles/components/modal.css";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const services = ['CloudWatch', 'EC2', 'IAM', 'Security'];

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="aws-connect">
          <button 
            className="connect-aws-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <FaAws /> Conectar AWS
          </button>
        </div>

        <div className="services-grid">
          {services.map(service => (
            <AWSServiceWidget key={service} service={service} />
          ))}
        </div>

        <AwsConnectModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard; 
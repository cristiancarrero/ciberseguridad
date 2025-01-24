import React, { useState } from 'react';
import { FaAws } from 'react-icons/fa';
import AWSServiceWidget from '../components/AWSServiceWidget';
import AwsConnectModal from '../components/AwsConnectModal';
import S3Manager from '../components/aws/services/s3/S3Manager';
import "../styles/responsive.css";
import "../styles/dashboard.css";
import "../styles/components/modal.css";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isS3ManagerOpen, setIsS3ManagerOpen] = useState(false);
  const services = ['CloudWatch', 'EC2', 'IAM', 'Security', 'S3'];

  const handleServiceClick = (service) => {
    if (service === 'S3') {
      setIsS3ManagerOpen(true);
    }
  };

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
            <AWSServiceWidget 
              key={service} 
              service={service} 
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>

        <AwsConnectModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {isS3ManagerOpen && (
          <div className="aws-dashboard s3-wrapper">
            <S3Manager onClose={() => setIsS3ManagerOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
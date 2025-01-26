import AWS from 'aws-sdk';

if (typeof window !== 'undefined') {
  window.global = window;
  window.process = {
    env: { DEBUG: undefined },
  };
}

AWS.config.update({
  customUserAgent: 'dashboard-app'
});

export default AWS; 
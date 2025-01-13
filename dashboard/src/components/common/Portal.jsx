import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
  const modalRoot = document.getElementById('modal-root');

  return createPortal(children, modalRoot);
};

export default Portal; 
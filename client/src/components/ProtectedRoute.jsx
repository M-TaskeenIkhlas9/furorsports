import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminAuthenticated')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  if (!localStorage.getItem('adminAuthenticated')) {
    return null;
  }

  return children;
};

export default ProtectedRoute;


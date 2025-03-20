import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VendorRoute = ({ children }) => {
  const { isAuthenticated, isVendor } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!isVendor()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default VendorRoute; 
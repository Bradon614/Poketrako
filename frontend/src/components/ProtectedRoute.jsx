import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api';

// Redirects to the login page when there is no token in localStorage. This is
// a presence check only — an expired or invalid token is rejected by the API
// on the first request (401), it doesn't need to be validated here too.
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;

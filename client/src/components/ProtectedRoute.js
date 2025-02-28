// Component for protected routes
import { Navigate } from 'react-router-dom';

// Component that checks if the user is logged in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('token');
  // If the user is logged in, render the children
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
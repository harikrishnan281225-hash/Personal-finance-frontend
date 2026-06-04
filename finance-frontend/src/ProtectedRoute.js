import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isPublicOnly }) => {
  const token = localStorage.getItem("token");

  // If page is public-only (Login/Signup) and user is logged in, send to Dashboard
  if (isPublicOnly && token) return <Navigate to="/dashboard" />;
  
  // If page is private and user is NOT logged in, send to Login
  if (!isPublicOnly && !token) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
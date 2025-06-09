import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { token, user, isLoading, isAdmin, isHR, canAccessManagement } = useAuth();
  const location = useLocation();

  // Role checks are temporarily disabled to match original behavior
  // The canAccessManagement function now returns true for all authenticated users

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Temporarily disable role checks for testing
  // TODO: Re-enable role-based access control once user roles are properly configured
  /*
  // Check role-based access
  if (requiredRole) {
    switch (requiredRole) {
      case 'admin':
        if (!isAdmin()) {
          console.log('Access denied: Admin role required');
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'hr':
        if (!isHR()) {
          console.log('Access denied: HR role required');
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'management':
        if (!canAccessManagement()) {
          console.log('Access denied: Management role required');
          return <Navigate to="/dashboard" replace />;
        }
        break;
      default:
        break;
    }
  }
  */

  return children;
};

export default ProtectedRoute;

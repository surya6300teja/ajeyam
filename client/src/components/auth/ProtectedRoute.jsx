import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component that restricts access to authenticated users only
 * @param {Object} props - Component props
 * @param {boolean} props.adminOnly - Whether the route is admin-only
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if trying to access admin-only route without admin rights
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute; 
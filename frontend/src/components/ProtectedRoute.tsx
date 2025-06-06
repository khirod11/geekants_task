import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('engineer' | 'manager')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}; 
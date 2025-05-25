import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isLoading, refreshUserData } = useAuth();
  const location = useLocation();
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  useEffect(() => {
    // If we don't have a user but have a token in storage
    const checkToken = async () => {
      if (!user && !isLoading) {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          // To prevent loops, first check if we've already tried refreshing recently
          const lastAttempt = localStorage.getItem('lastAuthCheck');
          const now = Date.now();
          
          if (!lastAttempt || (now - parseInt(lastAttempt)) > 10000) { // Only try every 10 seconds
            localStorage.setItem('lastAuthCheck', now.toString());
            setIsCheckingToken(true);
            try {
              await refreshUserData();
            } catch (err) {
              console.error('Failed to refresh user data in protected route:', err);
            } finally {
              setIsCheckingToken(false);
            }
          }
        }
      }
    };
    
    checkToken();
  }, [user, isLoading, refreshUserData]);

  // If we're loading or checking token, show loading spinner
  if (isLoading || isCheckingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0) {
    // Make sure user.role exists before comparing
    if (!user.role) {
      console.error('User role is undefined or null');
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Case-insensitive comparison for roles
    const hasRequiredRole = roles.some(role => 
      user.role.toLowerCase() === role.toLowerCase()
    );
    
    console.log('Role check:', { userRole: user.role, requiredRoles: roles, hasRequiredRole });
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute; 
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  apiLogin, 
  apiRequestSignupCode, 
  apiConfirmSignupCode, 
  apiGetCurrentUser,
  apiRequestPasswordReset,
  apiResetPassword,
  apiRefreshToken 
} from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  requestSignupCode: (userData: RegisterData) => Promise<void>;
  confirmSignupCode: (email: string, token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
  forceUserDataRefresh: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user state from localStorage if available for instant loading
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUserData = localStorage.getItem('userData');
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (err) {
      console.error('Failed to parse stored user data on init:', err);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if token is expired (approximate check based on JWT structure)
  const isTokenExpired = (token: string): boolean => {
    try {
      // Get the payload part of the JWT (second part)
      const payload = token.split('.')[1];
      // Decode the base64 encoded payload
      const decodedPayload = JSON.parse(atob(payload));
      // Check if the token has an expiration time
      if (decodedPayload.exp) {
        // exp is in seconds, Date.now() is in milliseconds
        return decodedPayload.exp * 1000 < Date.now();
      }
      return false; // If no exp claim, assume not expired
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true; // If we can't parse the token, assume it's expired
    }
  };

  // Track the last time we attempted a token refresh to prevent loops
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number>(0);
  
  // Function to refresh user data (memoized to prevent infinite loops)
  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUserData = localStorage.getItem('userData');
    const now = Date.now();
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    // If we have storedUserData and no force refresh is requested, use it immediately
    // This provides immediate user data while we validate/refresh in background
    if (storedUserData && !user && !forceRefresh) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUser(parsedUserData);
        // Don't set isLoading to false yet, continue with token validation
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        // Continue with normal refresh flow
      }
    }

    // Check if token is expired and we have a refresh token
    // Only attempt refresh if we haven't tried in the last 10 seconds (prevents loops)
    if (isTokenExpired(token) && refreshToken && (now - lastRefreshAttempt > 10000)) {
      try {
        setLastRefreshAttempt(now);
        console.log('Access token expired, attempting to refresh...');
        const { token: newToken, refreshToken: newRefreshToken } = await apiRefreshToken(refreshToken);
        
        if (!newToken || !newRefreshToken) {
          throw new Error('Invalid tokens received from refresh endpoint');
        }
        
        // Update tokens in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log('Token refreshed successfully');
      } catch (err: any) {
        console.error('Failed to refresh token:', err);
        // Check for specific error messages that indicate we should logout
        const errorMsg = err.message?.toLowerCase() || '';
        const shouldLogout = errorMsg.includes('denied') || 
                           errorMsg.includes('invalid') || 
                           errorMsg.includes('expired') ||
                           errorMsg.includes('unauthorized');
        
        if (shouldLogout) {
          console.log('Authentication error detected, logging out');
          // If refresh fails due to auth issues, clear tokens and user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsLoading(false);
          // Only navigate to login if we're not already there
          if (!location.pathname.includes('/login')) {
            navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
          }
          return;
        }
      }
    }

    // If we have a valid user in localStorage and we're not forcing a refresh,
    // skip the validation to prevent unnecessary API calls that could cause loops
    if (user && !forceRefresh) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await apiGetCurrentUser();
      if (userData) {
        // Update the stored user data
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
      } else {
        // If we got a successful response but no user data, something is wrong
        throw new Error('Invalid user data received');
      }
    } catch (err: any) {
      console.error('Failed to refresh user data:', err);
      
      const errorMsg = err.message?.toLowerCase() || '';
      // Only clear tokens and redirect on specific authentication errors
      if (errorMsg.includes('unauthorized') || 
          errorMsg.includes('forbidden') || 
          errorMsg.includes('401') || 
          errorMsg.includes('403')) {
        
        // Avoid clearing tokens if we're just having temporary connection issues
        if (!errorMsg.includes('network') && !errorMsg.includes('timeout')) {
          // Authentication error - clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          setUser(null);
          
          // Only navigate to login if we're not already there and not in the auth flow
          if (!location.pathname.includes('/login') && 
              !location.pathname.includes('/register') && 
              !location.pathname.includes('/verify')) {
            navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
          }
        }
      } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, forceRefresh]);

  // Update useEffect to use refreshUserData
  useEffect(() => {
    refreshUserData();
    // Reset force refresh flag after refresh
    setForceRefresh(false);
  }, [refreshUserData, forceRefresh]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { token, refreshToken, user: userData } = await apiLogin(email, password);
      
      // Log the user data for debugging
      console.log('Login successful:', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Save user data in localStorage for persistence and refresh token purposes
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
      
      // Get redirect path from location state if available
      const locationState = location.state as any;
      // Fix case sensitivity in role check
      const isSeller = userData.role && userData.role.toLowerCase() === 'seller';
      const redirectPath = locationState?.from || (isSeller ? '/seller/dashboard' : '/dashboard');
      
      console.log('Redirecting to:', redirectPath);
      
      // Redirect based on user role or stored path
      // Small timeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate(redirectPath);
      }, 100);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestSignupCode = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequestSignupCode({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        role: userData.role
      });
      navigate('/verify-email', { 
        state: { 
          email: userData.email,
          message: 'Registration successful! Please verify your email to continue.' 
        } 
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignupCode = async (email: string, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiConfirmSignupCode(email, token);
      navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
    } catch (err: any) {
      console.error('Verification code confirmation failed:', err);
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiRequestPasswordReset(email);
      // Keep user on forgot password page, let the component handle success message
      return true;
    } catch (err: any) {
      console.error('Password reset request failed:', err);
      setError(err.message || 'Failed to request password reset. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiResetPassword(email, token, newPassword);
      navigate('/login', { state: { message: 'Password reset successful! You can now log in with your new password.' } });
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    requestSignupCode,
    confirmSignupCode,
    requestPasswordReset,
    resetPassword,
    logout,
    clearError,
    refreshUserData,
    forceUserDataRefresh: () => setForceRefresh(true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiReactivateAccountByToken } from '../../services/api';

const AccountReactivationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hasAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple attempts if the effect runs more than once
    if (hasAttemptedRef.current) return;
    
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const token = queryParams.get('token');
    
    if (!email || !token) {
      setError('Invalid reactivation link. Please check your email for the correct link.');
      return;
    }
    
    const reactivateAccount = async () => {
      // Mark that we've attempted reactivation
      hasAttemptedRef.current = true;
      
      // Reset any previous states
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      try {
        // Log the attempt with parameters
        console.log('Attempting account reactivation with:', { email, token });
        
        // Call the API
        const result = await apiReactivateAccountByToken(email, token);
        console.log('Reactivation API response:', result);
        
        // Set success state
        setError(null); // Ensure no error is shown
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Your account has been reactivated. You can now log in.' } 
          });
        }, 3000);
      } catch (err: any) {
        // Handle error
        console.error('Reactivation error:', err);
        setSuccess(false); // Ensure success is not shown
        setError(err.message || 'Failed to reactivate account. The link may have expired.');
      } finally {
        setIsLoading(false);
      }
    };
    
    reactivateAccount();
  }, [location, navigate]);
  
  // Determine which state to display - only one should be shown at a time
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Reactivating your account...
          </p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Reactivation Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to login
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (success) {
      return (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Account Reactivated</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your account has been successfully reactivated. Redirecting to login page...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Default state - shouldn't normally be visible but provides a fallback
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Processing your account reactivation...</p>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Reactivation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We're processing your account reactivation request
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountReactivationPage;

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmSignupCode, error: authError } = useAuth();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get email from location state or query parameters
  useEffect(() => {
    const state = location.state as { email?: string } | undefined;
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    const tokenParam = queryParams.get('token');
    
    // Set email from state or query param
    if (state?.email) {
      setEmail(state.email);
    } else if (emailParam) {
      setEmail(emailParam);
    }
    
    // If token is in URL, set it
    if (tokenParam) {
      setToken(tokenParam);
    }
    
    // If email and token are in URL, verify automatically
    if (emailParam && tokenParam) {
      handleVerify(tokenParam, emailParam);
    }
  }, [location]);
  
  const handleVerify = async (verificationToken: string, userEmail: string) => {
    setIsVerifying(true);
    try {
      await confirmSignupCode(userEmail, verificationToken);
      setVerificationStatus('success');
    } catch (err) {
      setVerificationStatus('error');
      setErrorMessage((err as Error).message || 'Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerify(token, email);
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isVerifying ? (
            <div className="text-center py-6">
              <svg className="animate-spin mx-auto h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-lg text-gray-900">Verifying your email...</p>
            </div>
          ) : verificationStatus === 'success' ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
                <svg className="h-16 w-16 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Email Verified!</h3>
              <p className="mt-2 text-base text-gray-500">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : verificationStatus === 'error' ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
                <svg className="h-16 w-16 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-base text-gray-500">
                {errorMessage || authError || "We couldn't verify your email. The link may have expired or is invalid."}
              </p>
              <div className="mt-6 space-y-4">
                <button
                  onClick={() => navigate(0)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Try Again
                </button>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!email ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    We've sent a verification code to <span className="font-semibold">{email}</span>
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter verification code"
                  />
                </div>
              </div>
              
              {authError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{authError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Verify Email
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive a code? <button type="button" className="font-medium text-primary-600 hover:text-primary-500">Resend</button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  acceptTerms?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { requestSignupCode, error: authError, clearError } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    role: 'User', // Default role
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }

    // Clear auth error when typing
    if (authError) {
      clearError();
    }

    // Clear error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateStep1 = () => {
    const stepErrors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      stepErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      stepErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      stepErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      stepErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      stepErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const stepErrors: FormErrors = {};
    let isValid = true;

    // Username validation
    if (!formData.username) {
      stepErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      stepErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Role validation
    if (!formData.role) {
      stepErrors.role = 'Please select a role';
      isValid = false;
    }

    // Terms validation
    if (!formData.acceptTerms) {
      stepErrors.acceptTerms = 'You must accept the terms and conditions';
      isValid = false;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      nextStep();
      return;
    }

    // Validate second step before submission
    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Only send fields that backend expects
      await requestSignupCode({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      
      // Navigation happens in the AuthContext after successful API call
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to register. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-300'} text-white`}>
                  1
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Account</div>
              </div>
              <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'} text-white`}>
                  2
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">Profile</div>
              </div>
            </div>
          </div>

          {(errorMessage || authError) && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
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
                  <p className="text-sm font-medium text-red-800">{errorMessage || authError}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
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
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.role ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      required
                    >
                      <option value="User">User (I want to hire services)</option>
                      <option value="Seller">Seller (I want to offer services)</option>
                    </select>
                    {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                    I accept the <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms and Conditions</Link>
                  </label>
                </div>
                {errors.acceptTerms && <p className="mt-2 text-sm text-red-600">{errors.acceptTerms}</p>}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
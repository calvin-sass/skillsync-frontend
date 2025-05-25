import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiUpdateUserProfile, apiUploadAvatar, apiDeleteAccount, apiChangePassword, apiGetCurrentUser } from '../../services/api';

const ProfilePage: React.FC = () => {
  const { user, logout, refreshUserData, forceUserDataRefresh } = useAuth();

  // Component state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Fetch the full user profile data from the API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsProfileLoading(true);
        setError(null);

        const userData = await apiGetCurrentUser();
        console.log('Fetched user profile data:', userData);
        
        // Update form data with the complete user profile
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',  // This should now come from the API
          address: userData.address || '', // This should now come from the API
        });
        
        // Check for avatar URL in the API response
        if (userData.avatarUrl) {
          // Add cache-busting parameter to force refresh
          console.log('Setting avatar preview from API:', userData.avatarUrl);
          setAvatarPreview(`${userData.avatarUrl}?t=${new Date().getTime()}`);
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data. Please refresh and try again.');
        
        // Fallback to auth context data if API fails
        if (user) {
          setFormData({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          });
        }
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]); // Still depend on user to re-fetch if the logged in user changes
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const deleteInputRef = useRef<HTMLInputElement>(null);

  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Set avatar preview when user data changes or when the component loads
  useEffect(() => {
    console.log('User data changed:', user);
    if (user?.avatarUrl) {
      // Add cache-busting parameter to force refresh
      console.log('Setting avatar preview from user context:', user.avatarUrl);
      setAvatarPreview(`${user.avatarUrl}?t=${new Date().getTime()}`);
    } else {
      console.log('No avatarUrl found in user data');
    }
  }, [user]);
  
  // Debug form data changes
  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setIsUploadingAvatar(true);
    setError(null);
    
    try {
      const { avatarUrl } = await apiUploadAvatar(avatarFile);
      
      // Add a timestamp to force browser to refresh the image instead of using cached version
      const avatarUrlWithCache = `${avatarUrl}?t=${new Date().getTime()}`;
      setAvatarPreview(avatarUrlWithCache);
      
      // Refetch current user to update auth context with new avatar
      try {
        // Force refresh user data in the auth context
        refreshUserData && await refreshUserData();
        // Force an immediate refresh of the auth context
        forceUserDataRefresh && forceUserDataRefresh();
      } catch (userErr) {
        console.error('Failed to refresh user data after avatar update:', userErr);
      }
      
      setSuccessMessage('Profile photo updated successfully!');
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiUpdateUserProfile({
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
      });
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError(null);
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords don't match");
      setIsLoading(false);
      return;
    }
    
    try {
      await apiChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully!');
      setShowPasswordModal(false);
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      // Keep focus on the input after error
      if (deleteInputRef.current) {
        deleteInputRef.current.focus();
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiDeleteAccount();
      setSuccessMessage('Your account has been deleted.');
      // Log user out
      logout();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  const PasswordChangeModal: React.FC = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        
        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {passwordError}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordInputChange}
                  required
                  className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteAccountModal: React.FC = () => {
    // Maintain focus on the input field
    useEffect(() => {
      if (deleteInputRef.current) {
        deleteInputRef.current.focus();
      }
    }, [showDeleteModal, error]);
    
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
          <p className="text-sm text-gray-500 mt-1">
            This action cannot be undone. All your data will be permanently removed.
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          
          <div className="mt-4">
            <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-700">
              Please type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              id="confirm-delete"
              ref={deleteInputRef}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-red-400"
            />
          </div>
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
  );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-5 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {showPasswordModal && <PasswordChangeModal />}
      {showDeleteModal && <DeleteAccountModal />}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Personal Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your personal details and contact information
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit
            </button>
          )}
        </div>

        {/* Profile image section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Debug avatar URLs */}
                {(() => { console.log('Avatar rendering - Preview:', avatarPreview, 'User avatar URL:', user?.avatarUrl); return null; })()}
                <img 
                  src={avatarPreview || (user?.avatarUrl ? `${user.avatarUrl}?t=${new Date().getTime()}` : 'https://via.placeholder.com/150?text=No+Image')} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover"
                  key={avatarPreview} /* Add key to force re-render when preview changes */
                  onError={(e) => {
                    console.log('Error loading avatar image, trying fallback');
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input 
                  id="avatar-upload" 
                  name="avatar" 
                  type="file" 
                  accept="image/*" 
                  className="sr-only" 
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
              <p className="text-xs text-gray-500">JPG or PNG. 1MB max.</p>
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 bg-gray-50 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">To change your email, please contact support</p>
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="shadow-md py-2.5 px-3 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ease-in-out hover:border-primary-400"
                      placeholder="Street, City, Country"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          ) : isProfileLoading ? (
            <div className="p-4 sm:p-6 flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">Loading profile information...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.username}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.phone || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.address || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your account preferences and security settings
          </p>
        </div>
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password</h4>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Change password
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete account</h4>
              <p className="mt-1 text-sm text-gray-500">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 

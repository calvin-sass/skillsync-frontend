import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { 
  ServiceDto, 
  ServiceCreateDto, 
  ServiceUpdateDto, 
  ServicePatchDto,
  ServiceFilters,
  BookingCreateDto,
  BookingDto,
  PaymentCreateDto,
  PaymentResponseDto,
  ReviewCreateDto,
  ReviewDto,
  ReviewUpdateDto,
  Notification
} from '../types';

// Create API instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7205/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
let isRefreshing = false;

// Store pending requests that should be retried after token refresh
let pendingRequests: Array<{
  config: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    
    // Handle specific status codes
    if (response) {
      // If received 401 error and it's not a refresh token request
      if (response.status === 401 && !config.url.includes('Auth/refresh')) {
        const originalRequest = config;
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Create a promise that will be resolved when token refresh is done
          const retryRequestPromise = new Promise((resolve, reject) => {
            pendingRequests.push({
              config: originalRequest,
              resolve,
              reject
            });
          });
          
          // If not already refreshing, start the refresh process
          if (!isRefreshing) {
            isRefreshing = true;
            console.log('Token expired, attempting to refresh...');
            
            try {
              const { token, refreshToken: newRefreshToken } = await apiRefreshToken(refreshToken);
              
              // Update tokens in localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry all pending requests with new token
              pendingRequests.forEach(request => {
                request.config.headers.Authorization = `Bearer ${token}`;
                request.resolve(apiClient(request.config));
              });
              
              // Clear pending requests
              pendingRequests = [];
              isRefreshing = false;
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              
              // Reject all pending requests
              pendingRequests.forEach(request => {
                request.reject(refreshError);
              });
              
              // Clear pending requests
              pendingRequests = [];
              
              // Clear user data on refresh failure
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userData');
              isRefreshing = false;
              
              // Use navigate instead of window.location to avoid full page reloads
              // Don't redirect automatically to prevent infinite loops
              console.error('Token refresh failed, user needs to log in again');
              return Promise.reject(refreshError);
            }
          }
          
          return retryRequestPromise;
        } else {
          // No refresh token available, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          
          // Redirect to login but don't lose the current URL
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      } else if (response.status === 403) {
        // Forbidden - redirect to unauthorized page
        window.location.href = '/unauthorized';
      } else if (response.status === 404) {
        // Not Found - provide specific error message
        return Promise.reject(new Error('The requested resource was not found.'));
      }
    }
    
    // Return standardized error messages
    const errorMessage = response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper function to extract response data
const handleResponse = <T>(response: AxiosResponse): T => response.data;

// Auth API functions
export const apiLogin = async (email: string, password: string) => {
  const response = await apiClient.post('/v1/Auth/login', { email, password });
  const responseData = handleResponse<{ token: string; refreshToken: string; user: any }>(response);
  console.log('Login response user data:', responseData.user);
  return responseData;
};

export const apiRequestSignupCode = async (userData: any) => {
  const response = await apiClient.post('/v1/Auth/request-signup-code', userData);
  return handleResponse<{ message: string }>(response);
};

export const apiConfirmSignupCode = async (email: string, token: string) => {
  const response = await apiClient.post('/v1/Auth/confirm-signup-code', { email, token });
  return handleResponse<{ message: string }>(response);
};

export const apiRefreshToken = async (refreshToken: string) => {
  // Get the user email from localStorage
  let userEmail = '';
  try {
    // Try to extract email from user data in localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      userEmail = user.email || '';
    }
  } catch (e) {
    console.error('Error extracting user email from localStorage:', e);
  }

  // If we couldn't get the email from localStorage, try another approach
  if (!userEmail) {
    try {
      // Check if we can extract it from the JWT token
      const token = localStorage.getItem('token');
      if (token) {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        userEmail = decodedPayload.email || '';
      }
    } catch (e) {
      console.error('Error extracting email from JWT token:', e);
    }
  }

  console.log('Attempting to refresh token for email:', userEmail);
  try {
    // Send refresh token request with email and token as expected by the DTO
    const response = await apiClient.post('/v1/Auth/refresh', { 
      email: userEmail, 
      token: refreshToken 
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Token refresh successful');
    return handleResponse<{ token: string; refreshToken: string }>(response);
  } catch (error) {
    console.error('Refresh token request failed:', error);
    throw error;
  }
};

export const apiRequestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/v1/Auth/request-password-reset', JSON.stringify(email), {
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse<{ message: string }>(response);
};

export const apiResetPassword = async (email: string, token: string, newPassword: string) => {
  const response = await apiClient.post('/v1/Auth/reset-password', { email, token, newPassword });
  return handleResponse<{ message: string }>(response);
};

// User profile API functions
export const apiGetCurrentUser = async () => {
  try {
    console.log('Fetching current user data...');
    const response = await apiClient.get('/v1/User/me', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const userData = handleResponse<any>(response);
    console.log('Raw user data from API:', JSON.stringify(userData, null, 2));
    
    // Log the exact fields we need
    console.log('Phone field:', userData.phone);
    console.log('Address field:', userData.address);
    console.log('Avatar URL field:', userData.avatarUrl);
    console.log('Alternative phone field:', userData.phoneNumber);
    console.log('Alternative avatar field:', userData.profilePictureUrl);
    
    // Log all available fields to find any unexpected naming
    console.log('All available user data fields:', Object.keys(userData));
    
    // Ensure all profile fields are properly mapped
    // This handles different API response formats
    const mappedUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || userData.phoneNumber || '',
      address: userData.address || '',
      avatarUrl: userData.avatarUrl || userData.profilePictureUrl || ''
    };
    
    console.log('Mapped user data:', mappedUser);
    return mappedUser;
  } catch (error) {
    console.error('Error in apiGetCurrentUser:', error);
    throw error;
  }
};

export const apiUpdateUserProfile = async (userData: any) => {
  const response = await apiClient.patch('/v1/User/update', userData);
  return handleResponse<any>(response);
};

export const apiChangePassword = async (currentPassword: string, newPassword: string) => {
  const response = await apiClient.post('/v1/User/change-password', { currentPassword, newPassword });
  return handleResponse<{ message: string }>(response);
};

export const apiUploadAvatar = async (avatarFile: File) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  const response = await apiClient.post('/v1/User/avatar', formData, config);
  return handleResponse<{ avatarUrl: string }>(response);
};

export const apiDeleteAccount = async () => {
  const response = await apiClient.delete('/v1/User/delete');
  return handleResponse<{ message: string }>(response);
};

export const apiReactivateAccount = async () => {
  const response = await apiClient.post('/v1/User/reactivate');
  return handleResponse<{ message: string }>(response);
};

// Service API functions
export const apiGetServices = async (filters?: ServiceFilters) => {
  const params: ServiceFilters = filters || {};
  
  const response = await apiClient.get('/v1/Service', { params });
  return handleResponse<ServiceDto[]>(response);
};

export const apiGetSellerServices = async () => {
  try {
    const response = await apiClient.get('/v1/Service/seller');
    return handleResponse<ServiceDto[]>(response);
  } catch (error) {
    console.error('Error fetching seller services:', error);
    throw error;
  }
};

export const apiGetServiceById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/v1/Service/${id}`);
    return handleResponse<ServiceDto>(response);
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

export const apiCreateService = async (serviceData: ServiceCreateDto) => {
  try {
    const response = await apiClient.post('/v1/Service', serviceData);
    return handleResponse<ServiceDto>(response);
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const apiUploadServiceImage = async (serviceId: number, imageFile: File) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    
    // Use capitalized property names to match backend DTO
    formData.append('Image', imageFile);  // 'Image' exactly matches the backend DTO property name
    formData.append('ServiceId', serviceId.toString());  // 'ServiceId' exactly matches the backend DTO property name
    
    // Create a custom config to handle multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await apiClient.post('/v1/Service/images/upload', formData, config);
    return handleResponse<{ imageUrl: string }>(response);
  } catch (error) {
    console.error('Error uploading service image:', error);
    throw error;
  }
};

export const apiUpdateService = async (id: string | number, serviceData: ServiceUpdateDto) => {
  const response = await apiClient.put(`/v1/Service/${id}`, serviceData);
  return handleResponse<{ message: string }>(response);
};

export const apiPatchService = async (id: string | number, partialData: ServicePatchDto) => {
  const response = await apiClient.patch(`/v1/Service/${id}`, partialData);
  return handleResponse<{ message: string }>(response);
};

export const apiDeleteService = async (id: string | number) => {
  const response = await apiClient.delete(`/v1/Service/${id}`);
  return handleResponse<{ message: string }>(response);
};

export const apiDeleteServiceImage = async (serviceId: number, imageId: number) => {
  try {
    const response = await apiClient.delete(`/v1/Service/${serviceId}/images/${imageId}`);
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error deleting service image:', error);
    throw error;
  }
};

// Booking API functions
export const apiCreateBooking = async (bookingData: BookingCreateDto) => {
  try {
    const response = await apiClient.post('/v1/Booking', bookingData);
    return handleResponse<BookingDto>(response);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const apiGetUserBookings = async () => {
  try {
    const response = await apiClient.get('/v1/Booking/my');
    return handleResponse<BookingDto[]>(response);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const apiGetSellerBookings = async () => {
  try {
    const response = await apiClient.get('/v1/Booking/seller?includeDetails=true');
    const bookings = handleResponse<BookingDto[]>(response);
    
    // If the API doesn't return the detailed fields, we can enhance them on the client side
    // by fetching the services and users separately (remove this when API supports it)
    const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
      try {
        if (!booking.serviceName) {
          // Get service details if serviceName is not provided
          const service = await apiGetServiceById(booking.serviceId);
          booking.serviceName = service.title;
          booking.price = service.price;
        }
        
        // Fetch the buyer's username if not provided
        if (!booking.buyerUsername && booking.userId) {
          try {
            // Fetch user details to get the username
            const userResponse = await apiClient.get(`/v1/User/${booking.userId}`);
            const userData = handleResponse<any>(userResponse);
            booking.buyerUsername = userData.username || `User ${booking.userId}`;
          } catch (userErr) {
            console.error(`Error fetching user details for booking ${booking.id}:`, userErr);
            booking.buyerUsername = `User ${booking.userId}`;  // Fallback
          }
        }
      } catch (err) {
        console.error(`Error fetching details for booking ${booking.id}:`, err);
      }
      return booking;
    }));
    
    return enhancedBookings;
  } catch (error) {
    console.error('Error fetching seller bookings:', error);
    throw error;
  }
};

export const apiUpdateBookingDate = async (id: number | string, newDate: string) => {
  try {
    // The backend expects a DateTime object in JSON format
    // We need to wrap the date string in quotes to make it JSON compatible
    const response = await apiClient.put(`/v1/Booking/${id}/date`, JSON.stringify(newDate), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error updating booking date:', error);
    throw error;
  }
};

export const apiCancelBooking = async (id: number | string) => {
  try {
    const response = await apiClient.patch(`/v1/Booking/${id}/cancel`);
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

// Payment API functions
export const apiProcessPayment = async (bookingId: number | string, paymentData: PaymentCreateDto) => {
  try {
    console.log('Payment data being sent:', JSON.stringify(paymentData));
    const response = await apiClient.post(`/v1/Payment/booking/${bookingId}`, paymentData);
    return handleResponse<PaymentResponseDto>(response);
  } catch (error: any) {
    console.error('Error processing payment:', error);
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// Review API functions
export const apiCreateReview = async (reviewData: ReviewCreateDto) => {
  try {
    // Log the exact data being sent to help diagnose issues
    console.log('Sending review data:', JSON.stringify(reviewData));
    
    const response = await apiClient.post(`/v1/Review`, reviewData);
    return handleResponse<ReviewDto>(response);
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error creating review:', error);
    
    if (error.response) {
      console.error('Server response status:', error.response.status);
      console.error('Server response headers:', error.response.headers);
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
      
      // Return null with a more specific message if we have error details
      if (error.response.data) {
        throw new Error(
          typeof error.response.data === 'string' 
            ? error.response.data 
            : error.response.data.message || 'Server validation failed. Please check your inputs.'
        );
      }
    }
    
    // Re-throw for component handling
    throw error;
  }
};

// Function to get a review by booking ID
export const apiGetReviewByBookingId = async (bookingId: number | string) => {
  try {
    // First get all user reviews
    const userReviews = await apiGetUserReviews();
    
    // Find the review that matches the booking ID
    const matchingReview = userReviews.find(review => review.bookingId === Number(bookingId));
    
    console.log(`Checking for review for booking ${bookingId}:`, matchingReview || 'No review found');
    
    // Return the matching review or null if none found
    return matchingReview || null;
  } catch (error) {
    console.error(`Error fetching review for booking ${bookingId}:`, error);
    return null;
  }
};

export const apiUpdateReview = async (reviewId: number, reviewData: ReviewUpdateDto) => {
  try {
    const response = await apiClient.put(`/v1/Review/${reviewId}`, reviewData);
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const apiDeleteReview = async (reviewId: number) => {
  try {
    const response = await apiClient.delete(`/v1/Review/${reviewId}`);
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const apiGetServiceReviews = async (serviceId: number) => {
  try {
    const response = await apiClient.get(`/v1/Review/service/${serviceId}`);
    const reviews = handleResponse<ReviewDto[]>(response);
    console.log(`Fetched ${reviews.length} reviews for service ${serviceId}:`, reviews);
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for service ${serviceId}:`, error);
    // Return empty array instead of throwing to prevent cascading errors
    return [];
  }
};

// Function to get all reviews by the current user
export const apiGetUserReviews = async () => {
  try {
    const response = await apiClient.get('/v1/Review/user');
    const reviews = handleResponse<ReviewDto[]>(response);
    console.log(`Fetched ${reviews.length} reviews for current user:`, reviews);
    return reviews;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
};

// Function to get all public services - used by regular users
export const apiGetAllServices = async () => {
  try {
    const response = await apiClient.get('/v1/Service');
    const services = handleResponse<ServiceDto[]>(response);
    console.log(`Fetched ${services.length} public services`);
    return services;
  } catch (error) {
    console.error('Error fetching all services:', error);
    return [];
  }
};

// Notification API functions
export const apiGetNotifications = async () => {
  try {
    const response = await apiClient.get('/v1/Notification');
    return handleResponse<Notification[]>(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Function to reactivate account using token
export const apiReactivateAccountByToken = async (email: string, token: string) => {
  try {
    console.log('Attempting to reactivate account with email:', email, 'and token:', token);
    
    // Make sure email and token are properly formatted
    if (!email || !token) {
      throw new Error('Email and token are required for account reactivation');
    }
    
    // Ensure we're using the correct API endpoint
    const response = await apiClient.post('/v1/User/reactivate-by-token', { 
      email: email.trim(), 
      token: token.trim() 
    });
    
    const result = handleResponse<{ message: string }>(response);
    console.log('Reactivation successful:', result);
    return result;
  } catch (error: any) {
    console.error('Error reactivating account by token:', error);
    
    // Enhanced error message extraction
    const errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        error.message || 
                        'Failed to reactivate account. Please try again.';
                        
    throw new Error(errorMessage);
  }
};

export const apiMarkNotificationAsRead = async (notificationId: number) => {
  try {
    const response = await apiClient.patch(`/v1/Notification/${notificationId}/read`);
    return handleResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Add a SellerStats interface
export interface SellerStats {
  totalServices: number;
  totalBookings: number;
  totalEarnings: number;
  completedBookings: number;
}

export const fetchSellerStats = async (): Promise<SellerStats> => {
  try {
    // Try to get stats from API
    const response = await apiClient.get('/v1/Seller/stats');
    const data = handleResponse<any>(response);
    
    // If the API doesn't provide enough information, we can calculate it ourselves
    if (data.completedBookings === 0) {
      try {
        // Get all bookings and count those with status 'Completed' or those that are paid
        const bookings = await apiGetSellerBookings();
        const completedCount = bookings.filter(b => 
          b.status === 'Completed' || 
          b.paymentStatus === 'Paid' || 
          b.status === 'Paid'
        ).length;
        
        // Update the completed bookings count
        data.completedBookings = completedCount;
      } catch (err) {
        console.error('Error calculating completed bookings:', err);
      }
    }
    
    // Map backend's response to our frontend interface
    return {
      totalServices: data.totalServices,
      totalBookings: data.totalBookings,
      totalEarnings: data.totalEarnings,
      completedBookings: data.completedBookings
    };
  } catch (error) {
    console.error('Failed to fetch seller stats:', error);
    throw error;
  }
};

export default apiClient; 
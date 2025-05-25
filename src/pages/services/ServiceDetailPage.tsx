import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGetServiceById, apiCreateBooking, apiGetServiceReviews } from '../../services/api';
import type { ServiceDto, BookingCreateDto, ReviewDto } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary-200 border-t-primary-600`} />
    </div>
  );
};

// Date Picker Modal Component
const DatePickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  isBooking: boolean;
  error: string | null;
}> = ({ isOpen, onClose, onConfirm, selectedDate, setSelectedDate, isBooking, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Select Booking Date
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Please select a date for your booking:
                  </p>
                  <div className="flex justify-center">
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      minDate={new Date()}
                      className="form-input block w-full sm:text-sm border-gray-300 rounded-md"
                      dateFormat="MMMM d, yyyy"
                      inline
                    />
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
              disabled={isBooking || !selectedDate}
            >
              {isBooking ? (
                <div className="flex items-center">
                  <Spinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isBooking}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Review Item Component
const ReviewItem: React.FC<{ review: ReviewDto }> = ({ review }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">
              {review.username ? review.username.substring(0, 2).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center mb-1">
            <p className="text-sm font-medium text-gray-900">{review.username || `User ${review.userId}`}</p>
            <span className="mx-2 text-gray-300">•</span>
            <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Add a query to fetch individual reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<ReviewDto[], Error>({
    queryKey: ['serviceReviews', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Service ID is missing');
      }
      return await apiGetServiceReviews(parseInt(id));
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Fetch service details from API
  const { data: service, isLoading, error } = useQuery<ServiceDto, Error>({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Service ID is missing');
      }
      return await apiGetServiceById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 1, // Only retry once if the request fails
  });

  const handleBookService = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!id) return;
    
    // Show date picker modal instead of immediately booking
    setBookingError(null);
    setShowDateModal(true);
  };
  
  const confirmBooking = async () => {
    if (!id || !selectedDate) return;
    
    try {
      setIsBooking(true);
      setBookingError(null);
      
      // Create a booking with the selected date
      const bookingData: BookingCreateDto = {
        serviceId: parseInt(id),
        bookingDate: selectedDate.toISOString(),
      };

      await apiCreateBooking(bookingData);
      setShowDateModal(false);
      navigate('/bookings');
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to book service');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading service</h3>
          <p className="mt-1 text-gray-500">
            {error instanceof Error ? error.message : 'Service not found or no longer available.'}
          </p>
          <div className="mt-6">
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse other services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/services" className="ml-2 text-gray-500 hover:text-gray-700">Services</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-gray-900 font-medium">{service.title}</span>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left column - Service details */}
          <div className="lg:col-span-8">
            {/* Service title and category */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {service.category}
                </span>
                <div className="ml-4 flex items-center">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-gray-600">
                    {reviews && reviews.length > 0 
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
                      : '0'} 
                    ({reviews ? reviews.length : 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={service.images && service.images.length > 0 
                    ? service.images[selectedImage].imageUrl 
                    : 'https://via.placeholder.com/800x600?text=No+Image'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {service.images && service.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {service.images.map((image, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-md overflow-hidden h-20 ${
                        selectedImage === index ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${service.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Service</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{service.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              {(reviews && reviews.length > 0) ? (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    {reviews && reviews.length > 0 && (
                      <>
                        <p className="text-lg font-semibold">
                          {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} / 5
                        </p>
                        <p className="text-gray-500">Based on {reviews.length} reviews</p>
                        <div className="flex justify-center mt-2">
                          {[...Array(5)].map((_, i) => {
                            // Calculate average rating from actual reviews
                            const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
                            return (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${
                                  i < avgRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Individual Reviews List */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
                    
                    {isLoadingReviews ? (
                      <div className="text-center py-4">
                        <Spinner size="sm" />
                        <p className="mt-2 text-sm text-gray-500">Loading reviews...</p>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-4 divide-y divide-gray-200">
                        {reviews.map(review => (
                          <ReviewItem key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Couldn't load individual reviews at this time.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No reviews yet for this service.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Service booking */}
          <div className="mt-8 lg:mt-0 lg:col-span-4">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900">${service.price}</h2>
                  <p className="mt-4 text-gray-600">
                    Seller: <span className="font-medium text-gray-900">{service.sellerUsername}</span>
                  </p>
                  
                  <div className="mt-6">
                    <button
                      onClick={handleBookService}
                      disabled={isBooking}
                      className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                    >
                      {isBooking ? (
                        <div className="flex justify-center items-center">
                          <Spinner size="sm" />
                          <span className="ml-2">Processing...</span>
                        </div>
                      ) : (
                        'Book Now'
                      )}
                    </button>
                    
                    {bookingError && (
                      <div className="mt-3 text-sm text-red-600">
                        {bookingError}
                      </div>
                    )}
                    
                    {showLoginPrompt && !user && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          You need to log in to book this service
                        </p>
                        <Link
                          to="/login"
                          className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                          Log in
                        </Link>
                        <span className="text-gray-500 mx-2">or</span>
                        <Link
                          to="/register"
                          className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-900">About the seller</h3>
                  <div className="mt-4 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-bold text-gray-900">{service.sellerUsername}</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Member since {new Date(service.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={confirmBooking}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isBooking={isBooking}
        error={bookingError}
      />
    </div>
  );
};

export default ServiceDetailPage;

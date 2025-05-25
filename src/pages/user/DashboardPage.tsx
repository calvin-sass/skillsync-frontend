import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { apiGetUserBookings, apiGetServiceById, apiCancelBooking, apiCreateReview, apiUpdateReview, apiGetNotifications, apiMarkNotificationAsRead, apiGetUserReviews } from '../../services/api';
import type { BookingDto, ServiceDto, ReviewDto, ReviewCreateDto, ReviewUpdateDto, Notification } from '../../types';

// Delete Confirmation Modal Component
type DeleteConfirmationModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Cancel Booking</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
        </div>
        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Review Form Component
type ReviewFormProps = {
  booking: BookingDto;
  serviceTitle: string;
  existingReview?: ReviewDto;
  onSubmit: (reviewData: ReviewCreateDto | ReviewUpdateDto) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const ReviewForm: React.FC<ReviewFormProps> = ({ booking, serviceTitle, existingReview, onSubmit, onCancel, isSubmitting }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData = existingReview 
      ? { rating, comment } as ReviewUpdateDto
      : { rating, comment, serviceId: booking.serviceId, bookingId: booking.id } as ReviewCreateDto;
    onSubmit(reviewData);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{existingReview ? 'Edit Review' : 'Write a Review'}</h3>
        <p className="text-sm text-gray-600 mb-4">For: <span className="font-medium">{serviceTitle}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg 
                    className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<number, ServiceDto>>({});
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<BookingDto | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewDto | undefined>(undefined);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiGetUserBookings();
        setBookings(data);
        
        // Fetch service details for each booking to get the service names
        const serviceIds = data.map(booking => booking.serviceId);
        const uniqueServiceIds = [...new Set(serviceIds)];
        
        const serviceDetailsMap: Record<number, ServiceDto> = {};
        for (const serviceId of uniqueServiceIds) {
          try {
            const serviceData = await apiGetServiceById(serviceId);
            serviceDetailsMap[serviceId] = serviceData;
          } catch (error) {
            console.error(`Error fetching service ${serviceId}:`, error);
          }
        }
        setServiceDetails(serviceDetailsMap);
        
        // Fetch reviews for the user
        fetchUserReviews();
        
        // Fetch notifications
        fetchNotifications();
      } catch (err) {
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUserReviews = async () => {
      try {
        // Directly fetch user reviews from the dedicated endpoint
        const userReviews = await apiGetUserReviews();
        console.log(`Fetched ${userReviews.length} reviews for current user:`, userReviews);
        setReviews(userReviews);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      }
    };
    
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const notificationData = await apiGetNotifications();
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Status badge style
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle booking cancellation
  const handleCancelBooking = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
  };
  
  const confirmCancelBooking = async () => {
    if (selectedBookingId) {
      setIsCancelling(true);
      try {
        await apiCancelBooking(selectedBookingId);
        // Update bookings list to reflect cancellation
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === selectedBookingId ? { ...booking, status: 'Cancelled' } : booking
          )
        );
      } catch (error) {
        console.error('Error cancelling booking:', error);
        setError('Failed to cancel booking. Please try again.');
      } finally {
        setIsCancelling(false);
        setShowCancelModal(false);
      }
    }
  };
  
  // Handle reviews
  const handleReviewService = (booking: BookingDto) => {
    // Find if user already has a review for this booking
    const existingReview = reviews.find(review => review.bookingId === booking.id);
    setSelectedReviewBooking(booking);
    setCurrentReview(existingReview);
    setShowReviewForm(true);
  };
  
  const handleSubmitReview = async (reviewData: ReviewCreateDto | ReviewUpdateDto) => {
    setIsSubmittingReview(true);
    try {
      if ('serviceId' in reviewData) {
        // Creating new review
        const newReview = await apiCreateReview(reviewData as ReviewCreateDto);
        setReviews(prev => [...prev, newReview]);
      } else {
        // Updating existing review
        if (currentReview) {
          await apiUpdateReview(currentReview.id, reviewData as ReviewUpdateDto);
          setReviews(prev => 
            prev.map(review => 
              review.id === currentReview.id ? { ...review, ...reviewData } : review
            )
          );
        }
      }
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle marking a notification as read
  const handleMarkNotificationAsRead = async (notificationId: number) => {
    try {
      await apiMarkNotificationAsRead(notificationId);
      // Update notifications after marking as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Sort bookings by bookingDate (desc)
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.bookingDate && b.bookingDate) {
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    }
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Welcome, {user?.username}</h1>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Dashboard Overview Cards - Removed sales data for non-sellers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-2">Total Bookings</h2>
            <p className="text-3xl font-bold">
              {isLoading ? <span className="text-gray-400">...</span> : bookings.length}
            </p>
          </div>
        </div>
        
        {/* Dashboard Title */}
        <div className="mb-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-medium">Dashboard Overview</h2>
          </div>
        </div>
        
        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">My Bookings</h2>
          </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-center">Loading your bookings...</div>
              ) : sortedBookings.length === 0 ? (
                <div className="p-4 text-center">You don't have any bookings yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {serviceDetails[booking.serviceId]?.title || `Service #${booking.serviceId}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {booking.bookingDate
                              ? new Date(booking.bookingDate).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {booking.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-900 mr-4"
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === 'Completed' && !reviews.some(r => r.bookingId === booking.id) && (
                            <button
                              onClick={() => handleReviewService(booking)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Leave Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">My Reviews</h2>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-center">Loading your reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="p-4 text-center">You haven't written any reviews yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rating
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Review
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {serviceDetails[review.serviceId]?.title || `Service #${review.serviceId}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.comment}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              const booking = bookings.find(b => b.id === review.bookingId);
                              if (booking) {
                                setSelectedReviewBooking(booking);
                                setCurrentReview(review);
                                setShowReviewForm(true);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        
        {/* Recent Notifications */}
        <div className="mt-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Recent Notifications</h2>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="p-3 border rounded-md border-gray-200 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg className={`h-5 w-5 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                        {!notification.isRead && (
                          <button 
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                            className="mt-2 text-xs text-blue-500 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications at this time</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showCancelModal && (
        <DeleteConfirmationModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={confirmCancelBooking}
          isDeleting={isCancelling}
        />
      )}
      
      {/* Review Form Modal */}
      {showReviewForm && selectedReviewBooking && (
        <ReviewForm
          booking={selectedReviewBooking}
          serviceTitle={serviceDetails[selectedReviewBooking.serviceId]?.title || `Service #${selectedReviewBooking.serviceId}`}
          existingReview={currentReview}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
          isSubmitting={isSubmittingReview}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage; 
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGetServiceReviews, apiDeleteReview, apiGetUserBookings, apiGetServiceById } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { ReviewDto, BookingDto } from '../../types';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
  serviceId: number;
  showReviewForm?: boolean; // Optional prop to control whether to show the review form
}

const ReviewList: React.FC<ReviewListProps> = ({ serviceId, showReviewForm = true }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Fetch reviews for the service
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['serviceReviews', serviceId],
    queryFn: () => apiGetServiceReviews(Number(serviceId)),
  });

  // For users only: fetch their bookings for this service to check payment status
  const { data: userBookings = [] } = useQuery({
    queryKey: ['userBookings', user?.id],
    queryFn: () => apiGetUserBookings(),
    enabled: !!user && user.role !== 'seller' && showReviewForm,
  });

  // For sellers: check if this is their service
  const { data: serviceDetails } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => apiGetServiceById(serviceId),
    enabled: !!user && user.role === 'seller',
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => apiDeleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] });
    },
  });

  // Find completed bookings for this service that user has made
  const eligibleBookings = userBookings.filter(
    booking => Number(booking.serviceId) === Number(serviceId) && 
    (booking.status === 'Completed' || booking.status === 'Paid')
  );

  // Check if user has already reviewed this service
  const hasUserReviewed = reviews.some(review => review.userId === (user?.id ? Number(user.id) : null));
  
  const handleEditReview = (review: ReviewDto) => {
    setEditingReview(review);
    setShowAddReview(false);
  };

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(reviewId);
    }
  };

  const handleReviewUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] });
    setEditingReview(null);
  };

  const handleAddReviewClick = (bookingId: number) => {
    setShowAddReview(true);
    setSelectedBookingId(bookingId);
    setEditingReview(null);
  };

  // Check if user is a seller (case insensitive)
  const isSeller = user?.role?.toLowerCase() === 'seller';
  
  // Check if service belongs to the seller
  const isSellerOwnService = isSeller && user?.id && serviceDetails?.sellerId === Number(user.id);

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        Error loading reviews. Please try again.
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + Number(review.rating), 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Review Form - only for users with completed bookings */}
      {showReviewForm && user && !isSeller && !isSellerOwnService && (
        <div>
          {editingReview && (
            <ReviewForm
              serviceId={Number(serviceId)}
              bookingId={editingReview.bookingId}
              review={editingReview}
              onSuccess={handleReviewUpdate}
              onCancel={() => setEditingReview(null)}
            />
          )}
          
          {!editingReview && !hasUserReviewed && !showAddReview && eligibleBookings.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => handleAddReviewClick(eligibleBookings[0].id)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Leave a Review
              </button>
            </div>
          )}
          
          {showAddReview && selectedBookingId && !editingReview && (
            <ReviewForm
              serviceId={Number(serviceId)}
              bookingId={selectedBookingId}
              onSuccess={() => {
                setShowAddReview(false);
                queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] });
              }}
              onCancel={() => setShowAddReview(false)}
            />
          )}
          
          {!editingReview && !showAddReview && eligibleBookings.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-md text-yellow-700">
              You need to book and complete this service before you can leave a review.
            </div>
          )}
          
          {!editingReview && !showAddReview && hasUserReviewed && (
            <div className="mb-6 p-4 bg-green-50 rounded-md text-green-700">
              You have already reviewed this service.
            </div>
          )}
        </div>
      )}
      
      {/* Reviews Summary */}
      <div className="text-center py-4 border-b border-gray-200">
        <p className="text-lg font-semibold">{averageRating.toFixed(1)} / 5</p>
        <p className="text-gray-500">Based on {reviews.length} reviews</p>
        <div className="flex justify-center mt-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-5 w-5 ${
                i < averageRating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                      {review.userAvatarUrl ? (
                        <img
                          src={review.userAvatarUrl}
                          alt={review.username || `User ${review.userId}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{review.username || `User ${review.userId}`}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Number(review.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="ml-2 text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Edit/Delete buttons for own reviews */}
                {user && Number(user.id) === review.userId && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {review.comment && (
                <div className="mt-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No reviews yet for this service.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 
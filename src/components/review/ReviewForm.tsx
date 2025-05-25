import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiCreateReview, apiUpdateReview, apiGetUserBookings } from '../../services/api';
import type { ReviewCreateDto, ReviewUpdateDto, ReviewDto } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewFormProps {
  serviceId: number;
  bookingId: number;
  review?: ReviewDto; // for editing an existing review
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  serviceId, 
  bookingId, 
  review, 
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth();
  const isEditing = Boolean(review);
  
  const [formData, setFormData] = useState<ReviewCreateDto | ReviewUpdateDto>(() => {
    if (isEditing && review) {
      return {
        rating: Number(review.rating),
        comment: review.comment || '',
      };
    }
    return {
      serviceId,
      bookingId,
      rating: 5,
      comment: '',
    };
  });
  
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized to create/edit reviews
  if (!user || user.role === 'Seller') {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700">
        Only clients can leave reviews for services.
      </div>
    );
  }

  // For new reviews, verify booking payment status
  const { data: userBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      try {
        return await apiGetUserBookings();
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        return [];
      }
    },
    enabled: !isEditing && !!user,
  });

  // Find the relevant booking
  const currentBooking = userBookings?.find(b => b.id === bookingId);

  // Check if payment is completed for this booking
  const isPaid = currentBooking?.status === 'Completed' || currentBooking?.status === 'Paid';
  
  if (!isEditing && !isLoadingBookings && (!currentBooking || !isPaid)) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700">
        You can only leave a review after the service is completed and payment is processed.
      </div>
    );
  }

  const createMutation = useMutation({
    mutationFn: (data: ReviewCreateDto) => apiCreateReview(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to submit review.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewUpdateDto }) => 
      apiUpdateReview(id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update review.');
    },
  });

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && review) {
      // For updating existing reviews
      const updateData: ReviewUpdateDto = {
        rating: formData.rating,
        comment: formData.comment
      };
      
      updateMutation.mutate({
        id: review.id,
        data: updateData
      });
    } else {
      // For creating new reviews
      // We need to cast to access the properties safely
      const createData = formData as ReviewCreateDto;
      
      // Log the data being sent for debugging
      console.log('Submitting review with data:', JSON.stringify({
        serviceId: createData.serviceId,
        bookingId: createData.bookingId,
        rating: createData.rating,
        comment: createData.comment
      }));
      
      createMutation.mutate(createData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isLoadingBookings;

  if (isPending && isLoadingBookings) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Verifying booking status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Update your review' : 'Leave a review'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Rating Stars */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`h-8 w-8 ${
                    star <= (formData.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Review Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleCommentChange}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Share your experience with this service..."
          ></textarea>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-75"
          >
            {isPending ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 
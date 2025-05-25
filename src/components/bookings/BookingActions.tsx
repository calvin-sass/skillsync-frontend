import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiCancelBooking, apiUpdateBookingDate, apiGetReviewByBookingId } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from '../payments/PaymentModal';
import ReviewModal from '../review/ReviewModal';
import type { ReviewDto } from '../../types';

// DatePicker Modal Component
interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  currentDate?: string;
  isProcessing: boolean;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onConfirm, currentDate, isProcessing }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    try {
      // Validate date
      const dateObj = new Date(selectedDate);
      if (isNaN(dateObj.getTime())) {
        setError('Please enter a valid date');
        return;
      }
      
      // Check if date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        setError('Please select a future date');
        return;
      }
      
      onConfirm(dateObj.toISOString());
    } catch (err) {
      setError('Please enter a valid date');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Update Booking Date</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please select a new date for this booking.
          </p>
        </div>
        
        <div className="mt-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">New Date</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setError('');
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            min={new Date().toISOString().split('T')[0]}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Update Date'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Cancel Booking Modal Component
interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen) return null;
  
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
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
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

interface BookingActionsProps {
  bookingId: number | string;
  bookingStatus: string;
  bookingPrice?: number;
  serviceId: number | string;
  onComplete?: () => void;
}

/**
 * BookingActions component provides action buttons for a booking
 * based on user role and booking status
 */
export const BookingActions: React.FC<BookingActionsProps> = ({ 
  bookingId,
  bookingStatus, 
  bookingPrice = 0,
  serviceId,
  onComplete
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSeller = user?.role === 'Seller';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  
  // Normalize status for comparison
  const status = bookingStatus.toLowerCase();
  
  // Fetch existing review for this booking
  const { data: existingReview, isLoading: isLoadingReview } = useQuery<ReviewDto | null>({
    queryKey: ['review', bookingId],
    queryFn: () => apiGetReviewByBookingId(bookingId),
    enabled: !isSeller && (status === 'completed' || status === 'paid')
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: () => apiCancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerBookings'] });
      if (onComplete) onComplete();
    }
  });
  
  // Update booking date mutation (seller only)
  const updateBookingDateMutation = useMutation({
    mutationFn: (newDate: string) => 
      apiUpdateBookingDate(bookingId, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerBookings'] });
      if (onComplete) onComplete();
    }
  });

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };
  
  const confirmCancellation = () => {
    cancelBookingMutation.mutate();
    setShowCancelModal(false);
  };
  
  const handleUpdateDate = () => {
    // Open the date picker modal instead of using prompt
    setShowDatePickerModal(true);
  };
  
  const handleDateConfirm = (isoString: string) => {
    console.log('Updating booking date to:', isoString);
    updateBookingDateMutation.mutate(isoString);
    setShowDatePickerModal(false);
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    if (onComplete) onComplete();
  };

  const handleLeaveReview = () => {
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    // Close the modal first
    setShowReviewForm(false);

    // Invalidate both the bookings data and the review data to refresh them
    queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    queryClient.invalidateQueries({ queryKey: ['review', bookingId] });
    
    // Notify parent component
    if (onComplete) onComplete();
  };

  // If the booking is pending, show different actions based on role
  if (status === 'pending') {
    if (isSeller) {
      // Seller actions: Update date and Cancel
      return (
        <>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateDate}
              disabled={updateBookingDateMutation.isPending}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {updateBookingDateMutation.isPending ? 'Updating...' : 'Update Date'}
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {cancelBookingMutation.isPending ? 'Cancelling...' : 'Decline'}
            </button>
          </div>
          
          {showPaymentModal && (
            <PaymentModal
              isOpen={showPaymentModal}
              bookingId={bookingId}
              amount={bookingPrice}
              onClose={() => setShowPaymentModal(false)}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
          
          {/* Date Picker Modal */}
          <DatePickerModal
            isOpen={showDatePickerModal}
            onClose={() => setShowDatePickerModal(false)}
            onConfirm={handleDateConfirm}
            isProcessing={updateBookingDateMutation.isPending}
          />
          
          {/* Cancel Booking Modal */}
          <CancelBookingModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancellation}
            isProcessing={cancelBookingMutation.isPending}
          />
        </>
      );
    } else {
      // User/Client actions: Pay Now and Cancel
      return (
        <>
          <div className="flex space-x-2">
            <button
              onClick={handlePayment}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Pay Now
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </div>
          
          {showPaymentModal && (
            <PaymentModal
              isOpen={showPaymentModal}
              bookingId={bookingId}
              amount={bookingPrice}
              onClose={() => setShowPaymentModal(false)}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
          
          {/* Cancel Booking Modal */}
          <CancelBookingModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancellation}
            isProcessing={cancelBookingMutation.isPending}
          />
        </>
      );
    }
  }
  
  // For paid/completed bookings, allow reviews for users (not sellers)
  if ((status === 'completed' || status === 'paid') && !isSeller) {
    // Show loading state when checking for existing review
    if (isLoadingReview) {
      return <div className="text-sm text-gray-500">Loading...</div>;
    }
    
    // Button text depends on whether a review already exists
    const buttonText = existingReview ? 'Edit Review' : 'Leave Review';
    
    return (
      <>
        <button
          onClick={handleLeaveReview}
          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {buttonText}
        </button>
        
        {/* Review Modal */}
        {showReviewForm && (
          <ReviewModal
            isOpen={showReviewForm}
            serviceId={serviceId}
            bookingId={bookingId}
            review={existingReview || undefined}
            onClose={() => setShowReviewForm(false)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </>
    );
  }
  
  // For other statuses, no actions are available
  return null;
};

export default BookingActions; 
import React from 'react';
import ReviewForm from './ReviewForm';
import type { ReviewDto } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  serviceId: number | string;
  bookingId: number | string;
  review?: ReviewDto; // for editing an existing review
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  serviceId,
  bookingId,
  review,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {review ? 'Edit Your Review' : 'Leave a Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div>
          <ReviewForm
            serviceId={Number(serviceId)}
            bookingId={Number(bookingId)}
            review={review}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

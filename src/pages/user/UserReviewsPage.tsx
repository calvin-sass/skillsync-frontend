import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetAllServices, apiGetServiceById, apiGetUserReviews, apiUpdateReview } from '../../services/api';
import type { ServiceDto, ReviewDto, ReviewUpdateDto } from '../../types';
import DashboardLayout from '../../components/layouts/DashboardLayout';

// Review Form Component
type ReviewFormProps = {
  review: ReviewDto;
  serviceTitle: string;
  onSubmit: (reviewData: ReviewUpdateDto, reviewId: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const ReviewForm: React.FC<ReviewFormProps> = ({ review, serviceTitle, onSubmit, onCancel, isSubmitting }) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData = { rating, comment } as ReviewUpdateDto;
    onSubmit(reviewData, review.id);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Review</h3>
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<number, ServiceDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentReview, setCurrentReview] = useState<ReviewDto | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      
      try {
        // Directly fetch the user's reviews using the new API endpoint
        const userReviews = await apiGetUserReviews();
        console.log(`Fetched ${userReviews.length} reviews for current user:`, userReviews);
        setReviews(userReviews);
        
        // Get all services to display service details
        const allServices = await apiGetAllServices();
        console.log('Fetched services for context:', allServices.length);
        
        // Create a service details lookup for each review's service
        const services: Record<number, ServiceDto> = {};
        
        // First try to populate from all services
        allServices.forEach(service => {
          services[service.id] = service;
        });
        
        // For any missing services, fetch them individually
        const missingServiceIds = userReviews
          .map(review => review.serviceId)
          .filter(serviceId => !services[serviceId]);
        
        // Remove duplicates
        const uniqueMissingServiceIds = [...new Set(missingServiceIds)];
        
        for (const serviceId of uniqueMissingServiceIds) {
          try {
            const serviceData = await apiGetServiceById(serviceId);
            services[serviceId] = serviceData;
          } catch (error) {
            console.error(`Error fetching service ${serviceId}:`, error);
          }
        }
        
        setServiceDetails(services);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load your review data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Handle review update
  const handleUpdateReview = async (reviewData: ReviewUpdateDto, reviewId: number) => {
    setIsSubmitting(true);
    try {
      await apiUpdateReview(reviewId, reviewData);
      
      // Update reviews in state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId ? { ...review, ...reviewData } : review
        )
      );
      
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">My Reviews</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage all the reviews you've left for services you've booked.
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-6 text-center">
              <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't left any reviews yet.</p>
              <div className="mt-6">
                <Link to="/bookings" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  View your bookings
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          {renderStars(review.rating)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{review.comment || "No comment provided"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentReview(review);
                            setShowReviewForm(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Review Form Modal */}
      {showReviewForm && currentReview && (
        <ReviewForm
          review={currentReview}
          serviceTitle={serviceDetails[currentReview.serviceId]?.title || `Service #${currentReview.serviceId}`}
          onSubmit={handleUpdateReview}
          onCancel={() => setShowReviewForm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

export default UserReviewsPage;

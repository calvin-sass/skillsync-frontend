import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGetSellerServices, apiGetServiceReviews } from '../../services/api';
import type { ServiceDto, ReviewDto } from '../../types';

type ServiceWithReviews = {
  service: ServiceDto;
  reviews: ReviewDto[];
};

const SellerReviewsPage: React.FC = () => {
  const [servicesWithReviews, setServicesWithReviews] = useState<ServiceWithReviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServicesWithReviews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, get all services for the seller
        const services = await apiGetSellerServices();
        
        // Then, for each service, get its reviews
        const servicesWithReviewsData = await Promise.all(
          services.map(async (service) => {
            try {
              const reviewsData = await apiGetServiceReviews(service.id);
              return {
                service,
                reviews: reviewsData,
              };
            } catch (err) {
              console.error(`Error fetching reviews for service ${service.id}:`, err);
              return {
                service,
                reviews: [],
              };
            }
          })
        );
        
        setServicesWithReviews(servicesWithReviewsData);
      } catch (err) {
        console.error('Error loading services with reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServicesWithReviews();
  }, []);
  
  // Calculate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Service Reviews</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md mb-4">
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
        ) : servicesWithReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any active services yet.</p>
            <div className="mt-6">
              <Link 
                to="/seller/services/add" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add a Service
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {servicesWithReviews.map(({ service, reviews }) => (
              <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {service.title}
                    </h3>
                    <Link 
                      to={`/seller/services/${service.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Service
                    </Link>
                  </div>
                  <div className="mt-1 flex items-center">
                    <div className="flex items-center">
                      {renderStars(reviews.length > 0 ? 
                        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 
                        service.averageRating || 0)}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {reviews.length > 0 ? 
                        (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 
                        service.averageRating ? service.averageRating.toFixed(1) : 'No ratings'} 
                      ({reviews.length || service.reviewCount || 0} {(reviews.length || service.reviewCount || 0) === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    This service has no reviews yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <li key={review.id} className="p-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {review.userAvatarUrl ? (
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={review.userAvatarUrl} 
                                  alt={review.username || 'User'} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-sm font-medium text-gray-900">
                                {review.username || `User ${review.userId}`}
                              </h4>
                              <div className="mt-1 flex items-center">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        {review.comment && (
                          <div className="mt-2 text-sm text-gray-700">
                            {review.comment}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SellerReviewsPage;

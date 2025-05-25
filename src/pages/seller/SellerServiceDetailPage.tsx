import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiGetServiceById, apiDeleteService, apiGetSellerBookings, apiGetServiceReviews } from '../../services/api';
import type { ServiceDto } from '../../types/index';

// This represents analytics data retrieved from the API
type ServiceAnalytics = {
  orders: number;
  cancellations: number;
  rating: number;
  reviewCount: number;
}

// Delete Confirmation Modal Component
interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Service</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-3 px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SellerServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [service, setService] = useState<ServiceDto | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState<ServiceAnalytics>({
    orders: 0,
    cancellations: 0,
    rating: 0,
    reviewCount: 0
  });

  // Fetch service data and related analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        // Fetch the service details
        const serviceData = await apiGetServiceById(id || '');
        setService(serviceData);
        
        // Fetch all seller bookings
        const bookingsData = await apiGetSellerBookings();
        
        // Filter bookings for this specific service
        const serviceBookings = bookingsData.filter(booking => booking.serviceId === serviceData.id);
        
        // Count total orders and cancellations
        const totalOrders = serviceBookings.length;
        const cancelledOrders = serviceBookings.filter(booking => booking.status === 'Cancelled').length;
        
        // Fetch reviews for this service
        const reviewsData = await apiGetServiceReviews(serviceData.id);
        
        // Calculate average rating if there are reviews
        const avgRating = reviewsData.length > 0
          ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
          : serviceData.averageRating || 0;
        
        // Update analytics with real data
        setAnalytics({
          orders: totalOrders,
          cancellations: cancelledOrders,
          rating: avgRating,
          reviewCount: reviewsData.length
        });
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to load service data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    // Added refresh parameter to dependency array to trigger refetch when navigating from edit page
  }, [id, searchParams.get('refresh')]);

  // Handle image navigation
  const nextImage = () => {
    if (service && service.images.length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === service.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (service && service.images.length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === 0 ? service.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Delete service handlers
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await apiDeleteService(id || '');
      navigate('/seller/services');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete service');
      setDeleteLoading(false);
    } finally {
      closeDeleteModal();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Service not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Created on {new Date(service.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-3">
          <Link
            to={`/seller/services/add?edit=${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Service
          </Link>
          <button
            onClick={openDeleteModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Service Details</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {/* Image Slider */}
              <div className="mb-6 relative">
                {service.images && service.images.length > 0 ? (
                  <>
                    <img 
                      src={service.images[activeImageIndex]?.imageUrl} 
                      alt={`${service.title} - Image ${activeImageIndex + 1}`} 
                      className="h-64 w-full object-cover rounded-lg"
                    />
                    
                    {service.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between">
                        <button 
                          onClick={prevImage} 
                          className="bg-black bg-opacity-50 text-white p-2 rounded-full mx-2 hover:bg-opacity-70 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={nextImage} 
                          className="bg-black bg-opacity-50 text-white p-2 rounded-full mx-2 hover:bg-opacity-70 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {service.images.length > 1 && (
                      <div className="flex justify-center mt-2 space-x-2">
                        {service.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`h-2 w-2 rounded-full ${
                              index === activeImageIndex ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-2 text-sm text-gray-900 whitespace-pre-line">{service.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-2 text-sm text-gray-900">{service.category}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Price</h4>
                  <p className="mt-2 text-xl font-bold text-primary-600">${service.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Orders</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{analytics.orders}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cancellations</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{analytics.cancellations}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rating</dt>
                  <dd className="mt-1 flex items-center">
                    <span className="text-3xl font-semibold text-gray-900 mr-2">{analytics.rating.toFixed(1)}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 ${i < Math.round(analytics.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">({analytics.reviewCount} reviews)</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isDeleting={deleteLoading}
        />
      )}
    </div>
  );
};

export default SellerServiceDetailPage;
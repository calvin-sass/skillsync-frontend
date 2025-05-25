import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGetSellerServices, apiDeleteService, apiGetServiceReviews } from '../../services/api';
import type { ServiceDto } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';

// Delete Confirmation Modal Component
interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  serviceName: string;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ onClose, onConfirm, isDeleting, serviceName }) => {
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
              Are you sure you want to delete "{serviceName}"? This action cannot be undone.
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

const SellerServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [servicesWithReviews, setServicesWithReviews] = useState<{[key: number]: {count: number, average: number}}>({});

  // Fetch seller services
  const { 
    data: services, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['sellerServices'],
    queryFn: () => apiGetSellerServices(),
  });
  
  // Fetch reviews for all services when services data changes
  useEffect(() => {
    const fetchReviewsForServices = async () => {
      if (!services || services.length === 0) return;
      
      const reviewsData: {[key: number]: {count: number, average: number}} = {};
      
      // Fetch reviews for each service
      await Promise.all(services.map(async (service) => {
        try {
          const serviceReviews = await apiGetServiceReviews(service.id);
          const reviewCount = serviceReviews.length;
          
          // Calculate average rating if there are reviews
          const avgRating = reviewCount > 0
            ? serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;
          
          reviewsData[service.id] = {
            count: reviewCount,
            average: avgRating
          };
        } catch (err) {
          console.error(`Error fetching reviews for service ${service.id}:`, err);
          reviewsData[service.id] = { count: 0, average: 0 };
        }
      }));
      
      setServicesWithReviews(reviewsData);
    };
    
    fetchReviewsForServices();
  }, [services]);

  // Function to initiate delete process
  const openDeleteModal = (service: ServiceDto) => {
    setServiceToDelete(service);
  };

  // Function to cancel delete process
  const closeDeleteModal = () => {
    setServiceToDelete(null);
  };

  // Function to confirm and execute delete
  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      setIsDeleting(true);
      await apiDeleteService(serviceToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['sellerServices'] });
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Failed to delete service. Please try again.');
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={(error as Error).message} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-3">
          <Link
            to="/seller/services/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add New Service
          </Link>
        </div>
      </div>

      {services && services.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {services.map((service) => (
              <li key={service.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                        <img
                          src={service.images && service.images.length > 0 
                            ? service.images[0].imageUrl 
                            : 'https://via.placeholder.com/150'}
                          alt={service.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <Link 
                          to={`/seller/services/${service.id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {service.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100">
                            {service.category}
                          </span>
                          <span className="ml-2">
                            Created on {new Date(service.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">${service.price.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="text-xs text-gray-500 mr-4">
                          <span className="font-medium text-gray-900">
                            {servicesWithReviews[service.id]?.count ?? service.reviewCount ?? 0}
                          </span> reviews
                        </div>
                        {(servicesWithReviews[service.id]?.average > 0 || (service.averageRating && service.averageRating > 0)) && (
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-900 mr-1">
                              {(servicesWithReviews[service.id]?.average > 0 
                                ? servicesWithReviews[service.id].average.toFixed(1) 
                                : service.averageRating?.toFixed(1) ?? '0.0')}
                            </span>
                            <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <Link
                      to={`/seller/services/add?edit=${service.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => openDeleteModal(service)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't created any services yet.
          </p>
          <div className="mt-6">
            <Link
              to="/seller/services/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create your first service
            </Link>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <DeleteConfirmationModal
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteService}
          isDeleting={isDeleting}
          serviceName={serviceToDelete.title}
        />
      )}
    </div>
  );
};

export default SellerServicesPage; 
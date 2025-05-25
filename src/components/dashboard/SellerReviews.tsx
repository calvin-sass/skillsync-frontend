import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGetSellerServices } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ReviewList from '../review/ReviewList';
import type { ServiceDto } from '../../types';

interface SellerReviewsProps {
  sellerServices?: ServiceDto[];
}

const SellerReviews: React.FC<SellerReviewsProps> = ({ sellerServices = [] }) => {
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    sellerServices.length > 0 ? sellerServices[0].id : null
  );

  // If no services data was provided, fetch the seller's services
  const { data: services = [] } = useQuery({
    queryKey: ['sellerServices'],
    queryFn: () => apiGetSellerServices(),
    enabled: !!user && user.role === 'seller' && sellerServices.length === 0,
  });

  // Use provided services or fetched services
  const displayServices = sellerServices.length > 0 ? sellerServices : services;

  if (!user || user.role !== 'seller') {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        Only sellers can access this dashboard component.
      </div>
    );
  }

  if (displayServices.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Service Reviews</h2>
        <div className="text-gray-500">
          You don't have any services yet. Create a service to start receiving reviews.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Service Reviews</h2>
      
      {/* Service Selector */}
      <div className="mb-6">
        <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Service
        </label>
        <select
          id="service-select"
          value={selectedServiceId || ''}
          onChange={(e) => setSelectedServiceId(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>Select a service</option>
          {displayServices.map((service: ServiceDto) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>
      
      {/* Reviews for Selected Service */}
      {selectedServiceId ? (
        <ReviewList serviceId={selectedServiceId} showReviewForm={false} />
      ) : (
        <div className="text-gray-500">
          Please select a service to view its reviews.
        </div>
      )}
    </div>
  );
};

export default SellerReviews; 
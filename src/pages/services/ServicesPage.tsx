import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGetServices } from '../../services/api';
import type { ServiceDto, ServiceFilters } from '../../types';

// Spinner component for loading state
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center">
      <svg className={`animate-spin ${sizeClasses[size]} text-primary-600`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
};

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  // Create the filters object for API call
  const filters: ServiceFilters = {};
  
  if (selectedCategory !== 'All Categories') {
    filters.category = selectedCategory;
  }
  
  if (searchQuery) {
    filters.search = searchQuery;
  }
  
  if (selectedPriceRange) {
    filters.priceRange = selectedPriceRange;
  }
  
  // Fetch services with react-query
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', filters],
    queryFn: () => apiGetServices(filters),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 1, // Only retry once if the request fails
  });

  const categories = [
    'All Categories',
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Video',
    'Music',
    'Business',
    'Lifestyle',
  ];
  
  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $25', value: '0-25' },
    { label: '$25 to $50', value: '25-50' },
    { label: '$50 to $100', value: '50-100' },
    { label: '$100 to $200', value: '100-200' },
    { label: 'Over $200', value: '200-10000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Browse Services</h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-primary-100">
              Find the perfect service for your project from our talented professionals
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search services..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category Dropdown */}
          <div className="w-full md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range Dropdown */}
          <div className="w-full md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading services</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
            </p>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service: ServiceDto) => (
              <Link 
                key={service.id} 
                to={`/services/${service.id}`}
                className="block group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                  <img
                    src={service.images && service.images.length > 0 
                      ? service.images[0].imageUrl 
                      : 'https://via.placeholder.com/800x600?text=No+Image'}
                    alt={service.title}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                      {service.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${service.price}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {service.sellerUsername}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-yellow-400">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1">
                          {service.averageRating 
                            ? `${service.averageRating.toFixed(1)} (${service.reviewCount || 0})` 
                            : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {service.deliveryTime && (
                    <div className="mt-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Delivery in {service.deliveryTime} day{service.deliveryTime !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage; 
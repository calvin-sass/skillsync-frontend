import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGetSellerBookings, apiGetServiceById } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { BookingDto } from '../../types';
import BookingActions from '../../components/bookings/BookingActions';

interface ExtendedBooking extends BookingDto {
  serviceName?: string;
  buyerName?: string;
  price?: number;
  requirements?: string;
}

const SellerBookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  
  // Fetch seller bookings
  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sellerBookings'],
    queryFn: apiGetSellerBookings,
    enabled: !!user && user.role?.toLowerCase() === 'seller',
  });

  // Enhance bookings with service details
  const { data: enhancedBookings = [] } = useQuery({
    queryKey: ['enhancedSellerBookings', bookings],
    queryFn: async () => {
      if (!bookings.length) return [];
      
      const enhancedBookingsData: ExtendedBooking[] = [];
      
      for (const booking of bookings) {
        try {
          // Get service details for each booking
          const service = await apiGetServiceById(booking.serviceId);
          
          // We would typically get user details here as well but for now
          // we'll use a placeholder until we implement that API
          enhancedBookingsData.push({
            ...booking,
            serviceName: service.title,
            price: service.price,
            buyerName: `User ${booking.userId}` // This would be replaced with actual user data
          });
        } catch (err) {
          console.error(`Error fetching details for booking ${booking.id}:`, err);
          enhancedBookingsData.push(booking);
        }
      }
      
      return enhancedBookingsData;
    },
    enabled: bookings.length > 0
  });

  // Filter bookings based on active tab and status filter
  const filteredBookings = enhancedBookings.filter((booking) => {
    // Filter by active tab (active or completed)
    const isActiveBooking = 
      ['Pending', 'Accepted', 'In Progress'].includes(booking.status);
    
    if ((activeTab === 'active' && !isActiveBooking) || 
        (activeTab === 'completed' && isActiveBooking)) {
      return false;
    }

    // Filter by status if not 'all'
    if (statusFilter !== 'all' && booking.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status label for display
  const formatStatus = (status: string) => {
    return status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const handleActionComplete = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-200 border-t-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading bookings</h3>
          <p className="mt-1 text-gray-500">
            {error instanceof Error ? error.message : 'Failed to load your bookings. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex items-center space-x-3">
            <select
              id="status-filter"
              name="status-filter"
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Orders
          </button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {booking.serviceName || `Service ID: ${booking.serviceId}`}
                        </p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Buyer: {booking.buyerName || `User ${booking.userId}`}</span>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      {booking.price && (
                        <p className="text-sm font-medium text-gray-900">${booking.price.toFixed(2)}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Due: {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <BookingActions 
                      bookingId={booking.id}
                      bookingStatus={booking.status}
                      bookingPrice={booking.price}
                      serviceId={booking.serviceId}
                      onComplete={handleActionComplete}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg p-10 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 18v-6M8 18v-1m8 1v-3" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? "You don't have any bookings yet." 
              : `You don't have any ${statusFilter} bookings.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default SellerBookingsPage; 
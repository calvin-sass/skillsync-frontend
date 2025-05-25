import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import LimitedNotificationsList from '../../components/notifications/LimitedNotificationsList';
import { fetchSellerStats, apiGetSellerBookings } from '../../services/api';
import type { SellerStats } from '../../services/api';
import type { BookingDto } from '../../types';

const SellerDashboardPage: React.FC = () => {
  const { user, forceUserDataRefresh, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState<SellerStats>({
    totalServices: 0,
    totalBookings: 0,
    totalEarnings: 0,
    completedBookings: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [recentBookings, setRecentBookings] = useState<BookingDto[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth loading state:', isAuthLoading, 'User:', user);
  }, [user, isAuthLoading]);

  useEffect(() => {
    const loadStats = async () => {
      console.log('Attempting to load seller stats. User role:', user?.role);
      setIsLoadingStats(true);
      setStatsError(null);
      try {
        const data = await fetchSellerStats();
        setStats(data);
        console.log('Seller stats loaded:', data);
      } catch (err) {
        console.error('Failed to load seller stats:', err);
        setStatsError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!isAuthLoading && user && user.role?.toLowerCase() === 'seller') {
      loadStats();
    } else if (!isAuthLoading && (!user || user.role?.toLowerCase() !== 'seller')) {
      setIsLoadingStats(false);
      console.log('User is not a seller or not logged in, not loading stats.');
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    const loadRecentBookings = async () => {
      console.log('Attempting to load recent bookings. User role:', user?.role);
      setIsLoadingBookings(true);
      setBookingsError(null);
      try {
        const allBookings = await apiGetSellerBookings();
        const sortedBookings = allBookings.sort((a, b) => {
          if (a.bookingDate && b.bookingDate) {
            return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
          }
          const idA = a.id || 0;
          const idB = b.id || 0;
          if (typeof idA === 'number' && typeof idB === 'number') {
            return idB - idA;
          }
          return String(idB).localeCompare(String(idA));
        });
        setRecentBookings(sortedBookings.slice(0, 3));
        console.log('Recent bookings loaded:', sortedBookings.slice(0, 3));
      } catch (err) {
        console.error('Failed to load recent bookings:', err);
        setBookingsError('Failed to load recent bookings.');
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (!isAuthLoading && user && user.role?.toLowerCase() === 'seller') {
      loadRecentBookings();
    } else if (!isAuthLoading && (!user || user.role?.toLowerCase() !== 'seller')) {
      setIsLoadingBookings(false);
      console.log('User is not a seller or not logged in, not loading bookings.');
    }
  }, [user, isAuthLoading]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAuthLoading) { // Primary loading state based on AuthContext
    return (
      <DashboardLayout showHeader={false} showFooter={false}>
        <div className="p-6 flex justify-center items-center h-64">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'seller') { // Check after auth loading
    return (
      <DashboardLayout showHeader={false} showFooter={false}>
        <div className="p-6 flex flex-col items-center justify-center h-64">
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="ml-3 text-sm font-medium text-red-800">
                Access denied: You must be a seller to view this dashboard.
              </span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingStats) {
    return (
      <DashboardLayout showHeader={false} showFooter={false}>
        <div className="p-6 flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (statsError) {
    return (
      <DashboardLayout showHeader={false} showFooter={false}>
        <div className="p-6">
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{statsError}</h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => { // More robust retry
              forceUserDataRefresh(); // Ensure user data is fresh
              setIsLoadingStats(true);
              setIsLoadingBookings(true);
              setTimeout(() => {
                setStatsError(null);
                setBookingsError(null);
              }, 500);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false} showFooter={false}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Dashboard</h1>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Services</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.totalServices}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/seller/services" className="font-medium text-primary-600 hover:text-primary-500">
                  View all services
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.totalBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/seller/bookings" className="font-medium text-primary-600 hover:text-primary-500">
                  View all bookings
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sales</dt>
                    <dd className="text-3xl font-semibold text-gray-900">${stats.totalEarnings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Jobs</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.completedBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link to="/seller/bookings?status=Completed" className="font-medium text-primary-600 hover:text-primary-500">
                  View completed
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="md:col-span-2 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
            </div>
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {isLoadingBookings ? (
                  <li className="px-4 py-12 text-center text-gray-500">Loading recent bookings...</li>
                ) : bookingsError ? (
                  <li className="px-4 py-12 text-center text-red-500">{bookingsError}</li>
                ) : recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <li key={booking.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-primary-600 truncate">
                          {booking.serviceName || `Service #${booking.serviceId}` || 'N/A'}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Buyer: {booking.buyerUsername || `User #${booking.userId}` || 'N/A'}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Price: ${booking.price?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Date N/A'}</span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-12 text-center text-gray-500">
                    You have no recent bookings.
                  </li>
                )}
              </ul>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 text-center">
                <Link to="/seller/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all bookings
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Notifications</h3>
            </div>
            <div className="p-4">
              <LimitedNotificationsList limit={3} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboardPage; 
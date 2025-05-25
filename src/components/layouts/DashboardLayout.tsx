import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  showSidebar = true
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSeller = user?.role?.toLowerCase() === 'seller';

  // This section previously contained unused variables that have been removed

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex flex-col ${showSidebar ? 'lg:flex-row' : ''}`}>
          {/* Toggle Sidebar Button (mobile) */}
          {showSidebar && (
            <div className="mb-4 lg:hidden">
              <button 
                onClick={toggleSidebar}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 shadow-sm text-gray-700 hover:bg-gray-50"
              >
                {sidebarVisible ? (
                  <>
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hide Sidebar
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Show Sidebar
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Sidebar */}
          {showSidebar && sidebarVisible && (
            <div className="w-full lg:w-64 mb-6 lg:mb-0">
              <div className="bg-white shadow rounded-lg p-4 relative">
                {/* Toggle Sidebar Button (desktop) */}
                <div className="hidden lg:flex justify-end mb-2">
                  <button 
                    onClick={toggleSidebar}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {sidebarVisible ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <nav className="space-y-1">
                  <Link
                    to={isSeller ? "/seller/dashboard" : "/dashboard"}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <svg
                      className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Overview
                  </Link>

                  {!isSeller && (
                    <>
                      <Link to="/bookings" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        My Bookings
                      </Link>
                      <Link to="/user/reviews" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        My Reviews
                      </Link>
                      <Link to="/dashboard/notifications" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Notifications
                      </Link>
                      <Link to="/profile" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </Link>
                    </>
                  )}

                  {isSeller && (
                    <>
                      <Link to="/seller/services" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        My Services
                      </Link>
                      <Link to="/seller/bookings" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Manage Orders
                      </Link>
                      <Link to="/seller/reviews" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        Reviews
                      </Link>
                      <Link to="/seller/notifications" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50">
                        <svg
                          className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Notifications
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <svg
                      className="text-gray-400 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={showSidebar && sidebarVisible ? "lg:ml-8 lg:flex-1" : "w-full"}>
            {/* Show toggle sidebar button when sidebar is hidden (desktop) */}
            {showSidebar && !sidebarVisible && (
              <div className="hidden lg:block mb-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md bg-white border border-gray-300 shadow-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 
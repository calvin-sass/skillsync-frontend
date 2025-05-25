import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get display name from available user properties
  const displayName = user?.username || '';
  
  // Determine if user is a seller
  const isSeller = user?.role === 'Seller';
  
  // Get appropriate bookings path
  const bookingsPath = isSeller ? '/seller/bookings' : '/bookings';

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle profile dropdown
      if (isDropdownOpen && event.target instanceof Element) {
        const profileMenu = document.getElementById('profile-menu');
        if (profileMenu && !profileMenu.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
      
      // Handle mobile menu
      if (isMobileMenuOpen && event.target instanceof Element) {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuRef.current && 
            !mobileMenuRef.current.contains(event.target) && 
            mobileMenuButton && 
            !mobileMenuButton.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary-600">SkillSync</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`${
                    isActive('/') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className={`${
                    isActive('/services') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Services
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  {user.role === 'Seller' && (
                    <Link
                      to="/seller/dashboard"
                      className="text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      {displayName}
                    </span>
                    <NotificationBell />
                  </div>
                  <div className="relative" id="profile-menu">
                    <div className="relative">
                      <button 
                        onClick={toggleDropdown}
                        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                          {user.avatarUrl ? (
                            <img 
                              src={`${user.avatarUrl}?t=${new Date().getTime()}`} 
                              alt={user.username || 'User avatar'} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.log('Error loading avatar in header, using fallback');
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=User';
                              }}
                            />
                          ) : (
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Link
                            to={isSeller ? "/seller/dashboard" : "/dashboard"}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Your Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to={bookingsPath}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Bookings
                          </Link>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              logout();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <button 
                id="mobile-menu-button"
                type="button" 
                onClick={toggleMobileMenu}
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  // X icon when menu is open
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger icon when menu is closed
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" ref={mobileMenuRef}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`${isActive('/') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`${isActive('/services') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
          </div>

          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                    {user.avatarUrl ? (
                      <img 
                        src={`${user.avatarUrl}?t=${new Date().getTime()}`} 
                        alt={user.username || 'User avatar'} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=User';
                        }}
                      />
                    ) : (
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{displayName}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <div className="ml-auto">
                  <NotificationBell />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to={isSeller ? "/seller/dashboard" : "/dashboard"}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Your Dashboard
                </Link>
                {user.role === 'Seller' && (
                  <Link
                    to="/seller/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to={bookingsPath}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Bookings
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SkillSync</h3>
              <p className="text-gray-300 text-sm">
                Connect with talented professionals to bring your projects to life.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/services" className="hover:text-white">Find Services</Link></li>
                <li><Link to="/register" className="hover:text-white">Post a Job</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Sellers</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/register?seller=true" className="hover:text-white">Start Selling</Link></li>
                <li><Link to="/seller/dashboard" className="hover:text-white">Seller Dashboard</Link></li>
                <li><Link to="/community" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/contact" className="hover:text-white">Help & Support</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 
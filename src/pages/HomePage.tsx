import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'design',
    name: 'Design',
    description: 'Logo design, web design, and more',
    icon: '🎨',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Web, mobile, and software development',
    icon: '💻',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Social media, SEO, and content marketing',
    icon: '📈',
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Content writing, copywriting, and translation',
    icon: '✍️',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Video editing, animation, and production',
    icon: '🎬',
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Music production, composition, and voice over',
    icon: '🎵',
    color: 'bg-purple-100 text-purple-800',
  },
];

type LocationState = {
  from?: string;
  showLoginPrompt?: boolean;
};

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [returnPath, setReturnPath] = useState<string | undefined>(undefined);
  
  // Extract location state
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (state?.showLoginPrompt) {
      setShowLoginBanner(true);
      setReturnPath(state.from);
      // Clear the state to prevent showing the banner on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [state, navigate, location.pathname]);

  const handleLogin = () => {
    navigate('/login', { state: { from: returnPath } });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Login Banner */}
      {showLoginBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <p className="ml-3 font-medium text-yellow-700 truncate">
                  <span>
                    Please log in to access this feature
                  </span>
                </p>
              </div>
              <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                <button
                  onClick={handleLogin}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50"
                >
                  Login now
                </button>
              </div>
              <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                <button
                  type="button"
                  onClick={() => setShowLoginBanner(false)}
                  className="-mr-1 flex p-2 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-6 w-6 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find the perfect service for your business
            </h1>
            <p className="mt-6 text-xl max-w-2xl mx-auto">
              Connect with talented professionals to work on your projects. Find services for every budget and timeline.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50"
              >
                Browse Services
              </Link>
              <Link
                to="/register"
                className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Browse by category</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of services across various categories
            </p>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/services?category=${category.name}`}
                className="group bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center p-3 rounded-md ${category.color}`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-primary-600">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How SkillSync works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Get your projects done in three simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Find a service</h3>
              <p className="mt-2 text-base text-gray-500">
                Browse through various categories and find the right service for your needs
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Book a service</h3>
              <p className="mt-2 text-base text-gray-500">
                Connect with talented professionals and book their services
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Get your work done</h3>
              <p className="mt-2 text-base text-gray-500">
                Collaborate with your chosen professional and receive high-quality work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">Page not found</h2>
        <p className="mt-6 text-base text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go back home
          </Link>
          <Link
            to="/services"
            className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 
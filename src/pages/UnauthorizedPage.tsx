import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
          <svg className="h-16 w-16 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m2.5 10H9c-1.5-2-3-5.5-3-7.5a6 6 0 1112 0c0 2-1.5 5.5-3 7.5z" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">Access Denied</h2>
        <p className="mt-4 text-base text-gray-500">
          Sorry, you don't have permission to access this page.
        </p>
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go back
          </button>
          <Link
            to="/"
            className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-base font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 
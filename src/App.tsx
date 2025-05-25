// Removed unused React import, keeping JSX transform
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AccountReactivationPage from './pages/auth/AccountReactivationPage';
import ServicesPage from './pages/services/ServicesPage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import DashboardPage from './pages/user/DashboardPage';
import BookingsPage from './pages/user/BookingsPage';
import ProfilePage from './pages/user/ProfilePage';
import UserReviewsPage from './pages/user/UserReviewsPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerServicesPage from './pages/seller/SellerServicesPage';
import SellerServiceDetailPage from './pages/seller/SellerServiceDetailPage';
import SellerAddServicePage from './pages/seller/SellerAddServicePage';
import SellerBookingsPage from './pages/seller/SellerBookingsPage';
import SellerReviewsPage from './pages/seller/SellerReviewsPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
// Removed unused NotificationsPage import
import StandaloneNotifications from './components/notifications/StandaloneNotifications';
// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Layout wrapper component that provides Outlet as children
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function UserDashboardRoute() {
  const { user } = useAuth();
  // Add logging to debug user role
  console.log('UserDashboardRoute - User:', user);
  
  // Make sure we have a user and role before redirecting
  if (user && user.role && user.role.toLowerCase() === 'seller') {
    console.log('Redirecting seller to seller dashboard');
    return <Navigate to="/seller/dashboard" replace />;
  }
  return <DashboardPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LayoutWrapper />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="confirm-email" element={<VerifyEmailPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="account-reactivation" element={<AccountReactivationPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected User Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardRoute />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bookings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <BookingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/notifications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout showHeader={false}>
                      <StandaloneNotifications />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="user/reviews"
                element={
                  <ProtectedRoute>
                    <UserReviewsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Seller Routes */}
              <Route
                path="seller/dashboard"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <SellerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/services"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <SellerServicesPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/services/add"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <SellerAddServicePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/services/:id"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <SellerServiceDetailPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/bookings"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <SellerBookingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/notifications"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false}>
                      <StandaloneNotifications />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seller/reviews"
                element={
                  <ProtectedRoute roles={['Seller']}>
                    <DashboardLayout showHeader={false} showFooter={false}>
                      <SellerReviewsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback Routes */}
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

// Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ConfirmEmail {
  email: string;
  token: string;
}

export interface ResetPassword {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

// Service Types
export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: User;
  images: ServiceImage[];
  reviews?: Review[];
  averageRating?: number;
  isActive?: boolean;
  deliveryTime?: number; // in days
  tags?: string[];
}

export interface ServiceImage {
  id: number;
  url: string;
  serviceId: number;
  isPrimary?: boolean;
}

export interface ServiceDto {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  sellerId: number;
  sellerUsername: string;
  images: { id: number; imageUrl: string; }[];
  averageRating?: number;
  reviewCount?: number;
  deliveryTime?: number;
  tags?: string[];
}

export interface ServiceCreateDto {
  title: string;
  description: string;
  price: number;
  category: string;
  deliveryTime?: number;
  tags?: string[];
}

export interface ServiceUpdateDto {
  title: string;
  description: string;
  price: number;
  category: string;
  deliveryTime?: number;
  tags?: string[];
}

export interface ServicePatchDto {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  deliveryTime?: number;
  tags?: string[];
}

export interface ServiceImageUploadDto {
  ServiceId: number;
  Image: File;
}

// Booking Types
export interface Booking {
  id: number;
  bookingDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  serviceId: number;
  service: Service;
  payment?: Payment;
}

export interface BookingCreateDto {
  serviceId: number;
  bookingDate: string;
}

export interface BookingDto {
  id: number;
  bookingDate: string;
  status: string;
  serviceId: number;
  userId: number;
  serviceName?: string;
  buyerUsername?: string;
  price?: number;
  paymentStatus?: string;
}

// Payment Types
export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

export interface PaymentCreateDto {
  bookingId?: number;  // Optional since it can be provided in the URL path
  paymentMethodId: string;
  returnUrl?: string; // Optional if disableRedirectPayments is true
  disableRedirectPayments?: boolean; // Set to true to only use direct card payments
  // Amount is populated by the service
}

export interface PaymentResponseDto {
  message: string;
  redirectUrl?: string; // Optional URL to redirect to for certain payment methods
}

// Review Types
export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  serviceId: number;
  bookingId: number;
  user: User;
}

export interface ReviewDto {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  serviceId: number;
  bookingId: number;
  username?: string;
  userAvatarUrl?: string;
}

export interface ReviewCreateDto {
  rating: number;
  comment?: string;
  serviceId: number;
  bookingId: number;
}

export interface ReviewUpdateDto {
  rating?: number;
  comment?: string;
}

// Notification Types
export interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalServices?: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue?: number;
  averageRating?: number;
}

// Filter Types
export interface ServiceFilters {
  category?: string;
  priceRange?: string;
  search?: string;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
} 
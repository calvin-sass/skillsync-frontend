import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetNotifications,
  apiMarkNotificationAsRead,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface LimitedNotificationsListProps {
  limit?: number;
  showViewAll?: boolean;
}

const LimitedNotificationsList: React.FC<LimitedNotificationsListProps> = ({
  limit = 3,
  showViewAll = true,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSeller = user?.role === "Seller";
  const notificationsPath = isSeller
    ? "/seller/notifications"
    : "/dashboard/notifications";

  // Fetch user notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: apiGetNotifications,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiMarkNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Limit the number of notifications shown
  const limitedNotifications = notifications.slice(0, limit);
  const hasMoreNotifications = notifications.length > limit;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        Error loading notifications. Please try again.
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        You have no notifications.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {limitedNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-md ${
            notification.isRead ? "bg-white" : "bg-blue-50"
          } border border-gray-200 shadow-sm`}
        >
          <div className="flex justify-between items-start">
            <p
              className={`text-sm ${
                notification.isRead
                  ? "text-gray-600"
                  : "text-gray-900 font-medium"
              }`}
            >
              {notification.message}
            </p>
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Mark as read
              </button>
            )}
          </div>
          <div className="mt-1">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
          </div>
        </div>
      ))}

      {showViewAll && hasMoreNotifications && (
        <div className="text-center pt-2">
          <Link
            to={notificationsPath}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all notifications ({notifications.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default LimitedNotificationsList;

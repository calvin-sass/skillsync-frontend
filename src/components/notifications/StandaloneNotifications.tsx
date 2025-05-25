import React from 'react';
import NotificationsList from './NotificationsList';

const StandaloneNotifications: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <NotificationsList />
      </div>
    </div>
  );
};

export default StandaloneNotifications; 
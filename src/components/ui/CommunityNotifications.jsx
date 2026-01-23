import React from 'react';

const CommunityNotifications = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg shadow-lg border-l-4 bg-white ${
            notification.type === 'trade' ? 'border-blue-500' :
            notification.type === 'event' ? 'border-green-500' :
            notification.type === 'challenge' ? 'border-purple-500' :
            'border-gray-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {notification.type === 'trade' ? '🤝' :
                   notification.type === 'event' ? '🎪' :
                   notification.type === 'challenge' ? '🏆' :
                   '📢'}
                </span>
                <span className="font-semibold text-sm">{notification.title}</span>
              </div>
              <p className="text-xs text-gray-600">{notification.message}</p>
              {notification.reward && (
                <div className="mt-1 text-xs text-green-600">
                  Reward: {notification.reward}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(index)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityNotifications;

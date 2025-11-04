import React, { useEffect, useState } from 'react';
import { BADGE_INFO } from '../constants';

interface BadgeNotificationProps {
  badgeName: string | null;
  onDismiss: () => void;
}

export default function BadgeNotification({ badgeName, onDismiss }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const badge = badgeName ? BADGE_INFO[badgeName] : null;

  useEffect(() => {
    if (badgeName) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before fully dismissing
        setTimeout(onDismiss, 500);
      }, 5000); // Show for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [badgeName, onDismiss]);

  if (!badge) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl p-4 flex items-center border-2 border-yellow-400">
        <div className="text-4xl mr-4">{badge.icon}</div>
        <div>
          <p className="font-bold text-green-800">Badge Unlocked!</p>
          <p className="text-gray-700">{badge.title}</p>
        </div>
      </div>
    </div>
  );
}
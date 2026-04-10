'use client';

import { useEffect, useState } from 'react';

interface RealtimeIndicatorProps {
  lastUpdated?: Date;
  interval?: number;
}

export default function RealtimeIndicator({ lastUpdated, interval = 10 }: RealtimeIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff);
      
      // Show pulse animation when recently updated (within 2 seconds)
      setIsActive(diff < 2);
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [lastUpdated]);

  const getTimeText = () => {
    if (secondsAgo < 5) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutes = Math.floor(secondsAgo / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full bg-secondary ${isActive ? 'animate-pulse' : ''}`}></div>
        {isActive && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-secondary animate-ping"></div>
        )}
      </div>
      <span className="font-label">
        {isActive ? 'Live' : getTimeText()}
      </span>
    </div>
  );
}

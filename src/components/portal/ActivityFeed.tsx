'use client';

import { useEffect, useState, useRef } from 'react';
import { Activity } from '@/types/metrics';
import WebSocketClient from '@/lib/websocket';
import { cn } from '@/lib/cn';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  token?: string;
  className?: string;
  maxItems?: number;
}

const activityTypeConfig = {
  transformation: {
    icon: '🔄',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  opportunity: {
    icon: '💡',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  error_prevention: {
    icon: '🛡️',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  executive_action: {
    icon: '👤',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  crm_update: {
    icon: '📊',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
};

export function ActivityFeed({ token, className, maxItems = 50 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsClient = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    // Initialize WebSocket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    wsClient.current = new WebSocketClient(wsUrl);

    try {
      wsClient.current.connect(token);

      // Listen for connection events
      wsClient.current.on('connect', () => {
        setConnected(true);
        setError(null);
      });

      wsClient.current.on('disconnect', () => {
        setConnected(false);
      });

      wsClient.current.on('connect_error', (err: Error) => {
        setError(err.message || 'Connection error');
        setConnected(false);
      });

      // Listen for activity updates
      wsClient.current.on('activity', (activity: Activity) => {
        setActivities((prev) => {
          const updated = [activity, ...prev];
          return updated.slice(0, maxItems);
        });
      });

      // Listen for initial activity feed
      wsClient.current.on('activity_feed', (feed: Activity[]) => {
        setActivities(feed.slice(0, maxItems));
      });

      // Request initial feed
      wsClient.current.emit('request_activity_feed', { limit: maxItems });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }

    // Cleanup on unmount
    return () => {
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, [token, maxItems]);

  const formatValue = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (error) {
    return (
      <div className={cn('rounded-xl border border-slate-800 bg-slate-900/50 p-6', className)}>
        <div className="flex items-center gap-3 text-red-400">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold">Connection Error</h3>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm', className)}>
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Live Activity Stream</h2>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  connected ? 'animate-pulse bg-emerald-500' : 'bg-slate-600'
                )}
              />
              <span className="text-xs text-slate-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-500">
            {activities.length} {activities.length === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-4xl">📡</div>
            <p className="text-sm text-slate-400">Waiting for activity...</p>
            <p className="mt-1 text-xs text-slate-600">
              New events will appear here in real-time
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {activities.map((activity, index) => {
              const config = activityTypeConfig[activity.type];
              const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
              });

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'group relative p-4 transition-colors hover:bg-slate-800/30',
                    index === 0 && 'animate-[fadeIn_0.3s_ease-in]'
                  )}
                >
                  {/* Connecting line for timeline */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-9 top-14 h-full w-px bg-slate-800" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border text-xl',
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        {config.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {activity.title}
                        </h3>
                        <time className="flex-shrink-0 text-xs text-slate-500">
                          {timeAgo}
                        </time>
                      </div>

                      <p className="text-sm text-slate-400">{activity.description}</p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.metadata.executive_name && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                              <span>👤</span>
                              <span>{activity.metadata.executive_name}</span>
                            </span>
                          )}
                          {activity.metadata.value && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                              <span>💰</span>
                              <span>{formatValue(activity.metadata.value)}</span>
                            </span>
                          )}
                          {activity.metadata.entity_type && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                              <span>{activity.metadata.entity_type}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// CSS for fade-in animation (add to global styles if needed)
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

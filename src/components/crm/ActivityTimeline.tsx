import { Activity } from '@/types/crm';
import { ReactElement } from 'react';

interface ActivityTimelineProps {
  groupedActivities: { [key: string]: Activity[] };
  getActivityIcon: (type: string) => ReactElement;
  getActivityColor: (type: string) => string;
}

export function ActivityTimeline({
  groupedActivities,
  getActivityIcon,
  getActivityColor,
}: ActivityTimelineProps) {
  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([date, activities]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-white">{date}</h3>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Activities for this date */}
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1 capitalize">{activity.type}</h4>
                        <p className="text-gray-400 text-sm">{activity.description}</p>
                      </div>

                      {/* Timestamp */}
                      <time className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    {/* Metadata */}
                    {(activity.entity_type || activity.entity_id) && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {activity.entity_type && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="capitalize">{activity.entity_type}</span>
                          </span>
                        )}
                        {activity.entity_id && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-mono">ID: {activity.entity_id.substring(0, 8)}...</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

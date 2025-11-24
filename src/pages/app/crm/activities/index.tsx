'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { api } from '@/lib/api';
import { Activity } from '@/types/crm';
import { cn } from '@/lib/cn';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function ActivitiesPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get auth token from session storage
  const getToken = () => {
    if (typeof window === 'undefined') return '';
    const tokens = sessionStorage.getItem('auth_tokens');
    if (!tokens) return '';
    return JSON.parse(tokens).access_token;
  };

  // Fetch activities
  const {
    data: activitiesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.getActivities(token);
    },
    enabled: typeof window !== 'undefined',
  });

  const activities: Activity[] = (activitiesResponse as any)?.data || [];

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search filter
      const matchesSearch = searchQuery
        ? activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.type.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Entity type filter
      const matchesEntityType =
        entityTypeFilter === 'all' || activity.entity_type === entityTypeFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === 'today') {
          matchesDate =
            activityDate >= today && activityDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = activityDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = activityDate >= monthAgo;
        }
      }

      return matchesSearch && matchesEntityType && matchesDate;
    });
  }, [activities, searchQuery, entityTypeFilter, dateFilter]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: Activity[] } = {};

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  // Get activity type stats
  const activityStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    filteredActivities.forEach((activity) => {
      stats[activity.type] = (stats[activity.type] || 0) + 1;
    });
    return stats;
  }, [filteredActivities]);

  const getActivityIcon = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('create') || lowerType.includes('add')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    }
    if (lowerType.includes('update') || lowerType.includes('edit') || lowerType.includes('modify')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    }
    if (lowerType.includes('delete') || lowerType.includes('remove')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      );
    }
    if (lowerType.includes('email') || lowerType.includes('mail')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (lowerType.includes('call') || lowerType.includes('phone')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      );
    }
    if (lowerType.includes('note') || lowerType.includes('comment')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      );
    }

    // Default icon
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    );
  };

  const getActivityColor = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('create') || lowerType.includes('add')) {
      return 'text-green-400 bg-green-500/20';
    }
    if (lowerType.includes('update') || lowerType.includes('edit') || lowerType.includes('modify')) {
      return 'text-blue-400 bg-blue-500/20';
    }
    if (lowerType.includes('delete') || lowerType.includes('remove')) {
      return 'text-red-400 bg-red-500/20';
    }
    if (lowerType.includes('email') || lowerType.includes('mail')) {
      return 'text-purple-400 bg-purple-500/20';
    }
    if (lowerType.includes('call') || lowerType.includes('phone')) {
      return 'text-cyan-400 bg-cyan-500/20';
    }

    return 'text-gray-400 bg-gray-500/20';
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 text-lg animate-pulse">Loading activities...</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Audit Trail</h1>
          <p className="mt-2 text-gray-400">Complete history of all CRM changes and interactions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">
              Failed to load activities. {error instanceof Error ? error.message : 'Please try again.'}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        {Object.keys(activityStats).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Activities</div>
              <div className="text-2xl font-bold text-white">{filteredActivities.length}</div>
            </div>
            {Object.entries(activityStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([type, count]) => (
                <div key={type} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1 capitalize">{type}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                </div>
              ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entity Types</option>
            <option value="contact">Contacts</option>
            <option value="company">Companies</option>
            <option value="deal">Deals</option>
            <option value="task">Tasks</option>
            <option value="note">Notes</option>
          </select>

          {/* Date Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setDateFilter('all')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                dateFilter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Month
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>

        {/* Activities Timeline */}
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          <ActivityTimeline
            groupedActivities={groupedActivities}
            getActivityIcon={getActivityIcon}
            getActivityColor={getActivityColor}
          />
        )}
      </div>
    </PortalLayout>
  );
}

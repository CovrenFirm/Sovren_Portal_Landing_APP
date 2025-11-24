import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getRecentActivities, CRMActivity } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function DashboardPage() {
  const { tokens } = useAuth();
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      if (!tokens?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getRecentActivities(tokens.access_token, 5);
        setActivities(data);
      } catch (err) {
        console.error('Failed to load activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [tokens]);

  return (
    <>
      <Head>
        <title>Command Center - Sovren AI</title>
      </Head>

      <PortalLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to your Command Center</h2>
            <p className="text-gray-300">
              Your AI-powered executive intelligence platform is ready. Monitor your organization,
              manage relationships, and make data-driven decisions.
            </p>
          </div>

          {/* Today's Snapshot */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Today's Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SnapshotCard
                title="Total Contacts"
                value="—"
                icon="👥"
                color="indigo"
              />
              <SnapshotCard
                title="Active Deals"
                value="—"
                icon="💼"
                color="purple"
              />
              <SnapshotCard
                title="Tasks Due"
                value="—"
                icon="✓"
                color="blue"
              />
              <SnapshotCard
                title="System Status"
                value="Healthy"
                icon="⚡"
                color="green"
              />
            </div>
          </div>

          {/* Recent CRM Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Recent CRM Activity</h3>
              <Link
                href="/app/crm/contacts"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Loading recent activity...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-2">Unable to load recent activity</p>
                  <p className="text-xs">{error}</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">Activity will appear here as you use the CRM</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {activities.map((activity) => (
                    <div key={activity.activity_id} className="p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-white">
                              {activity.activity_type}
                            </span>
                            {activity.contact_name && (
                              <span className="text-sm text-gray-400">
                                · {activity.contact_name}
                              </span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                title="View Contacts"
                description="Browse and manage your contact database"
                icon="👥"
                href="/app/crm/contacts"
              />
              <QuickActionCard
                title="View Deals"
                description="Track your sales pipeline and opportunities"
                icon="💼"
                href="/app/crm/deals"
              />
              <QuickActionCard
                title="Voice Demo"
                description="Try the AI executive voice interface"
                icon="🎤"
                href="/demo"
              />
            </div>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

function SnapshotCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    indigo: 'from-indigo-900/30 to-indigo-800/20 border-indigo-700/50',
    purple: 'from-purple-900/30 to-purple-800/20 border-purple-700/50',
    blue: 'from-blue-900/30 to-blue-800/20 border-blue-700/50',
    green: 'from-green-900/30 to-green-800/20 border-green-700/50',
  }[color];

  return (
    <div
      className={cn(
        'bg-gradient-to-br border rounded-xl p-6',
        colorClasses
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <div className="text-sm text-gray-300">{title}</div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-700/50 hover:bg-gray-800/50 transition-all"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};

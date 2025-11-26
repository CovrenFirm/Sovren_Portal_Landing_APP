import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getRecentActivities, CRMActivity } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeedItem } from '@/components/dashboard/ActivityFeedItem';
import { Users, Briefcase, CheckSquare, Activity, ArrowRight, Mic } from 'lucide-react';

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
        <div className="space-y-8">
          {/* Header & System Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
              <p className="text-gray-400">Executive Intelligence Platform Active</p>
            </div>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-full px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-mono text-indigo-400">NEURAL LINK: STABLE</span>
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Contacts"
              value="2,543"
              icon={Users}
              color="indigo"
              trend={{ value: 12, label: "vs last week", positive: true }}
              delay={0}
            />
            <StatCard
              title="Active Deals"
              value="$1.2M"
              icon={Briefcase}
              color="purple"
              trend={{ value: 8, label: "pipeline growth", positive: true }}
              delay={1}
            />
            <StatCard
              title="Tasks Due"
              value="14"
              icon={CheckSquare}
              color="blue"
              trend={{ value: 2, label: "overdue", positive: false }}
              delay={2}
            />
            <StatCard
              title="System Health"
              value="100%"
              icon={Activity}
              color="emerald"
              delay={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity size={20} className="text-indigo-400" />
                  Neural Stream
                </h3>
                <Link
                  href="/app/crm/contacts"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
                >
                  View full log
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 min-h-[300px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-t-2 border-purple-500 rounded-full animate-spin reverse"></div>
                    </div>
                    <p className="text-gray-400 text-sm font-mono animate-pulse">ESTABLISHING UPLINK...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p className="mb-2">SIGNAL LOST</p>
                    <p className="text-xs font-mono text-red-400">{error}</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p>NO RECENT TRANSMISSIONS</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activities.map((activity, index) => (
                      <ActivityFeedItem
                        key={activity.activity_id}
                        activity={activity}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Quick Protocols</h3>
              <div className="grid gap-4">
                <Link href="/demo" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 hover:border-indigo-500/60 transition-all duration-300">
                  <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:text-white group-hover:scale-110 transition-all">
                      <Mic size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Initiate Voice Link</h4>
                      <p className="text-xs text-indigo-200/70">Connect to Executive AI</p>
                    </div>
                  </div>
                </Link>

                <Link href="/app/crm/contacts" className="group relative overflow-hidden rounded-xl bg-gray-900/40 border border-gray-700/50 p-6 hover:border-gray-600 transition-all duration-300">
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white transition-colors">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Manage Database</h4>
                      <p className="text-xs text-gray-400">Access Contact Records</p>
                    </div>
                  </div>
                </Link>

                <Link href="/app/crm/deals" className="group relative overflow-hidden rounded-xl bg-gray-900/40 border border-gray-700/50 p-6 hover:border-gray-600 transition-all duration-300">
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gray-800 text-gray-400 group-hover:text-white transition-colors">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Pipeline View</h4>
                      <p className="text-xs text-gray-400">Track Active Deals</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};

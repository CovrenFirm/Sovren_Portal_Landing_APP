import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal/PortalLayout';
import DeliberationViewer from '@/components/executives/DeliberationViewer';
import { Deliberation, DeliberationMessage } from '@/types/executives';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import WebSocketClient from '@/lib/websocket';
import { cn } from '@/lib/cn';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export default function DeliberationsPage() {
  const { tokens } = useAuth();
  const [selectedDeliberation, setSelectedDeliberation] = useState<Deliberation | null>(null);
  const [messages, setMessages] = useState<DeliberationMessage[]>([]);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'awaiting_approval'>('all');

  // Initialize WebSocket
  useEffect(() => {
    if (!tokens?.access_token) return;

    const client = new WebSocketClient(WS_URL);
    client.connect(tokens.access_token);
    setWsClient(client);

    return () => {
      client.disconnect();
    };
  }, [tokens?.access_token]);

  // Fetch deliberations
  const { data: deliberations, isLoading, error } = useQuery<Deliberation[]>({
    queryKey: ['deliberations'],
    queryFn: () => api.getDeliberations(tokens?.access_token || '') as Promise<Deliberation[]>,
    enabled: !!tokens?.access_token,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Fetch messages for selected deliberation
  const { data: deliberationMessages } = useQuery<DeliberationMessage[]>({
    queryKey: ['deliberation-messages', selectedDeliberation?.id],
    queryFn: () => api.getDeliberationMessages(selectedDeliberation!.id, tokens?.access_token || '') as Promise<DeliberationMessage[]>,
    enabled: !!selectedDeliberation && !!tokens?.access_token,
  });

  useEffect(() => {
    if (deliberationMessages) {
      setMessages(deliberationMessages);
    }
  }, [deliberationMessages]);

  const filteredDeliberations = deliberations?.filter((delib) => {
    if (filter === 'all') return true;
    return delib.status === filter;
  });

  const statusConfig = {
    active: {
      label: 'Live',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      dot: 'bg-green-500 animate-pulse',
    },
    completed: {
      label: 'Completed',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      dot: 'bg-gray-500',
    },
    awaiting_approval: {
      label: 'Awaiting Approval',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      dot: 'bg-yellow-500',
    },
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Deliberation Theater</h1>
            <p className="text-gray-400">Watch AI executives collaborate in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('awaiting_approval')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'awaiting_approval'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'completed'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Stats */}
        {deliberations && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{deliberations.length}</div>
              <div className="text-sm text-gray-400">Total Deliberations</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {deliberations.filter((d) => d.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Live Now</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {deliberations.filter((d) => d.status === 'awaiting_approval').length}
              </div>
              <div className="text-sm text-gray-400">Awaiting Approval</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400">
                {deliberations.filter((d) => d.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading deliberations...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            Failed to load deliberations. Please try again.
          </div>
        )}

        {/* Two-column layout: List on left, Viewer on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deliberations List */}
          <div className="lg:col-span-1 space-y-4">
            {filteredDeliberations && filteredDeliberations.length > 0 ? (
              filteredDeliberations.map((deliberation) => {
                const status = statusConfig[deliberation.status];
                const isSelected = selectedDeliberation?.id === deliberation.id;

                return (
                  <div
                    key={deliberation.id}
                    onClick={() => setSelectedDeliberation(deliberation)}
                    className={cn(
                      'bg-gray-900/50 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300',
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium line-clamp-2 flex-1">
                        {deliberation.topic}
                      </h3>
                      <div className={cn('px-2 py-1 rounded-full border text-xs ml-2', status.color)}>
                        <div className="flex items-center gap-1">
                          <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div>
                        {deliberation.participants.length} participant
                        {deliberation.participants.length !== 1 ? 's' : ''}
                      </div>
                      <div>{deliberation.message_count} messages</div>
                      <div>Started: {new Date(deliberation.started_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                No deliberations found with the selected filter.
              </div>
            )}
          </div>

          {/* Deliberation Viewer */}
          <div className="lg:col-span-2">
            {selectedDeliberation ? (
              <div className="h-[600px]">
                <DeliberationViewer
                  deliberation={selectedDeliberation}
                  messages={messages}
                  wsClient={wsClient || undefined}
                />
              </div>
            ) : (
              <div className="h-[600px] bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                  <p className="text-lg">Select a deliberation to view the transcript</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

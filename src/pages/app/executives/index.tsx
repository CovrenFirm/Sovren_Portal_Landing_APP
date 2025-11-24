import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal/PortalLayout';
import ExecutiveCard from '@/components/executives/ExecutiveCard';
import { Executive } from '@/types/executives';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function ExecutivesPage() {
  const { tokens } = useAuth();
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);
  const [interactionMessage, setInteractionMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'deliberating' | 'idle'>('all');

  const { data: executives, isLoading, error } = useQuery<Executive[]>({
    queryKey: ['executives'],
    queryFn: () => api.getExecutives(tokens?.access_token || '') as Promise<Executive[]>,
    enabled: !!tokens?.access_token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredExecutives = executives?.filter((exec) => {
    if (filter === 'all') return true;
    return exec.status === filter;
  });

  const handleInteract = async () => {
    if (!selectedExecutive || !interactionMessage.trim() || !tokens) return;

    try {
      await api.interactWithExecutive(
        selectedExecutive.id,
        interactionMessage,
        tokens.access_token
      );
      setInteractionMessage('');
      setSelectedExecutive(null);
      // Optionally show success message
    } catch (err) {
      console.error('Failed to interact with executive:', err);
      // Optionally show error message
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Shadow Board</h1>
            <p className="text-gray-400">Your AI executive team, ready to collaborate</p>
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
              Active
            </button>
            <button
              onClick={() => setFilter('deliberating')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'deliberating'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Deliberating
            </button>
            <button
              onClick={() => setFilter('idle')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'idle'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              Idle
            </button>
          </div>
        </div>

        {/* Stats */}
        {executives && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{executives.length}</div>
              <div className="text-sm text-gray-400">Total Executives</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {executives.filter((e) => e.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {executives.filter((e) => e.status === 'deliberating').length}
              </div>
              <div className="text-sm text-gray-400">Deliberating</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400">
                {executives.filter((e) => e.status === 'idle').length}
              </div>
              <div className="text-sm text-gray-400">Idle</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading executives...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            Failed to load executives. Please try again.
          </div>
        )}

        {/* Executive Grid */}
        {filteredExecutives && filteredExecutives.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExecutives.map((executive) => (
              <ExecutiveCard
                key={executive.id}
                executive={executive}
                onClick={() => setSelectedExecutive(executive)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredExecutives && filteredExecutives.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            No executives found with the selected filter.
          </div>
        )}
      </div>

      {/* Interaction Modal */}
      {selectedExecutive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {selectedExecutive.avatar_url ? (
                    <img
                      src={selectedExecutive.avatar_url}
                      alt={selectedExecutive.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white">
                      {selectedExecutive.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedExecutive.full_name}</h2>
                  <p className="text-gray-400">{selectedExecutive.role}</p>
                  <p className="text-sm text-gray-500">{selectedExecutive.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExecutive(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Bio */}
            {selectedExecutive.bio && (
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 text-sm">{selectedExecutive.bio}</p>
              </div>
            )}

            {/* Permissions */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExecutive.permissions.map((permission, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            {/* Interaction Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Send a message or request
              </label>
              <textarea
                value={interactionMessage}
                onChange={(e) => setInteractionMessage(e.target.value)}
                placeholder="What would you like to ask or discuss?"
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedExecutive(null)}
                className="flex-1 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInteract}
                disabled={!interactionMessage.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

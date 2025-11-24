import { Executive } from '@/types/executives';
import { cn } from '@/lib/cn';

interface ExecutiveCardProps {
  executive: Executive;
  onClick: () => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    dot: 'bg-green-500',
  },
  idle: {
    label: 'Idle',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-500',
  },
  deliberating: {
    label: 'Deliberating',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500 animate-pulse',
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
  },
};

export default function ExecutiveCard({ executive, onClick }: ExecutiveCardProps) {
  const status = statusConfig[executive.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800',
        'rounded-xl p-6 cursor-pointer transition-all duration-300',
        'hover:bg-gray-800/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10',
        'hover:-translate-y-1'
      )}
    >
      {/* Status indicator in top-right */}
      <div className="absolute top-4 right-4">
        <div className={cn('px-3 py-1 rounded-full border text-xs font-medium', status.color)}>
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', status.dot)} />
            {status.label}
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
            {executive.avatar_url ? (
              <img
                src={executive.avatar_url}
                alt={executive.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white">
                {executive.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            )}
          </div>
          {/* Status dot overlay */}
          <div className={cn('absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-900', status.dot)} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {executive.full_name}
          </h3>
          <p className="text-sm text-gray-400">{executive.role}</p>
          <p className="text-xs text-gray-500">{executive.department}</p>
        </div>
      </div>

      {/* Current Activity */}
      {executive.current_activity && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Current Activity</div>
          <div className="text-sm text-gray-300 line-clamp-2">{executive.current_activity}</div>
        </div>
      )}

      {/* Bio snippet */}
      {executive.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 line-clamp-2">{executive.bio}</p>
        </div>
      )}

      {/* Permissions count */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="text-gray-500">
            <span className="font-medium text-gray-400">{executive.permissions.length}</span> permissions
          </div>
          {executive.last_action_at && (
            <div className="text-gray-500">
              Last active:{' '}
              <span className="text-gray-400">
                {new Date(executive.last_action_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Interact →
        </div>
      </div>
    </div>
  );
}

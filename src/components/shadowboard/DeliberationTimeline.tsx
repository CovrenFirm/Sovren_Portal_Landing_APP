'use client';

/**
 * Deliberation Timeline Component
 *
 * ui-engineer implementation
 * Chronological view of executive AI analyses
 *
 * NO mocks. Real AI notes only.
 */

interface AIAnalysisNote {
  id: string;
  createdAt: string;
  execAgent: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
}

interface DeliberationTimelineProps {
  notes: AIAnalysisNote[];
}

export default function DeliberationTimeline({ notes }: DeliberationTimelineProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="text-center py-12">
          <div className="text-5xl mb-4 opacity-50">📋</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No AI Analysis Yet
          </h3>
          <p className="text-gray-400">
            No executive analysis has been performed for this record.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analysis will appear here once Shadow Board executives evaluate this entity.
          </p>
        </div>
      </div>
    );
  }

  const getExecutiveColor = (execAgent: string): string => {
    switch (execAgent.toUpperCase()) {
      case 'CEO':
        return 'border-indigo-500/50 bg-indigo-900/10';
      case 'CFO':
        return 'border-emerald-500/50 bg-emerald-900/10';
      case 'CTO':
        return 'border-violet-500/50 bg-violet-900/10';
      case 'CMO':
        return 'border-amber-500/50 bg-amber-900/10';
      case 'COO':
        return 'border-cyan-500/50 bg-cyan-900/10';
      default:
        return 'border-gray-500/50 bg-gray-900/10';
    }
  };

  const getExecutiveIcon = (execAgent: string): string => {
    switch (execAgent.toUpperCase()) {
      case 'CEO':
        return '👔';
      case 'CFO':
        return '💰';
      case 'CTO':
        return '⚙️';
      case 'CMO':
        return '📢';
      case 'COO':
        return '📊';
      default:
        return '👤';
    }
  };

  const formatMetadata = (metadata: Record<string, any>): Array<{ key: string; value: any }> => {
    return Object.entries(metadata)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        key: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
      }));
  };

  // Sort by date descending (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedNotes.map((note, index) => {
        const metadataEntries = formatMetadata(note.metadata);
        const borderColor = getExecutiveColor(note.execAgent);
        const icon = getExecutiveIcon(note.execAgent);

        return (
          <div
            key={note.id}
            className={`border-l-4 ${borderColor} bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-r-xl p-6`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{note.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-gray-300">
                      {note.execAgent.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600">#{index + 1}</span>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </div>
            </div>

            {/* Metadata */}
            {metadataEntries.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Key Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metadataEntries.slice(0, 6).map((entry) => (
                    <div
                      key={entry.key}
                      className="bg-gray-800/50 rounded-lg p-2"
                    >
                      <p className="text-xs text-gray-500">{entry.key}</p>
                      <p className="text-sm font-medium text-white truncate">
                        {typeof entry.value === 'number'
                          ? entry.value.toLocaleString()
                          : String(entry.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

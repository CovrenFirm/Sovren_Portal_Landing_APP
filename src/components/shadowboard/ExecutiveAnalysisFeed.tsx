'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { linkToContact, linkToDeal } from '@/lib/crosslink';

/**
 * Executive Analysis Feed
 *
 * Displays historical AI executive analysis notes from CRM backend
 * NO fake data. NO simulated analysis. Only real AI notes from database.
 */

interface AIAnalysisNote {
  id: string;
  createdAt: string;
  execAgent: string; // ceo | cfo | cto
  title: string;
  content: string;
  metadata: Record<string, any>;
  contactId?: string;
  dealId?: string;
}

interface NotesResponse {
  success: boolean;
  notes?: AIAnalysisNote[];
  error?: string;
}

interface ExecutiveAnalysisFeedProps {
  entityType?: 'contact' | 'deal';
  entityId?: string;
  selectedExecutive?: string | null;
}

export default function ExecutiveAnalysisFeed({
  entityType,
  entityId,
  selectedExecutive,
}: ExecutiveAnalysisFeedProps) {
  const [notes, setNotes] = useState<AIAnalysisNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      fetchNotes();
    }
  }, [entityType, entityId]);

  const fetchNotes = async () => {
    if (!entityType || !entityId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/shadowboard/notes?entityType=${entityType}&entityId=${entityId}`
      );
      const data: NotesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch analysis notes');
      }

      setNotes(data.notes || []);
    } catch (err) {
      console.error('[ExecutiveAnalysisFeed] Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes by selected executive if provided
  const filteredNotes = selectedExecutive
    ? notes.filter(
        (note) => note.execAgent.toLowerCase() === selectedExecutive.toLowerCase()
      )
    : notes;

  // No entity selected state
  if (!entityType || !entityId) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4 opacity-50">📋</div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">
              No Entity Selected
            </h4>
            <p className="text-sm text-gray-500">
              Select a contact or deal in the CRM to view AI executive analysis here.
              This will be wired in Phase 7.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading AI analysis...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 mb-2">Failed to load analysis</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredNotes.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4 opacity-50">🤔</div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">
              No AI Analyses Yet
            </h4>
            <p className="text-sm text-gray-500">
              {selectedExecutive
                ? `No analyses from ${selectedExecutive} for this ${entityType} yet.`
                : `No AI executive analyses for this ${entityType} yet. Analyses are created automatically when CRM events occur.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">
          Executive Analysis History
        </h3>
        <p className="text-sm text-gray-400">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'analysis' : 'analyses'}{' '}
          {selectedExecutive && `from ${selectedExecutive}`}
        </p>
      </div>

      {/* Notes List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredNotes.map((note) => (
          <AnalysisNoteCard
            key={note.id}
            note={note}
            expanded={expandedNoteId === note.id}
            onToggle={() =>
              setExpandedNoteId(expandedNoteId === note.id ? null : note.id)
            }
            showEntityLinks={!entityType || !entityId}
          />
        ))}
      </div>
    </div>
  );
}

interface AnalysisNoteCardProps {
  note: AIAnalysisNote;
  expanded: boolean;
  onToggle: () => void;
  showEntityLinks?: boolean;
}

function AnalysisNoteCard({ note, expanded, onToggle, showEntityLinks = false }: AnalysisNoteCardProps) {
  const execColors: Record<string, string> = {
    ceo: 'from-indigo-600 to-purple-600',
    cfo: 'from-emerald-600 to-teal-600',
    cto: 'from-violet-600 to-purple-600',
    cmo: 'from-pink-600 to-rose-600',
    coo: 'from-blue-600 to-cyan-600',
  };

  const execAgent = note.execAgent.toLowerCase();
  const colorClass = execColors[execAgent] || 'from-gray-600 to-gray-700';

  // Format timestamp
  const timestamp = new Date(note.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Preview snippet (first 150 chars)
  const preview = note.content.substring(0, 150);
  const hasMore = note.content.length > 150;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600">
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Executive Badge */}
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r',
                colorClass
              )}
            >
              {note.execAgent.toUpperCase()}
            </div>
            {/* Title */}
            <h4 className="text-sm font-semibold text-white">{note.title}</h4>
          </div>
          {/* Expand/Collapse Icon */}
          <div className="text-gray-400 text-sm">
            {expanded ? '▼' : '▶'}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mb-2">{timestamp}</div>

        {/* Entity Links (only show when viewing from Shadow Board) */}
        {showEntityLinks && (note.contactId || note.dealId) && (
          <div className="flex items-center gap-2 mb-2">
            {note.contactId && (
              <Link
                href={linkToContact(note.contactId)}
                className="text-xs px-2 py-1 bg-indigo-900/30 border border-indigo-700/50 rounded text-indigo-400 hover:text-indigo-300 hover:border-indigo-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Contact →
              </Link>
            )}
            {note.dealId && (
              <Link
                href={linkToDeal(note.dealId)}
                className="text-xs px-2 py-1 bg-emerald-900/30 border border-emerald-700/50 rounded text-emerald-400 hover:text-emerald-300 hover:border-emerald-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Deal →
              </Link>
            )}
          </div>
        )}

        {/* Preview (when collapsed) */}
        {!expanded && (
          <div className="text-sm text-gray-400">
            {preview}
            {hasMore && '...'}
          </div>
        )}
      </div>

      {/* Full Content (when expanded) */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <div className="mt-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </div>

          {/* Metadata (if any interesting fields) */}
          {note.metadata && Object.keys(note.metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-500 mb-2">Analysis Metadata</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(note.metadata)
                  .filter(
                    ([key]) =>
                      !key.startsWith('_') &&
                      key !== 'exec_agent' &&
                      key !== 'execAgent'
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-900/50 rounded px-2 py-1"
                    >
                      <div className="text-xs text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-300 font-mono">
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

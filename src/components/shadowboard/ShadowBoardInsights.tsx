'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  formatScoreLabel,
  formatRiskLevel,
  formatComplexity,
  formatCurrency,
  formatTimeline,
  formatDate,
  formatExecAgent,
  linkToShadowBoard,
} from '@/lib/crosslink';

/**
 * Shadow Board Insights Component
 *
 * Displays executive intelligence for a contact or deal
 * - Executive scores (CEO/CFO/CTO)
 * - Recent AI analysis notes
 *
 * NO mocks. NO fake data. Only real backend intelligence.
 */

interface ExecutiveScores {
  ceo_fit_score?: number;
  ceo_qualified_at?: string;
  cfo_revenue_potential?: number;
  cfo_ltv_estimate?: number;
  cfo_risk_level?: string;
  cto_technical_fit?: number;
  cto_complexity?: string;
  cto_timeline_estimate?: string;
}

interface AINote {
  id: string;
  createdAt: string;
  execAgent: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
}

interface ShadowBoardInsightsProps {
  entityType: 'contact' | 'deal';
  entityId: string;
}

export default function ShadowBoardInsights({
  entityType,
  entityId,
}: ShadowBoardInsightsProps) {
  const [scores, setScores] = useState<ExecutiveScores | null>(null);
  const [notes, setNotes] = useState<AINote[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
    fetchNotes();
  }, [entityType, entityId]);

  const fetchScores = async () => {
    try {
      setLoadingScores(true);
      const response = await fetch(
        `/api/shadowboard/scores?entityType=${entityType}&entityId=${entityId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch scores');
      }

      setScores(data.scores);
    } catch (err) {
      console.error('[ShadowBoardInsights] Error fetching scores:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingScores(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await fetch(
        `/api/shadowboard/notes?entityType=${entityType}&entityId=${entityId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch notes');
      }

      setNotes(data.notes || []);
    } catch (err) {
      console.error('[ShadowBoardInsights] Error fetching notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const hasScores =
    scores &&
    (scores.ceo_fit_score !== undefined ||
      scores.cfo_revenue_potential !== undefined ||
      scores.cto_technical_fit !== undefined);

  return (
    <div className="space-y-6">
      {/* Header with link to Shadow Board */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Shadow Board Intelligence</h3>
        <Link
          href={linkToShadowBoard()}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View Full Shadow Board →
        </Link>
      </div>

      {/* Executive Scores */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Executive Scores
        </h4>

        {loadingScores ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-center">Loading scores...</div>
          </div>
        ) : error ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-red-400 text-center text-sm">{error}</div>
          </div>
        ) : !hasScores ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-2 opacity-50">🤖</div>
              <div className="text-gray-400">No executive analysis yet</div>
              <div className="text-sm text-gray-500 mt-1">
                Shadow Board AI will analyze this {entityType} automatically when triggered
                by CRM events
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CEO Score */}
            {scores.ceo_fit_score !== undefined && (
              <ScoreCard
                title="CEO Strategic Fit"
                score={scores.ceo_fit_score}
                subtitle={
                  scores.ceo_qualified_at
                    ? `Qualified: ${formatDate(scores.ceo_qualified_at)}`
                    : undefined
                }
                color="indigo"
              />
            )}

            {/* CFO Score */}
            {(scores.cfo_revenue_potential !== undefined ||
              scores.cfo_ltv_estimate !== undefined) && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  CFO Financial Analysis
                </div>
                {scores.cfo_revenue_potential !== undefined && (
                  <div className="mb-2">
                    <div className="text-sm text-gray-400">Revenue Potential</div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatCurrency(scores.cfo_revenue_potential)}
                    </div>
                  </div>
                )}
                {scores.cfo_ltv_estimate !== undefined && (
                  <div className="mb-2">
                    <div className="text-sm text-gray-400">LTV Estimate</div>
                    <div className="text-lg font-semibold text-emerald-300">
                      {formatCurrency(scores.cfo_ltv_estimate)}
                    </div>
                  </div>
                )}
                {scores.cfo_risk_level && (
                  <div className="mt-2">
                    <RiskBadge risk={scores.cfo_risk_level} />
                  </div>
                )}
              </div>
            )}

            {/* CTO Score */}
            {scores.cto_technical_fit !== undefined && (
              <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  CTO Technical Analysis
                </div>
                <div className="mb-2">
                  <div className="text-sm text-gray-400">Technical Fit</div>
                  <div className="text-xl font-bold text-violet-400">
                    {scores.cto_technical_fit}/100
                  </div>
                </div>
                {scores.cto_complexity && (
                  <div className="mb-2">
                    <ComplexityBadge complexity={scores.cto_complexity} />
                  </div>
                )}
                {scores.cto_timeline_estimate && (
                  <div className="text-sm text-gray-400">
                    Timeline: <span className="text-white">{formatTimeline(scores.cto_timeline_estimate)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Analysis Notes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Executive Analysis History
        </h4>

        {loadingNotes ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-center">Loading analysis notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-2 opacity-50">📝</div>
              <div className="text-gray-400">No analysis notes yet</div>
              <div className="text-sm text-gray-500 mt-1">
                Executive analysis notes will appear here once generated
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  subtitle?: string;
  color: 'indigo' | 'emerald' | 'violet';
}

function ScoreCard({ title, score, subtitle, color }: ScoreCardProps) {
  const scoreInfo = formatScoreLabel(score);

  const colorClasses = {
    indigo: 'from-indigo-900/20 to-purple-900/20 border-indigo-800/50',
    emerald: 'from-emerald-900/20 to-teal-900/20 border-emerald-800/50',
    violet: 'from-violet-900/20 to-purple-900/20 border-violet-800/50',
  };

  const scoreColors = {
    green: 'text-emerald-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    gray: 'text-gray-400',
  };

  return (
    <div className={cn('bg-gradient-to-br border rounded-lg p-4', colorClasses[color])}>
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{title}</div>
      <div className={cn('text-2xl font-bold', scoreColors[scoreInfo.color])}>
        {score}/100
      </div>
      <div className="text-sm text-gray-400 mt-1">{scoreInfo.label.split(' - ')[1]}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const riskInfo = formatRiskLevel(risk);

  const colorClasses = {
    green: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    yellow: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    red: 'bg-red-900/30 border-red-700 text-red-400',
    gray: 'bg-gray-800/30 border-gray-700 text-gray-400',
  };

  return (
    <div className={cn('inline-flex px-2 py-1 rounded text-xs font-semibold border', colorClasses[riskInfo.color])}>
      {riskInfo.label}
    </div>
  );
}

function ComplexityBadge({ complexity }: { complexity: string }) {
  const complexityInfo = formatComplexity(complexity);

  const colorClasses = {
    green: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    yellow: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    red: 'bg-red-900/30 border-red-700 text-red-400',
    gray: 'bg-gray-800/30 border-gray-700 text-gray-400',
  };

  return (
    <div className={cn('inline-flex px-2 py-1 rounded text-xs font-semibold border', colorClasses[complexityInfo.color])}>
      {complexityInfo.label}
    </div>
  );
}

function NoteCard({ note }: { note: AINote }) {
  const [expanded, setExpanded] = useState(false);

  const preview = note.content.substring(0, 150);
  const hasMore = note.content.length > 150;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded text-xs font-semibold bg-indigo-900/30 border border-indigo-700 text-indigo-400">
            {formatExecAgent(note.execAgent)}
          </div>
          <div className="text-sm font-semibold text-white">{note.title}</div>
        </div>
        <div className="text-xs text-gray-500">{formatDate(note.createdAt)}</div>
      </div>

      <div className="text-sm text-gray-300 whitespace-pre-wrap">
        {expanded ? note.content : preview}
        {hasMore && !expanded && '...'}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

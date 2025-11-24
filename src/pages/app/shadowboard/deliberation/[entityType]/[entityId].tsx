import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import ExecutiveCard from '@/components/shadowboard/ExecutiveCard';
import DeliberationTimeline from '@/components/shadowboard/DeliberationTimeline';

/**
 * Executive Deep-Deliberation Viewer
 *
 * frontend-integration implementation
 * Unified view of all executive AI analyses for a CRM entity
 *
 * NO mocks. Real AI analysis data only.
 */

interface AIAnalysisNote {
  id: string;
  createdAt: string;
  execAgent: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
}

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

interface EntityData {
  id: string;
  name: string;
  type: 'contact' | 'deal';
}

export default function DeepDeliberationPage() {
  const router = useRouter();
  const { entityType, entityId } = router.query;

  const [entity, setEntity] = useState<EntityData | null>(null);
  const [notes, setNotes] = useState<AIAnalysisNote[]>([]);
  const [scores, setScores] = useState<ExecutiveScores>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entityType && entityId) {
      loadDeliberationData();
    }
  }, [entityType, entityId]);

  const loadDeliberationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate entity type
      if (entityType !== 'contact' && entityType !== 'deal') {
        throw new Error('Invalid entity type');
      }

      // Load entity data, notes, and scores in parallel
      const [entityRes, notesRes, scoresRes] = await Promise.all([
        fetch(`/api/crm/${entityType}s?id=${entityId}`),
        fetch(`/api/shadowboard/notes?entityType=${entityType}&entityId=${entityId}`),
        fetch(`/api/shadowboard/scores?entityType=${entityType}&entityId=${entityId}`),
      ]);

      // Entity data
      if (entityRes.ok) {
        const entityData = await entityRes.json();
        const rawEntity = entityData.data || entityData;
        setEntity({
          id: rawEntity.id || rawEntity.contact_id || rawEntity.deal_id || entityId as string,
          name: rawEntity.name || rawEntity.full_name || rawEntity.title || 'Unknown',
          type: entityType as 'contact' | 'deal',
        });
      }

      // AI Analysis Notes
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        if (notesData.success && notesData.notes) {
          setNotes(notesData.notes);
        }
      }

      // Executive Scores
      if (scoresRes.ok) {
        const scoresData = await scoresRes.json();
        if (scoresData.success && scoresData.scores) {
          setScores(scoresData.scores);
        }
      }
    } catch (err) {
      console.error('[DeepDeliberation] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deliberation data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading deliberation...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error || !entity) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Link
            href="/app/shadowboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Shadow Board
          </Link>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load deliberation</p>
            <p className="text-gray-400">{error || 'Entity not found'}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const crmLink = entity.type === 'contact'
    ? `/app/crm/contacts/${entity.id}`
    : `/app/crm/deals/${entity.id}`;

  // Find last analysis timestamp per executive
  const getLastAnalysis = (exec: string): string | undefined => {
    const execNotes = notes.filter(
      (n) => n.execAgent.toUpperCase() === exec.toUpperCase()
    );
    if (execNotes.length === 0) return undefined;
    return execNotes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0].createdAt;
  };

  return (
    <>
      <Head>
        <title>Deep Deliberation - {entity.name} - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/app/shadowboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Shadow Board
              </Link>
            </div>
            <Link
              href={crmLink}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              View in CRM →
            </Link>
          </div>

          {/* Title Bar */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{entity.type === 'contact' ? '👤' : '💼'}</div>
              <div>
                <h1 className="text-3xl font-bold text-white">{entity.name}</h1>
                <p className="text-lg text-gray-300">
                  Executive Deep Deliberation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-violet-900/30 border border-violet-700/50 rounded-full text-sm text-violet-400 font-medium capitalize">
                {entity.type}
              </span>
              <span className="text-sm text-gray-400">
                {notes.length} {notes.length === 1 ? 'analysis' : 'analyses'}
              </span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Executive Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Executive Summary</h2>
              <ExecutiveCard
                executive="CEO"
                scores={scores}
                lastAnalysis={getLastAnalysis('CEO')}
              />
              <ExecutiveCard
                executive="CFO"
                scores={scores}
                lastAnalysis={getLastAnalysis('CFO')}
              />
              <ExecutiveCard
                executive="CTO"
                scores={scores}
                lastAnalysis={getLastAnalysis('CTO')}
              />
            </div>

            {/* Right Column: Deliberation Timeline */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">
                Analysis Timeline
              </h2>
              <DeliberationTimeline notes={notes} />
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

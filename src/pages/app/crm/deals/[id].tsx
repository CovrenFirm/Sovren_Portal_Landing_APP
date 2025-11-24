import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getDealById, CRMDeal } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import ShadowBoardInsights from '@/components/shadowboard/ShadowBoardInsights';
import FileIntakePanel from '@/components/multimodal/FileIntakePanel';
import AttachmentList from '@/components/multimodal/AttachmentList';

export default function DealDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { tokens } = useAuth();
  const [deal, setDeal] = useState<CRMDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshAttachments, setRefreshAttachments] = useState(0);

  useEffect(() => {
    async function loadDeal() {
      if (!id || typeof id !== 'string' || !tokens?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDealById(id, tokens.access_token);
        setDeal(data);
      } catch (err) {
        console.error('Failed to load deal:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    }

    loadDeal();
  }, [id, tokens]);

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading deal...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error || !deal) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/app/crm/deals" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Deals
            </Link>
          </div>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load deal</p>
            <p className="text-gray-400">{error || 'Deal not found'}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{deal.name} - Deals - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/app/crm/deals" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Deals
            </Link>
          </div>
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{deal.name}</h1>
            {deal.company_name && <p className="text-lg text-gray-300">{deal.company_name}</p>}
            <div className="mt-3 flex items-center space-x-4">
              <span className="px-3 py-1 bg-indigo-900/30 border border-indigo-700/50 rounded-full text-sm text-indigo-400 font-medium">
                {deal.stage}
              </span>
              {deal.amount && (
                <span className="text-2xl font-bold text-green-400">
                  ${Number(deal.amount).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Deal Information</h2>
              <div className="space-y-3">
                {deal.contact_name && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Primary Contact</span>
                    <span className="text-white">{deal.contact_name}</span>
                  </div>
                )}
                {deal.company_name && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Company</span>
                    <span className="text-white">{deal.company_name}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Stage</span>
                  <span className="text-white">{deal.stage}</span>
                </div>
                {deal.amount && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Deal Value</span>
                    <span className="text-green-400 font-semibold">${Number(deal.amount).toLocaleString()}</span>
                  </div>
                )}
                {deal.probability !== null && deal.probability !== undefined && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Win Probability</span>
                    <span className="text-white">{deal.probability}%</span>
                  </div>
                )}
                {deal.close_date && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Expected Close Date</span>
                    <span className="text-white">{new Date(deal.close_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Deal ID</div>
                  <div className="text-gray-300 font-mono text-xs">{deal.deal_id}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="text-gray-300">{new Date(deal.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Last Updated</div>
                  <div className="text-gray-300">{new Date(deal.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Board Intelligence */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Shadow Board Intelligence</h2>
              <Link
                href={`/app/shadowboard/deliberation/deal/${deal.deal_id}`}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Deep Deliberation →
              </Link>
            </div>
            <ShadowBoardInsights entityType="deal" entityId={deal.deal_id} />
          </div>

          {/* Files & Artifacts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Files & Artifacts</h2>
            <FileIntakePanel
              entityType="deal"
              entityId={deal.deal_id}
              onUploadComplete={() => setRefreshAttachments(prev => prev + 1)}
            />
            <AttachmentList
              entityType="deal"
              entityId={deal.deal_id}
              refreshTrigger={refreshAttachments}
            />
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};

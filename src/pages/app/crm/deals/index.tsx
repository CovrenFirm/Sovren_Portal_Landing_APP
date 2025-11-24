import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getDeals, CRMDeal } from '@/lib/crmApi';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export default function DealsPage() {
  const { tokens } = useAuth();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadDeals() {
      if (!tokens?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDeals(tokens.access_token);
        setDeals(data);
      } catch (err) {
        console.error('Failed to load deals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deals');
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, [tokens]);

  const filteredDeals = deals.filter((deal) => {
    const query = searchQuery.toLowerCase();
    return (
      deal.name.toLowerCase().includes(query) ||
      deal.company_name?.toLowerCase().includes(query) ||
      deal.stage.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Head>
        <title>Deals - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Deals</h1>
              <p className="mt-2 text-gray-400">Track your sales pipeline and opportunities</p>
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search deals by name, company, or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</div>
            </div>
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">Failed to load deals: {error}</p>
            </div>
          )}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading deals...</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">{searchQuery ? 'No deals match your search' : 'No deals found'}</p>
                <p className="text-sm">{searchQuery ? 'Try adjusting your search query' : 'Deals will appear here once added to the CRM'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Close Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredDeals.map((deal) => (
                      <tr key={deal.deal_id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/app/crm/deals/${deal.deal_id}`} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            {deal.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deal.company_name || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStageColor(deal.stage))}>
                            {deal.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {deal.amount ? (
                            <span className="text-green-400 font-medium">${Number(deal.amount).toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {!loading && filteredDeals.length > 0 && (
            <div className="text-sm text-gray-400 text-center">
              Showing {filteredDeals.length} of {deals.length} deals
            </div>
          )}
        </div>
      </PortalLayout>
    </>
  );
}

function getStageColor(stage: string): string {
  const stageColors: Record<string, string> = {
    prospecting: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    qualification: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/50',
    proposal: 'bg-purple-900/30 text-purple-400 border border-purple-700/50',
    negotiation: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50',
    closed_won: 'bg-green-900/30 text-green-400 border border-green-700/50',
    closed_lost: 'bg-red-900/30 text-red-400 border border-red-700/50',
  };
  return stageColors[stage.toLowerCase()] || stageColors.prospecting;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};

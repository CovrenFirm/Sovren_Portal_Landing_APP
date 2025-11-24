import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import KpiCard from '@/components/analytics/KpiCard';
import StageFunnelChart from '@/components/analytics/StageFunnelChart';
import ShadowBoardImpactChart from '@/components/analytics/ShadowBoardImpactChart';
import SystemHealthSummary from '@/components/analytics/SystemHealthSummary';

/**
 * Sovren Analytics Command View
 *
 * ui-engineer + frontend-integration implementation
 * Real-time analytics dashboard with NO mocks
 *
 * Production-grade only.
 */

interface CRMSummary {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  dealsWon: number;
  dealsLost: number;
  dealsActive: number;
  dealsByStage: { stage: string; count: number; totalValue: number }[];
  totalRevenue: number;
  forecastRevenue: number;
}

interface ShadowBoardMetrics {
  totalAnalyses: number;
  avgAnalysisTimeMs: number;
  recommendationsAccepted: number;
  recommendationsRejected: number;
  topExecutive: {
    name: string;
    analysisCount: number;
    successRate: number;
  };
  analysesByType: {
    [key: string]: number;
  };
  impactMetrics: {
    dealsInfluenced: number;
    revenueImpact: number;
  };
}

interface SystemMetrics {
  available: boolean;
  crmHealthy: boolean;
  shadowBoardHealthy: boolean;
  avgResponseTimeMs?: number;
  errorRate?: number;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [crmSummary, setCrmSummary] = useState<CRMSummary | null>(null);
  const [shadowBoardMetrics, setShadowBoardMetrics] = useState<ShadowBoardMetrics | null>(
    null
  );
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all analytics in parallel
      const [crmRes, shadowRes, systemRes] = await Promise.all([
        fetch('/api/analytics/crm-summary'),
        fetch('/api/analytics/shadowboard'),
        fetch('/api/analytics/system-metrics'),
      ]);

      // CRM Summary
      if (crmRes.ok) {
        const crmData = await crmRes.json();
        if (crmData.success && crmData.data) {
          setCrmSummary(crmData.data);
        }
      }

      // Shadow Board Metrics
      if (shadowRes.ok) {
        const shadowData = await shadowRes.json();
        if (shadowData.success && shadowData.data) {
          setShadowBoardMetrics(shadowData.data);
        }
      }

      // System Metrics
      if (systemRes.ok) {
        const systemData = await systemRes.json();
        if (systemData.success && systemData.data) {
          setSystemMetrics(systemData.data);
        }
      }
    } catch (err) {
      console.error('[Analytics] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Analytics Command View</h1>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load analytics</p>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Analytics Command View
              </h1>
              <p className="text-gray-400">
                Real-time insights from CRM, Shadow Board, and system metrics
              </p>
            </div>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {/* KPI Strip */}
          {crmSummary && shadowBoardMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard
                title="Total Contacts"
                value={crmSummary.totalContacts}
                icon="👥"
                variant="info"
              />
              <KpiCard
                title="Total Deals"
                value={crmSummary.totalDeals}
                icon="💼"
                variant="default"
              />
              <KpiCard
                title="Deals Won"
                value={crmSummary.dealsWon}
                icon="✓"
                variant="success"
              />
              <KpiCard
                title="Shadow Board Analyses"
                value={shadowBoardMetrics.totalAnalyses}
                icon="🎯"
                variant="info"
              />
              <KpiCard
                title="Revenue Impact"
                value={formatCurrency(shadowBoardMetrics.impactMetrics.revenueImpact)}
                icon="💰"
                variant="success"
              />
            </div>
          )}

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CRM Funnel Panel */}
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">CRM Pipeline Funnel</h2>
              {crmSummary && crmSummary.dealsByStage.length > 0 ? (
                <>
                  <StageFunnelChart stages={crmSummary.dealsByStage} />
                  <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Closed Revenue</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {formatCurrency(crmSummary.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Forecast Revenue</p>
                      <p className="text-lg font-bold text-indigo-400">
                        {formatCurrency(crmSummary.forecastRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active Deals</p>
                      <p className="text-lg font-bold text-white">{crmSummary.dealsActive}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 opacity-50">📊</div>
                  <p className="text-gray-400">No funnel data available</p>
                </div>
              )}
            </div>

            {/* System Health Panel */}
            <div>
              {systemMetrics ? (
                <SystemHealthSummary metrics={systemMetrics} />
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3 opacity-50">⚙️</div>
                    <p className="text-gray-400">System metrics unavailable</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shadow Board Performance Panel */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Shadow Board Performance
            </h2>
            {shadowBoardMetrics ? (
              <ShadowBoardImpactChart metrics={shadowBoardMetrics} />
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">🎯</div>
                <p className="text-gray-400">Shadow Board metrics unavailable</p>
              </div>
            )}
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};

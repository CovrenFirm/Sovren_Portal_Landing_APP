import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';

/**
 * Scenario Simulation Shell
 *
 * ui-engineer + sec-architect implementation
 * UI for configuring what-if scenarios
 *
 * CRITICAL: NO fake execution. Only runs if real backend endpoints exist.
 * If backend unavailable, UI shows "Not available yet" with disabled actions.
 */

interface ScenarioConfig {
  entityType: 'contact' | 'deal' | 'none';
  entityId?: string;
  marketChange: string;
  budgetShift: string;
  riskTolerance: number;
  timelinePressure: number;
}

interface Contact {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  name: string;
}

export default function ScenariosPage() {
  const [config, setConfig] = useState<ScenarioConfig>({
    entityType: 'none',
    marketChange: 'neutral',
    budgetShift: 'stable',
    riskTolerance: 50,
    timelinePressure: 50,
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend availability flag
  const SCENARIO_BACKEND_AVAILABLE = false; // Set to true when backend endpoints exist

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      // Load contacts and deals for entity selector
      const [contactsRes, dealsRes] = await Promise.all([
        fetch('/api/crm/contacts'),
        fetch('/api/crm/deals'),
      ]);

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        const rawContacts = contactsData.data?.data || contactsData.data || [];
        setContacts(
          rawContacts.slice(0, 20).map((c: any) => ({
            id: c.id || c.contact_id,
            name: c.name || c.full_name || 'Unknown Contact',
          }))
        );
      }

      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        const rawDeals = dealsData.data?.data || dealsData.data || [];
        setDeals(
          rawDeals.slice(0, 20).map((d: any) => ({
            id: d.id || d.deal_id,
            name: d.name || d.title || 'Unknown Deal',
          }))
        );
      }
    } catch (err) {
      console.error('[Scenarios] Error loading entities:', err);
    }
  };

  const handleRunScenario = async () => {
    if (!SCENARIO_BACKEND_AVAILABLE) {
      // This should never be called due to disabled button, but double-check
      setError('Scenario simulation backend is not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // POST to scenario execution endpoint (only if backend exists)
      const response = await fetch('/api/shadowboard/scenario/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Scenario execution failed: ${response.status}`);
      }

      const result = await response.json();

      // Display real results (implementation depends on backend response structure)
      alert('Scenario executed successfully. Results: ' + JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[Scenarios] Execution error:', err);
      setError(err instanceof Error ? err.message : 'Scenario execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Scenario Simulation - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Scenario Simulation
              </h1>
              <p className="text-gray-400">
                Configure and run what-if scenarios for strategic planning
              </p>
            </div>
            <Link
              href="/app/shadowboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
          </div>

          {/* Backend Availability Warning */}
          {!SCENARIO_BACKEND_AVAILABLE && (
            <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">
                    Simulation Engine Not Available
                  </h3>
                  <p className="text-gray-300">
                    The scenario simulation engine is not yet available for this environment.
                    This UI is prepared to connect once the backend endpoints are live.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    You can configure scenarios below, but execution is currently disabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Builder Form */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Scenario Configuration</h2>

            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Entity Type
              </label>
              <select
                value={config.entityType}
                onChange={(e) =>
                  setConfig({ ...config, entityType: e.target.value as any, entityId: undefined })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={!SCENARIO_BACKEND_AVAILABLE}
              >
                <option value="none">Abstract Scenario</option>
                <option value="contact">Contact-Specific</option>
                <option value="deal">Deal-Specific</option>
              </select>
            </div>

            {/* Entity Selector */}
            {config.entityType === 'contact' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Contact
                </label>
                <select
                  value={config.entityId || ''}
                  onChange={(e) => setConfig({ ...config, entityId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={!SCENARIO_BACKEND_AVAILABLE}
                >
                  <option value="">Select a contact...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {config.entityType === 'deal' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Deal
                </label>
                <select
                  value={config.entityId || ''}
                  onChange={(e) => setConfig({ ...config, entityId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={!SCENARIO_BACKEND_AVAILABLE}
                >
                  <option value="">Select a deal...</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Market Change */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Market Conditions
              </label>
              <select
                value={config.marketChange}
                onChange={(e) => setConfig({ ...config, marketChange: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={!SCENARIO_BACKEND_AVAILABLE}
              >
                <option value="boom">Market Boom (+30% growth)</option>
                <option value="growth">Steady Growth (+10%)</option>
                <option value="neutral">Neutral (0%)</option>
                <option value="slowdown">Slowdown (-10%)</option>
                <option value="recession">Recession (-30%)</option>
              </select>
            </div>

            {/* Budget Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget Shift
              </label>
              <select
                value={config.budgetShift}
                onChange={(e) => setConfig({ ...config, budgetShift: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={!SCENARIO_BACKEND_AVAILABLE}
              >
                <option value="increase-high">High Increase (+50%)</option>
                <option value="increase-moderate">Moderate Increase (+25%)</option>
                <option value="stable">Stable (0%)</option>
                <option value="decrease-moderate">Moderate Decrease (-25%)</option>
                <option value="decrease-high">High Decrease (-50%)</option>
              </select>
            </div>

            {/* Risk Tolerance */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risk Tolerance: {config.riskTolerance}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.riskTolerance}
                onChange={(e) =>
                  setConfig({ ...config, riskTolerance: Number(e.target.value) })
                }
                className="w-full accent-violet-500"
                disabled={!SCENARIO_BACKEND_AVAILABLE}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            {/* Timeline Pressure */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeline Pressure: {config.timelinePressure}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.timelinePressure}
                onChange={(e) =>
                  setConfig({ ...config, timelinePressure: Number(e.target.value) })
                }
                className="w-full accent-violet-500"
                disabled={!SCENARIO_BACKEND_AVAILABLE}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Relaxed</span>
                <span>Urgent</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRunScenario}
                disabled={!SCENARIO_BACKEND_AVAILABLE || loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  SCENARIO_BACKEND_AVAILABLE && !loading
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Running Scenario...' : 'Run Scenario'}
              </button>
              <button
                onClick={() =>
                  setConfig({
                    entityType: 'none',
                    marketChange: 'neutral',
                    budgetShift: 'stable',
                    riskTolerance: 50,
                    timelinePressure: 50,
                  })
                }
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Reset
              </button>
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

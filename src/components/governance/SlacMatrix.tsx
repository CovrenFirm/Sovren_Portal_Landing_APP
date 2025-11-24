'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * SLAC Matrix Visualization Component
 *
 * Displays the Sovren LLM Authorization Control (SLAC) matrix
 * - Rows: AI Executive roles (CEO, CFO, CTO, etc.)
 * - Columns: Actions (update_lifecycle_stage, approve_discount, etc.)
 * - Cells: Authorization levels (Autonomous, Requires Approval, Forbidden)
 *
 * Color coding:
 * - Green: Autonomous
 * - Yellow: Requires Approval
 * - Red: Forbidden
 *
 * NO mocks. Real backend data only.
 */

interface SLACRule {
  role: string;
  action: string;
  authorization: 'autonomous' | 'requires_approval' | 'forbidden';
  conditions?: Record<string, any>;
}

interface SLACMatrix {
  version: string;
  rules: SLACRule[];
  roles: string[];
  actions: string[];
}

export default function SlacMatrix() {
  const [matrix, setMatrix] = useState<SLACMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/governance/slac');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch SLAC matrix');
      }

      setMatrix(data.matrix);
    } catch (err) {
      console.error('[SlacMatrix] Error fetching matrix:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getAuthorization = (role: string, action: string): SLACRule['authorization'] | null => {
    if (!matrix) return null;

    const rule = matrix.rules.find(
      (r) => r.role === role && r.action === action
    );

    return rule?.authorization || null;
  };

  const getAuthColor = (auth: SLACRule['authorization'] | null): string => {
    if (!auth) return 'bg-gray-800 text-gray-500';

    switch (auth) {
      case 'autonomous':
        return 'bg-emerald-900/30 border-emerald-700 text-emerald-400';
      case 'requires_approval':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
      case 'forbidden':
        return 'bg-red-900/30 border-red-700 text-red-400';
      default:
        return 'bg-gray-800 text-gray-500';
    }
  };

  const getAuthLabel = (auth: SLACRule['authorization'] | null): string => {
    if (!auth) return 'N/A';

    switch (auth) {
      case 'autonomous':
        return 'Autonomous';
      case 'requires_approval':
        return 'Approval';
      case 'forbidden':
        return 'Forbidden';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Authorization Matrix...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !matrix) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-50">⚠️</div>
          <p className="text-red-400 text-lg mb-2">Failed to load SLAC Matrix</p>
          <p className="text-gray-400">{error || 'Unknown error'}</p>
          <button
            onClick={fetchMatrix}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">SLAC Authorization Matrix</h2>
        <p className="text-sm text-gray-400">
          Version {matrix.version} • {matrix.roles.length} Roles • {matrix.actions.length} Actions
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-900/30 border border-emerald-700"></div>
          <span className="text-gray-400">Autonomous</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-700"></div>
          <span className="text-gray-400">Requires Approval</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-900/30 border border-red-700"></div>
          <span className="text-gray-400">Forbidden</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-900 border border-gray-800 p-3 text-left">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Role / Action
                </span>
              </th>
              {matrix.actions.map((action) => (
                <th key={action} className="border border-gray-800 p-3 min-w-[120px]">
                  <span className="text-xs text-gray-400 font-mono">{action}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.roles.map((role) => (
              <tr key={role}>
                <td className="sticky left-0 z-10 bg-gray-900 border border-gray-800 p-3">
                  <span className="text-sm font-semibold text-white">{role.toUpperCase()}</span>
                </td>
                {matrix.actions.map((action) => {
                  const auth = getAuthorization(role, action);
                  return (
                    <td key={`${role}-${action}`} className="border border-gray-800 p-2">
                      <div
                        className={cn(
                          'text-center py-2 px-3 rounded border text-xs font-semibold',
                          getAuthColor(auth)
                        )}
                      >
                        {getAuthLabel(auth)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Seal History Table Component
 *
 * Displays last 100 audit log entries from governance backend
 * Columns: Timestamp, Action, Executive Agent, Table, Record ID, Seal Hash, Verification Status
 *
 * NO mocks. Real backend data only.
 */

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  execAgent: string;
  table: string;
  recordId: string;
  sealHash: string;
  verified: boolean;
  autonomous: boolean;
  metadata?: Record<string, any>;
}

export default function SealHistoryTable() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/governance/logs?limit=${limit}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }

      setLogs(data.logs);
    } catch (err) {
      console.error('[SealHistoryTable] Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading audit history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-50">⚠️</div>
          <p className="text-red-400 text-lg mb-2">Failed to load audit logs</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchLogs}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Audit History</h2>
          <p className="text-sm text-gray-400">
            {logs.length} most recent cryptographic audit entries
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4 opacity-50">📋</div>
          <p className="text-gray-400">No audit entries found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900">
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Timestamp
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Action
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Agent
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Table
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Record ID
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Seal Hash
                  </span>
                </th>
                <th className="border border-gray-800 p-3 text-left">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Status
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="border border-gray-800 p-3">
                    <span className="text-sm text-gray-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <span className="text-sm text-white font-medium">{log.action}</span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <span className="text-sm text-white font-semibold">
                      {log.execAgent.toUpperCase()}
                    </span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <span className="text-sm text-gray-300 font-mono">{log.table}</span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[150px] inline-block">
                      {log.recordId}
                    </span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[200px] inline-block">
                      {log.sealHash}
                    </span>
                  </td>
                  <td className="border border-gray-800 p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        log.verified ? 'bg-emerald-500' : 'bg-red-500'
                      )}></div>
                      <span className={cn(
                        'text-xs font-semibold',
                        log.verified ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {log.verified ? 'Verified' : 'Invalid'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

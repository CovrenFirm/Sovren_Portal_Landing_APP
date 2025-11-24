'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Seal Verification Form Component
 *
 * Allows users to verify cryptographic seals by hash
 * Displays full seal metadata on successful verification
 *
 * NO mocks. Real backend verification only.
 */

interface SealVerification {
  hash: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  execAgent: string;
  autonomous: boolean;
  timestamp: string;
  verified: boolean;
  recordId?: string;
  metadata?: Record<string, any>;
}

export default function SealVerificationForm() {
  const [sealHash, setSealHash] = useState('');
  const [verification, setVerification] = useState<SealVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sealHash.trim()) {
      setError('Please enter a seal hash');
      return;
    }

    // Validate hash format (SHA-256 is 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(sealHash.trim())) {
      setError('Invalid seal hash format (expected 64-character hex string)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setVerification(null);

      const response = await fetch(`/api/governance/seals?sealHash=${sealHash.trim()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify seal');
      }

      setVerification(data.seal);
    } catch (err) {
      console.error('[SealVerificationForm] Error verifying seal:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Seal Verification</h2>
        <p className="text-sm text-gray-400">
          Verify cryptographic integrity of AI executive actions
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sealHash" className="block text-sm font-medium text-gray-300 mb-2">
            Seal Hash (SHA-256)
          </label>
          <input
            type="text"
            id="sealHash"
            value={sealHash}
            onChange={(e) => setSealHash(e.target.value)}
            placeholder="Enter 64-character hex seal hash..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify Seal'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Verification Result */}
      {verification && (
        <div className={cn(
          'border rounded-lg p-6 space-y-4',
          verification.verified
            ? 'bg-emerald-900/20 border-emerald-500/50'
            : 'bg-red-900/20 border-red-500/50'
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Verification Result</h3>
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold',
              verification.verified
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            )}>
              {verification.verified ? '✓ VERIFIED' : '✗ INVALID'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Table</div>
              <div className="text-white font-mono">{verification.table}</div>
            </div>

            <div>
              <div className="text-gray-500 mb-1">Operation</div>
              <div className="text-white font-semibold">{verification.operation}</div>
            </div>

            <div>
              <div className="text-gray-500 mb-1">Executive Agent</div>
              <div className="text-white font-semibold">{verification.execAgent.toUpperCase()}</div>
            </div>

            <div>
              <div className="text-gray-500 mb-1">Authorization</div>
              <div className={cn(
                'inline-flex px-2 py-1 rounded text-xs font-semibold',
                verification.autonomous
                  ? 'bg-emerald-600 text-white'
                  : 'bg-yellow-600 text-white'
              )}>
                {verification.autonomous ? 'Autonomous' : 'Required Approval'}
              </div>
            </div>

            <div>
              <div className="text-gray-500 mb-1">Timestamp</div>
              <div className="text-white">
                {new Date(verification.timestamp).toLocaleString()}
              </div>
            </div>

            {verification.recordId && (
              <div>
                <div className="text-gray-500 mb-1">Record ID</div>
                <div className="text-white font-mono text-xs truncate">
                  {verification.recordId}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-gray-500 mb-1 text-sm">Seal Hash</div>
            <div className="text-white font-mono text-xs bg-gray-800 p-3 rounded break-all">
              {verification.hash}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

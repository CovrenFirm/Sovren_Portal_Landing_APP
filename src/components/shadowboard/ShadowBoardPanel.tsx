'use client';

import { useSceneStore } from '@/state/sceneStore';
import ExecutiveGrid from './ExecutiveGrid';
import ShadowBoardMetricsPanel from './ShadowBoardMetricsPanel';
import ExecutiveAnalysisFeed from './ExecutiveAnalysisFeed';

/**
 * ShadowBoardPanel - Main Shadow Board UI Assembly
 *
 * Phase 6C: Real Shadow Board intelligence console
 * - Static executive grid (21 executives)
 * - Scene store integration for 3D sync
 * - Shadow Board metrics (real data from backend)
 * - Executive analysis feed (historical AI notes)
 *
 * NO mock data
 * NO fake behavior
 * NO placeholder logic
 */
export default function ShadowBoardPanel() {
  const { selectedExecutive } = useSceneStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/50 rounded-xl p-6">
        <h1 className="text-4xl font-bold text-white mb-2">THE SOVREN SHADOW BOARD</h1>
        <p className="text-gray-300 text-lg">
          Your AI-powered executive intelligence network. Real-time metrics and historical
          analysis from your Shadow Board AI executives.
        </p>
        {selectedExecutive && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-lg">
            <span className="text-sm text-gray-400">Currently Selected:</span>
            <span className="text-lg font-semibold text-indigo-400">{selectedExecutive}</span>
          </div>
        )}
      </div>

      {/* Shadow Board Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Intelligence Metrics</h2>
        <ShadowBoardMetricsPanel />
      </div>

      {/* Executive Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Executive Selection</h2>
        <ExecutiveGrid />
      </div>

      {/* Executive Analysis Feed */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Analysis History</h2>
        <ExecutiveAnalysisFeed selectedExecutive={selectedExecutive} />
      </div>
    </div>
  );
}

'use client';

/**
 * Executive Card Component
 *
 * ui-engineer implementation
 * Displays executive analysis summary (CEO/CFO/CTO)
 *
 * NO mocks. Real metadata only.
 */

interface ExecutiveCardProps {
  executive: 'CEO' | 'CFO' | 'CTO';
  scores: {
    // CEO
    ceo_fit_score?: number;
    ceo_qualified_at?: string;
    // CFO
    cfo_revenue_potential?: number;
    cfo_ltv_estimate?: number;
    cfo_risk_level?: string;
    // CTO
    cto_technical_fit?: number;
    cto_complexity?: string;
    cto_timeline_estimate?: string;
  };
  lastAnalysis?: string;
}

export default function ExecutiveCard({ executive, scores, lastAnalysis }: ExecutiveCardProps) {
  const getExecutiveData = () => {
    switch (executive) {
      case 'CEO':
        return {
          icon: '👔',
          color: 'from-indigo-900/30 to-indigo-800/30 border-indigo-700/50',
          metrics: [
            {
              label: 'Fit Score',
              value: scores.ceo_fit_score !== undefined
                ? `${(scores.ceo_fit_score * 100).toFixed(0)}%`
                : 'N/A',
            },
            {
              label: 'Qualified',
              value: scores.ceo_qualified_at
                ? new Date(scores.ceo_qualified_at).toLocaleDateString()
                : 'Pending',
            },
          ],
        };
      case 'CFO':
        return {
          icon: '💰',
          color: 'from-emerald-900/30 to-emerald-800/30 border-emerald-700/50',
          metrics: [
            {
              label: 'Revenue Potential',
              value: scores.cfo_revenue_potential !== undefined
                ? `$${scores.cfo_revenue_potential.toLocaleString()}`
                : 'N/A',
            },
            {
              label: 'LTV Estimate',
              value: scores.cfo_ltv_estimate !== undefined
                ? `$${scores.cfo_ltv_estimate.toLocaleString()}`
                : 'N/A',
            },
            {
              label: 'Risk Level',
              value: scores.cfo_risk_level || 'N/A',
            },
          ],
        };
      case 'CTO':
        return {
          icon: '⚙️',
          color: 'from-violet-900/30 to-violet-800/30 border-violet-700/50',
          metrics: [
            {
              label: 'Technical Fit',
              value: scores.cto_technical_fit !== undefined
                ? `${(scores.cto_technical_fit * 100).toFixed(0)}%`
                : 'N/A',
            },
            {
              label: 'Complexity',
              value: scores.cto_complexity || 'N/A',
            },
            {
              label: 'Timeline',
              value: scores.cto_timeline_estimate || 'N/A',
            },
          ],
        };
    }
  };

  const data = getExecutiveData();

  return (
    <div className={`bg-gradient-to-br ${data.color} backdrop-blur-sm border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{data.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white">{executive}</h3>
            <p className="text-xs text-gray-400">Executive Analysis</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{metric.label}</span>
            <span className="text-sm font-semibold text-white">{metric.value}</span>
          </div>
        ))}
      </div>

      {lastAnalysis && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">Last Analysis</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(lastAnalysis).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

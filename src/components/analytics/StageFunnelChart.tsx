'use client';

/**
 * Stage Funnel Chart Component
 *
 * ui-engineer implementation
 * Horizontal bar chart for deal pipeline stages
 *
 * NO external chart libraries. Pure CSS + Tailwind.
 */

interface FunnelStage {
  stage: string;
  count: number;
  totalValue: number;
}

interface StageFunnelChartProps {
  stages: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-blue-500',
  qualification: 'bg-cyan-500',
  proposal: 'bg-indigo-500',
  negotiation: 'bg-purple-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
  unknown: 'bg-gray-500',
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  unknown: 'Unknown',
};

export default function StageFunnelChart({ stages }: StageFunnelChartProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3 opacity-50">📊</div>
        <p className="text-gray-400">No funnel data yet</p>
      </div>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const percentage = (stage.count / maxCount) * 100;
        const color = STAGE_COLORS[stage.stage] || STAGE_COLORS.unknown;
        const label = STAGE_LABELS[stage.stage] || stage.stage;

        return (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">{label}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">{stage.count} deals</span>
                <span className="text-emerald-400 font-mono text-xs">
                  {formatCurrency(stage.totalValue)}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

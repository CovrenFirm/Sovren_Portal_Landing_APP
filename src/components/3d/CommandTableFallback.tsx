'use client';

import { useEffect, useState } from 'react';

/**
 * CommandTableFallback - 2D visualization when WebGL is unavailable
 *
 * Displays the 21 executive nodes in a tactical grid layout
 * with animations and visual feedback.
 */
export default function CommandTableFallback() {
  const [mounted, setMounted] = useState(false);
  const selectedExecutive = null; // Simplified - remove store dependency
  const phase = 'idle'; // Simplified - remove store dependency

  useEffect(() => {
    setMounted(true);
  }, []);

  const executiveRoles = [
    'CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board',
    'CHRO', 'CLO', 'CIO', 'CSO', 'CDO',
    'VP-Eng', 'VP-Sales', 'VP-Prod', 'VP-Ops', 'VP-Mktg',
    'VP-HR', 'VP-Legal', 'Dir-Sec', 'Dir-Compl'
  ];

  const getNodeColor = (role: string) => {
    if (['CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board'].includes(role)) {
      return 'from-amber-500 to-orange-600'; // C-suite
    } else if (role.startsWith('VP')) {
      return 'from-purple-500 to-violet-600'; // VPs
    } else {
      return 'from-emerald-500 to-green-600'; // Directors
    }
  };

  const getPulseSpeed = () => {
    // Simplified - no phase-based animation for now
    return '';
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="text-blue-400 text-sm">Initializing Command Table...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/30 to-purple-950/30 overflow-hidden">
      {/* Holographic grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.2) 25%, rgba(59, 130, 246, 0.2) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.2) 75%, rgba(59, 130, 246, 0.2) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Tactical Command Table Label */}
      <div className="absolute top-4 left-4 text-blue-400 text-xs font-mono tracking-wider opacity-60">
        &gt; COMMAND_TABLE.EXECUTIVE_NODES [21]
      </div>

      {/* Executive Nodes Grid */}
      <div className="relative z-10 grid grid-cols-7 gap-4 p-8 max-w-4xl">
        {executiveRoles.map((role, i) => {
          const isSelected = role === selectedExecutive;
          const colors = getNodeColor(role);

          return (
            <div
              key={role}
              className="relative flex flex-col items-center justify-center group"
            >
              {/* Node */}
              <div
                className={`
                  relative w-12 h-12 rounded-full bg-gradient-to-br ${colors}
                  ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-75 scale-110' : 'ring-2 ring-slate-700'}
                  ${isSelected ? getPulseSpeed() : ''}
                  transition-all duration-300 ease-out
                  hover:scale-105 hover:ring-blue-500
                  shadow-lg
                `}
              >
                {/* Inner glow */}
                <div className="absolute inset-1 rounded-full bg-white/20" />

                {/* Pulsing indicator for selected */}
                {isSelected && (
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-50" />
                )}
              </div>

              {/* Label */}
              <div className={`
                mt-2 text-xs font-mono tracking-tight text-center
                ${isSelected ? 'text-blue-300 font-semibold' : 'text-slate-400'}
                transition-colors duration-300
              `}>
                {role}
              </div>

              {/* Status indicator */}
              {isSelected && (
                <div className="mt-1 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse delay-75" />
                  <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse delay-150" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase indicator */}
      <div className="absolute bottom-4 right-4 text-xs font-mono text-blue-400/60">
        STATUS: <span className="text-blue-300 uppercase">READY</span>
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

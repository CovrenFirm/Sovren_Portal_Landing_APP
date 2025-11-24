'use client';

import { useSceneStore } from '@/state/sceneStore';
import { cn } from '@/lib/cn';

/**
 * Static list of 21 Sovren Shadow Board executives
 * These are compile-time constants, NOT mock data
 */
const EXECUTIVES = [
  { id: 'CEO', title: 'CEO', color: 'from-indigo-600 to-purple-600' },
  { id: 'CFO', title: 'CFO', color: 'from-emerald-600 to-teal-600' },
  { id: 'COO', title: 'COO', color: 'from-blue-600 to-cyan-600' },
  { id: 'CTO', title: 'CTO', color: 'from-violet-600 to-purple-600' },
  { id: 'CMO', title: 'CMO', color: 'from-pink-600 to-rose-600' },
  { id: 'CHRO', title: 'CHRO', color: 'from-amber-600 to-orange-600' },
  { id: 'CLO', title: 'CLO', color: 'from-slate-600 to-gray-600' },
  { id: 'CIO', title: 'CIO', color: 'from-sky-600 to-blue-600' },
  { id: 'CSO', title: 'CSO', color: 'from-red-600 to-orange-600' },
  { id: 'CDO', title: 'CDO', color: 'from-cyan-600 to-teal-600' },
  { id: 'CRO', title: 'CRO', color: 'from-lime-600 to-green-600' },
  { id: 'CPO', title: 'CPO', color: 'from-fuchsia-600 to-pink-600' },
  { id: 'CISO', title: 'CISO', color: 'from-rose-600 to-red-600' },
  { id: 'CCO', title: 'CCO', color: 'from-teal-600 to-cyan-600' },
  { id: 'CAO', title: 'CAO', color: 'from-orange-600 to-amber-600' },
  { id: 'CNO', title: 'CNO', color: 'from-indigo-600 to-blue-600' },
  { id: 'CMOps', title: 'CMOps', color: 'from-purple-600 to-violet-600' },
  { id: 'VP-Revenue', title: 'VP Revenue', color: 'from-green-600 to-emerald-600' },
  { id: 'VP-Operations', title: 'VP Operations', color: 'from-blue-600 to-indigo-600' },
  { id: 'VP-Strategy', title: 'VP Strategy', color: 'from-violet-600 to-purple-600' },
  { id: 'VP-Product', title: 'VP Product', color: 'from-cyan-600 to-sky-600' },
] as const;

export default function ExecutiveGrid() {
  const { selectedExecutive, setSelectedExecutive } = useSceneStore();

  const handleExecutiveClick = (executiveId: string) => {
    setSelectedExecutive(executiveId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
      {EXECUTIVES.map((executive) => {
        const isSelected = selectedExecutive === executive.id;

        return (
          <button
            key={executive.id}
            onClick={() => handleExecutiveClick(executive.id)}
            className={cn(
              'relative group',
              'bg-gray-900/50 backdrop-blur-sm border rounded-xl p-4',
              'transition-all duration-300',
              'hover:scale-105 hover:shadow-xl',
              isSelected
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/50'
                : 'border-gray-800 hover:border-gray-700'
            )}
          >
            {/* Gradient background on hover/select */}
            <div
              className={cn(
                'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300',
                'bg-gradient-to-br',
                executive.color,
                isSelected ? 'opacity-20' : 'group-hover:opacity-10'
              )}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="text-center">
                <div
                  className={cn(
                    'text-2xl font-bold mb-2 transition-colors',
                    isSelected ? 'text-white' : 'text-gray-300'
                  )}
                >
                  {executive.title}
                </div>
                {isSelected && (
                  <div className="text-xs text-indigo-400 font-medium">
                    SELECTED
                  </div>
                )}
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

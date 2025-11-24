'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Constitution Viewer Component
 *
 * Displays the AI Constitution with section navigation
 * - Left sidebar: Section list
 * - Right panel: Section content
 *
 * NO mocks. Real backend data only.
 */

interface ConstitutionSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Constitution {
  version: string;
  lastUpdated: string;
  sections: ConstitutionSection[];
}

export default function ConstitutionViewer() {
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConstitution();
  }, []);

  const fetchConstitution = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/governance/constitution');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch constitution');
      }

      setConstitution(data.constitution);

      // Auto-select first section
      if (data.constitution.sections.length > 0) {
        setSelectedSectionId(data.constitution.sections[0].id);
      }
    } catch (err) {
      console.error('[ConstitutionViewer] Error fetching constitution:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const selectedSection = constitution?.sections.find(
    (s) => s.id === selectedSectionId
  );

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Constitution...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !constitution) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-50">⚠️</div>
          <p className="text-red-400 text-lg mb-2">Failed to load Constitution</p>
          <p className="text-gray-400">{error || 'Unknown error'}</p>
          <button
            onClick={fetchConstitution}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-x divide-gray-800">
        {/* Left Sidebar - Section Navigation */}
        <div className="lg:col-span-1 bg-gray-900/30 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Constitution
            </h3>
            <div className="text-xs text-gray-500">
              Version {constitution.version}
            </div>
            <div className="text-xs text-gray-500">
              Updated {new Date(constitution.lastUpdated).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-1">
            {constitution.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedSectionId === section.id
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500">Section {section.order}</div>
                </button>
              ))}
          </div>
        </div>

        {/* Right Panel - Section Content */}
        <div className="lg:col-span-3 p-6">
          {selectedSection ? (
            <div>
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Section {selectedSection.order}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedSection.title}
                </h2>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedSection.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Select a section to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

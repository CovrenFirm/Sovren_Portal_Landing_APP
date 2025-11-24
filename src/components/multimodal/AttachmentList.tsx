'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Attachment List Component
 *
 * ui-engineer implementation
 * Displays attached files for a CRM entity
 *
 * NO mocks. Real backend data only.
 */

interface Attachment {
  id: string;
  filename: string;
  mediaType: string;
  size: number;
  createdAt: string;
  uploadId: string;
  analysisStatus?: string;
}

interface AttachmentListProps {
  entityType: 'contact' | 'deal';
  entityId: string;
  refreshTrigger?: number;
}

export default function AttachmentList({
  entityType,
  entityId,
  refreshTrigger,
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId, refreshTrigger]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/multimodal/list?entityType=${entityType}&entityId=${entityId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch attachments');
      }

      setAttachments(data.attachments);
    } catch (err) {
      console.error('[AttachmentList] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mediaType: string): string => {
    if (mediaType.includes('audio')) return '🎵';
    if (mediaType.includes('pdf')) return '📄';
    if (mediaType.includes('word') || mediaType.includes('document')) return '📝';
    if (mediaType.includes('json')) return '🔧';
    if (mediaType.includes('csv') || mediaType.includes('spreadsheet')) return '📊';
    if (mediaType.includes('text')) return '📃';
    return '📎';
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading attachments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Failed to load attachments</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchAttachments}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Attachments</h3>
          <p className="text-sm text-gray-400">
            {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
          </p>
        </div>
        <button
          onClick={fetchAttachments}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 opacity-50">📁</div>
          <p className="text-gray-400">No attachments yet for this {entityType}</p>
          <p className="text-sm text-gray-500 mt-1">
            Upload files using the panel above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl flex-shrink-0">
                  {getFileIcon(attachment.mediaType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {attachment.filename}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>•</span>
                    <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
                    {attachment.analysisStatus && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">{attachment.analysisStatus}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 font-mono">
                  {attachment.mediaType.split('/')[1] || 'file'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

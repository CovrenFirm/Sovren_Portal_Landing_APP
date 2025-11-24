'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * File Intake Panel Component
 *
 * ui-engineer + perf-eng implementation
 * Drag-and-drop file upload with real progress tracking
 *
 * NO mocks. Production-grade only.
 */

interface FileIntakePanelProps {
  entityType: 'contact' | 'deal';
  entityId: string;
  onUploadComplete?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function FileIntakePanel({
  entityType,
  entityId,
  onUploadComplete,
}: FileIntakePanelProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploadState('uploading');
      setError(null);
      setUploadProgress(0);

      // perf-eng: Create FormData for streaming upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      // perf-eng: Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);

          if (response.success) {
            setUploadState('success');
            setUploadProgress(100);
            setSelectedFile(null);

            // Notify parent to refresh attachment list
            if (onUploadComplete) {
              onUploadComplete();
            }

            // Reset after 2 seconds
            setTimeout(() => {
              setUploadState('idle');
              setUploadProgress(0);
            }, 2000);
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', '/api/multimodal/upload');
      xhr.send(formData);

      setUploadState('processing');
    } catch (err) {
      console.error('[FileIntakePanel] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadState('error');
      setUploadProgress(0);
    }
  };

  const selectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Upload File</h3>
        <p className="text-sm text-gray-400">
          Attach documents, audio, or data files to this {entityType}
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-all duration-200',
          dragActive
            ? 'border-violet-500 bg-violet-900/20'
            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50',
          uploadState !== 'idle' && 'pointer-events-none opacity-60'
        )}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {uploadState === 'idle' && (
            <>
              <div className="text-4xl">📎</div>
              <div>
                <p className="text-gray-300 font-medium mb-1">
                  Drag and drop a file here
                </p>
                <p className="text-sm text-gray-500">
                  or click below to select a file
                </p>
              </div>
              <button
                onClick={selectFile}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
              >
                Select File
              </button>
              <p className="text-xs text-gray-500">
                Supports: PDF, DOCX, TXT, JSON, CSV, MP3, WAV, M4A (max 100MB)
              </p>
            </>
          )}

          {uploadState === 'uploading' && (
            <>
              <div className="text-4xl">⬆️</div>
              <div className="w-full max-w-md">
                <p className="text-gray-300 font-medium mb-2">Uploading...</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
              </div>
            </>
          )}

          {uploadState === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
              <p className="text-gray-300 font-medium">Processing...</p>
            </>
          )}

          {uploadState === 'success' && (
            <>
              <div className="text-4xl">✅</div>
              <p className="text-emerald-400 font-medium">Upload successful!</p>
            </>
          )}

          {uploadState === 'error' && (
            <>
              <div className="text-4xl">❌</div>
              <p className="text-red-400 font-medium">Upload failed</p>
              <p className="text-sm text-gray-400">{error}</p>
              <button
                onClick={() => {
                  setUploadState('idle');
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.txt,.json,.csv,.mp3,.wav,.m4a"
      />
    </div>
  );
}

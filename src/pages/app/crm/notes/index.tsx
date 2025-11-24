'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { api } from '@/lib/api';
import { Note } from '@/types/crm';
import { cn } from '@/lib/cn';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    entity_type: 'contact' as 'contact' | 'company' | 'deal',
    entity_id: '',
  });

  // Get auth token from session storage
  const getToken = () => {
    if (typeof window === 'undefined') return '';
    const tokens = sessionStorage.getItem('auth_tokens');
    if (!tokens) return '';
    return JSON.parse(tokens).access_token;
  };

  // Fetch notes
  const {
    data: notesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.getNotes(token);
    },
    enabled: typeof window !== 'undefined',
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.createNote(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsCreateModalOpen(false);
      setNewNote({
        content: '',
        entity_type: 'contact',
        entity_id: '',
      });
    },
  });

  const notes: Note[] = (notesResponse as any)?.data || [];

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesType = entityTypeFilter === 'all' || note.entity_type === entityTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    await createMutation.mutateAsync(newNote);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'contact':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case 'company':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case 'deal':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'contact':
        return 'text-blue-400 bg-blue-500/20';
      case 'company':
        return 'text-purple-400 bg-purple-500/20';
      case 'deal':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 text-lg animate-pulse">Loading notes...</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Notes</h1>
            <p className="mt-2 text-gray-400">Timeline of all CRM notes and interactions</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">
              Failed to load notes. {error instanceof Error ? error.message : 'Please try again.'}
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="contact">Contacts</option>
            <option value="company">Companies</option>
            <option value="deal">Deals</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400">
          Showing {filteredNotes.length} of {notes.length} notes
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          {filteredNotes.length > 0 && (
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />
          )}

          {/* Notes */}
          <div className="space-y-6">
            {filteredNotes.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="relative flex gap-4">
                  {/* Timeline Dot */}
                  <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        getEntityColor(note.entity_type)
                      )}
                    >
                      {getEntityIcon(note.entity_type)}
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30 capitalize">
                          {note.entity_type}
                        </span>
                        <span className="text-xs text-gray-500">ID: {note.entity_id}</span>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatTimestamp(note.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Note</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={createMutation.isPending}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="px-6 py-6 space-y-4">
              {/* Entity Type */}
              <div>
                <label htmlFor="entity_type" className="block text-sm font-medium text-gray-300 mb-2">
                  Entity Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="entity_type"
                  value={newNote.entity_type}
                  onChange={(e) =>
                    setNewNote({ ...newNote, entity_type: e.target.value as 'contact' | 'company' | 'deal' })
                  }
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="contact">Contact</option>
                  <option value="company">Company</option>
                  <option value="deal">Deal</option>
                </select>
              </div>

              {/* Entity ID */}
              <div>
                <label htmlFor="entity_id" className="block text-sm font-medium text-gray-300 mb-2">
                  Entity ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="entity_id"
                  value={newNote.entity_id}
                  onChange={(e) => setNewNote({ ...newNote, entity_id: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter entity ID"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                  Note Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your note..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className={cn(
                    'flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
                    createMutation.isPending && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

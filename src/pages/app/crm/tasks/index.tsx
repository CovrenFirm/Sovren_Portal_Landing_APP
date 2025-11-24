'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { TaskForm } from '@/components/crm/TaskForm';
import { api } from '@/lib/api';
import { Task } from '@/types/crm';
import { cn } from '@/lib/cn';

type TaskFilter = 'all' | 'today' | 'week' | 'overdue';

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [showInlineForm, setShowInlineForm] = useState(false);

  // Get auth token from session storage
  const getToken = () => {
    if (typeof window === 'undefined') return '';
    const tokens = sessionStorage.getItem('auth_tokens');
    if (!tokens) return '';
    return JSON.parse(tokens).access_token;
  };

  // Fetch tasks
  const {
    data: tasksResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.getTasks(token);
    },
    enabled: typeof window !== 'undefined',
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.createTask(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setShowInlineForm(false);
      setSelectedTask(undefined);
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return api.updateTask(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Toggle task completion
  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateMutation.mutateAsync({
      id: task.id,
      data: { status: newStatus },
    });
  };

  const handleCreateClick = () => {
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const handleInlineCreate = () => {
    setShowInlineForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(undefined);
  };

  const handleInlineClose = () => {
    setShowInlineForm(false);
  };

  const tasks = (tasksResponse as any)?.data || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return tasks.filter((task: Task) => {
      if (filter === 'all') return true;

      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);

      if (filter === 'today') {
        return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }

      if (filter === 'week') {
        return dueDate >= today && dueDate < weekFromNow;
      }

      if (filter === 'overdue') {
        return dueDate < today && task.status !== 'completed';
      }

      return true;
    });
  }, [tasks, filter]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) return 'Tomorrow';
    if (taskDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 text-lg animate-pulse">Loading tasks...</div>
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
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="mt-2 text-gray-400">Manage your to-do list and track progress</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">
              Failed to load tasks. {error instanceof Error ? error.message : 'Please try again.'}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            Due Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'overdue'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            Overdue
          </button>
        </div>

        {/* Inline Task Creation */}
        {showInlineForm && (
          <div className="bg-gray-900 border border-blue-500 rounded-lg p-4">
            <TaskForm
              onSubmit={handleFormSubmit}
              onCancel={handleInlineClose}
              isSubmitting={createMutation.isPending}
              isInline
            />
          </div>
        )}

        {/* Quick Add Button */}
        {!showInlineForm && (
          <button
            onClick={handleInlineCreate}
            className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg p-4 text-left text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a task...
          </button>
        )}

        {/* Tasks List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
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
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task: Task) => (
              <div
                key={task.id}
                className={cn(
                  'bg-gray-900 border rounded-lg p-4 hover:bg-gray-800/50 transition-colors',
                  isOverdue(task) ? 'border-red-500/50' : 'border-gray-800'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 flex-shrink-0"
                    disabled={updateMutation.isPending}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-600 hover:border-gray-500'
                      )}
                    >
                      {task.status === 'completed' && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            'text-lg font-medium text-white',
                            task.status === 'completed' && 'line-through text-gray-500'
                          )}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p
                            className={cn(
                              'mt-1 text-sm text-gray-400',
                              task.status === 'completed' && 'line-through'
                            )}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Due Date */}
                      {task.due_date && (
                        <div
                          className={cn(
                            'flex items-center gap-1 text-sm whitespace-nowrap',
                            isOverdue(task) ? 'text-red-400' : 'text-gray-400'
                          )}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(task.due_date)}
                        </div>
                      )}
                    </div>

                    {/* Meta Information */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* Priority */}
                      {task.priority && (
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full border capitalize',
                            getPriorityColor(task.priority)
                          )}
                        >
                          {task.priority}
                        </span>
                      )}

                      {/* Status */}
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full border capitalize',
                          getStatusColor(task.status)
                        )}
                      >
                        {task.status.replace('_', ' ')}
                      </span>

                      {/* Assignee */}
                      {task.assignee_id && (
                        <span className="px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-full">
                          Assigned
                        </span>
                      )}

                      {/* Entity Link */}
                      {task.entity_type && task.entity_id && (
                        <span className="px-2 py-1 text-xs text-blue-400 bg-blue-500/20 rounded-full border border-blue-500/30">
                          {task.entity_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results count */}
        {filteredTasks.length > 0 && (
          <div className="text-sm text-gray-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={createMutation.isPending}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <TaskForm
                task={selectedTask}
                onSubmit={handleFormSubmit}
                onCancel={handleModalClose}
                isSubmitting={createMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

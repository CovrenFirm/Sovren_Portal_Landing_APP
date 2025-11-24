'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/types/crm';
import { cn } from '@/lib/cn';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  entity_type: z.enum(['contact', 'company', 'deal']).optional(),
  entity_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isInline?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isSubmitting, isInline }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          due_date: task.due_date || '',
          priority: task.priority,
          status: task.status,
          entity_type: task.entity_type,
          entity_id: task.entity_id || '',
        }
      : {
          title: '',
          description: '',
          due_date: '',
          priority: 'medium',
          status: 'pending',
          entity_type: undefined,
          entity_id: '',
        },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || '',
        priority: task.priority,
        status: task.status,
        entity_type: task.entity_type,
        entity_id: task.entity_id || '',
      });
    }
  }, [task, reset]);

  const onFormSubmit = async (data: TaskFormData) => {
    // Clean up empty strings
    const cleanedData = {
      ...data,
      description: data.description || undefined,
      due_date: data.due_date || undefined,
      entity_id: data.entity_id || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn('space-y-4', isInline && 'space-y-3')}>
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className={cn(
            'w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.title ? 'border-red-500' : 'border-gray-800'
          )}
          placeholder="Follow up with client"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      {!isInline && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about the task..."
          />
        </div>
      )}

      {/* Due Date & Priority Row */}
      <div className={cn('grid gap-4', isInline ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-300 mb-2">
            Due Date
          </label>
          <input
            {...register('due_date')}
            type="datetime-local"
            id="due_date"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            {...register('priority')}
            id="priority"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Status & Entity Type Row */}
      <div className={cn('grid gap-4', isInline ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            id="status"
            className={cn(
              'w-full bg-gray-900 border rounded-lg px-4 py-2 text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.status ? 'border-red-500' : 'border-gray-800'
            )}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
        </div>

        {/* Entity Type */}
        {!isInline && (
          <div>
            <label htmlFor="entity_type" className="block text-sm font-medium text-gray-300 mb-2">
              Related To
            </label>
            <select
              {...register('entity_type')}
              id="entity_type"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              <option value="contact">Contact</option>
              <option value="company">Company</option>
              <option value="deal">Deal</option>
            </select>
          </div>
        )}
      </div>

      {/* Entity ID */}
      {!isInline && (
        <div>
          <label htmlFor="entity_id" className="block text-sm font-medium text-gray-300 mb-2">
            Entity ID
          </label>
          <input
            {...register('entity_id')}
            type="text"
            id="entity_id"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional: ID of related entity"
          />
        </div>
      )}

      {/* Actions */}
      <div className={cn('flex gap-3', isInline ? 'pt-2' : 'pt-4')}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Contact } from '@/types/crm';
import { cn } from '@/lib/cn';

const contactSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_id: z.string().optional(),
  company_name: z.string().optional(),
  lifecycle_stage: z.enum(['lead', 'prospect', 'customer', 'partner']).optional(),
  lead_score: z.number().min(0).max(100).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ContactForm({ contact, onSubmit, onCancel, isSubmitting }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          full_name: contact.full_name,
          email: contact.email || '',
          phone: contact.phone || '',
          company_id: contact.company_id || '',
          company_name: contact.company_name || '',
          lifecycle_stage: contact.lifecycle_stage,
          lead_score: contact.lead_score,
        }
      : {
          full_name: '',
          email: '',
          phone: '',
          company_name: '',
          lifecycle_stage: 'lead',
          lead_score: 0,
        },
  });

  useEffect(() => {
    if (contact) {
      reset({
        full_name: contact.full_name,
        email: contact.email || '',
        phone: contact.phone || '',
        company_id: contact.company_id || '',
        company_name: contact.company_name || '',
        lifecycle_stage: contact.lifecycle_stage,
        lead_score: contact.lead_score,
      });
    }
  }, [contact, reset]);

  const onFormSubmit = async (data: ContactFormData) => {
    // Clean up empty strings
    const cleanedData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company_name: data.company_name || undefined,
      company_id: data.company_id || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('full_name')}
          type="text"
          id="full_name"
          className={cn(
            'w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.full_name ? 'border-red-500' : 'border-gray-800'
          )}
          placeholder="John Doe"
        />
        {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={cn(
            'w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.email ? 'border-red-500' : 'border-gray-800'
          )}
          placeholder="john.doe@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          Phone
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-300 mb-2">
          Company
        </label>
        <input
          {...register('company_name')}
          type="text"
          id="company_name"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Acme Corp"
        />
      </div>

      {/* Lifecycle Stage */}
      <div>
        <label htmlFor="lifecycle_stage" className="block text-sm font-medium text-gray-300 mb-2">
          Lifecycle Stage
        </label>
        <select
          {...register('lifecycle_stage')}
          id="lifecycle_stage"
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select stage</option>
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="customer">Customer</option>
          <option value="partner">Partner</option>
        </select>
      </div>

      {/* Lead Score */}
      <div>
        <label htmlFor="lead_score" className="block text-sm font-medium text-gray-300 mb-2">
          Lead Score (0-100)
        </label>
        <input
          {...register('lead_score', { valueAsNumber: true })}
          type="number"
          id="lead_score"
          min="0"
          max="100"
          className={cn(
            'w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.lead_score ? 'border-red-500' : 'border-gray-800'
          )}
          placeholder="0"
        />
        {errors.lead_score && <p className="mt-1 text-sm text-red-500">{errors.lead_score.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
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

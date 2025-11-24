export interface Contact {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  company_name?: string;
  lifecycle_stage?: 'lead' | 'prospect' | 'customer' | 'partner';
  lead_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  employee_count?: number;
  annual_revenue?: number;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability?: number;
  close_date?: string;
  contact_id?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee_id?: string;
  entity_type?: 'contact' | 'company' | 'deal';
  entity_id?: string;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  entity_type: 'contact' | 'company' | 'deal';
  entity_id: string;
  author_id: string;
  created_at: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  timestamp: string;
}

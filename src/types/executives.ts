export interface Executive {
  id: string;
  subscriber_id: string;
  full_name: string;
  role: string;
  department: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'deliberating' | 'idle';
  email?: string;
  phone_extension?: string;
  avatar_url?: string;
  bio?: string;
  current_activity?: string;
  last_action_at?: string;
  created_at: string;
}

export interface ExecutiveActivity {
  id: string;
  executive_id: string;
  action_type: string;
  description: string;
  timestamp: string;
  sealed: boolean;
  seal_id?: string;
}

export interface Deliberation {
  id: string;
  topic: string;
  participants: {
    executive_id: string;
    name: string;
    role: string;
  }[];
  started_at: string;
  status: 'active' | 'completed' | 'awaiting_approval';
  message_count: number;
}

export interface DeliberationMessage {
  speaker_id: string;
  speaker_name: string;
  speaker_role: string;
  message: string;
  timestamp: string;
  sealed: boolean;
}

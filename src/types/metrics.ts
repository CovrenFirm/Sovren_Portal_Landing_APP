export interface TransformationMetrics {
  timeframe: string;
  metrics: {
    time_saved_hours: number;
    time_saved_value_usd: number;
    revenue_opportunities_total: number;
    revenue_opportunities: Array<{
      opportunity_id: string;
      executive_id: string;
      description: string;
      estimated_value: number;
    }>;
    errors_prevented: number;
    errors_prevented_value: number;
    operational_improvements: {
      crm: {
        contacts_analyzed: number;
        leads_scored: number;
      };
      communications: {
        emails_handled: number;
        phone_calls_managed: number;
      };
    };
    executive_performance: Array<{
      executive_id: string;
      analyses_completed: number;
      opportunities_identified: number;
    }>;
    roi_calculation: {
      cost_monthly: number;
      value_created: number;
      roi_percentage: number;
    };
  };
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'transformation' | 'opportunity' | 'error_prevention' | 'executive_action' | 'crm_update';
  title: string;
  description: string;
  metadata?: {
    executive_id?: string;
    executive_name?: string;
    value?: number;
    entity_type?: string;
    entity_id?: string;
  };
}

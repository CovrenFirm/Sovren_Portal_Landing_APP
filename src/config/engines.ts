/**
 * Sovren Engine Registry
 *
 * backend-core implementation
 * Metadata for all major Sovren orchestration engines
 *
 * NO mocks. Real engine definitions only.
 */

export interface EngineMetadata {
  id: string;
  name: string;
  category: 'ai' | 'orchestration' | 'integration' | 'infrastructure';
  description: string;
  role: string;
  upstreamDependencies: string[];
  downstreamConsumers: string[];
  metricsAvailable: boolean;
  metricKeys?: string[];
}

export const SOVREN_ENGINES: Record<string, EngineMetadata> = {
  shadow_board: {
    id: 'shadow_board',
    name: 'Shadow Board AI',
    category: 'ai',
    description: 'Multi-executive AI analysis system (CEO/CFO/CTO)',
    role: 'Provides strategic, financial, and technical analysis for CRM entities',
    upstreamDependencies: ['crm_integration', 'redis_pipeline'],
    downstreamConsumers: ['crm_integration', 'email_orchestration'],
    metricsAvailable: true,
    metricKeys: [
      'shadowboard_analysis_total',
      'shadowboard_analysis_duration_seconds',
      'shadowboard_analysis_failures_total',
      'shadowboard_notes_created_total',
      'shadowboard_strategic_fit_score',
    ],
  },
  phd_engine: {
    id: 'phd_engine',
    name: 'PhD Digital Doppelgänger',
    category: 'ai',
    description: 'Autonomous PhD-grade research and analysis engine',
    role: 'Performs deep research, citation analysis, and autonomous decision-making',
    upstreamDependencies: ['crm_integration', 'shadow_board'],
    downstreamConsumers: ['executive_coordination'],
    metricsAvailable: true,
    metricKeys: [
      'phd_engine_execution_duration_seconds',
      'phd_engine_execution_total',
      'phd_engine_exceptions_total',
      'phd_engine_queue_depth',
      'phd_engine_autonomy_rate',
    ],
  },
  redis_pipeline: {
    id: 'redis_pipeline',
    name: 'Redis Event Pipeline',
    category: 'infrastructure',
    description: 'Event-driven pub/sub coordination system',
    role: 'Coordinates asynchronous events between all subsystems',
    upstreamDependencies: [],
    downstreamConsumers: ['shadow_board', 'phd_engine', 'email_orchestration', 'crm_integration'],
    metricsAvailable: true,
    metricKeys: [
      'redis_events_published_total',
      'redis_events_consumed_total',
      'redis_queue_depth',
      'redis_event_processing_duration_seconds',
      'redis_connection_status',
      'redis_reconnection_attempts_total',
    ],
  },
  crm_integration: {
    id: 'crm_integration',
    name: 'CRM Integration System',
    category: 'integration',
    description: 'Core CRM data management and API layer',
    role: 'Manages contacts, deals, companies, notes, tasks with ImmuDB sealing',
    upstreamDependencies: ['redis_pipeline'],
    downstreamConsumers: ['shadow_board', 'phd_engine', 'email_orchestration'],
    metricsAvailable: true,
    metricKeys: [
      'crm_api_requests_total',
      'crm_api_request_duration_seconds',
      'crm_contact_created_total',
      'crm_query_duration_seconds',
      'service_health_status{service_name="crm"}',
    ],
  },
  cognitive_load_optimizer: {
    id: 'cognitive_load_optimizer',
    name: 'Cognitive Load Optimizer',
    category: 'orchestration',
    description: 'Manages executive focus and decision prioritization',
    role: 'Optimizes cognitive load across AI executives to prevent decision fatigue',
    upstreamDependencies: ['shadow_board', 'executive_coordination'],
    downstreamConsumers: ['executive_authority'],
    metricsAvailable: false,
  },
  email_orchestration: {
    id: 'email_orchestration',
    name: 'Email Orchestration Engine',
    category: 'integration',
    description: 'Multi-executive email composition and coordination',
    role: 'Orchestrates email drafting across CEO/CFO/CTO perspectives',
    upstreamDependencies: ['shadow_board', 'executive_coordination'],
    downstreamConsumers: ['email_integration'],
    metricsAvailable: false,
  },
  calendar_integration: {
    id: 'calendar_integration',
    name: 'Calendar Integration System',
    category: 'integration',
    description: 'Calendar sync and meeting coordination',
    role: 'Integrates with external calendars for scheduling and availability',
    upstreamDependencies: ['executive_coordination'],
    downstreamConsumers: ['email_orchestration'],
    metricsAvailable: false,
  },
  network_effect_engine: {
    id: 'network_effect_engine',
    name: 'Network Effect Engine',
    category: 'orchestration',
    description: 'Social graph and relationship mapping',
    role: 'Analyzes network effects, influence patterns, and relationship graphs',
    upstreamDependencies: ['crm_integration'],
    downstreamConsumers: ['shadow_board'],
    metricsAvailable: false,
  },
  quantum_user_state: {
    id: 'quantum_user_state',
    name: 'Quantum User State Engine',
    category: 'infrastructure',
    description: 'Multi-dimensional user state management',
    role: 'Maintains quantum-inspired superposition of user states across sessions',
    upstreamDependencies: ['redis_pipeline'],
    downstreamConsumers: ['executive_coordination', 'cognitive_load_optimizer'],
    metricsAvailable: false,
  },
  executive_coordination: {
    id: 'executive_coordination',
    name: 'Executive Coordination Engine',
    category: 'orchestration',
    description: 'Multi-executive decision coordination and consensus',
    role: 'Coordinates decisions across CEO/CFO/CTO executives',
    upstreamDependencies: ['shadow_board'],
    downstreamConsumers: ['email_orchestration', 'cognitive_load_optimizer'],
    metricsAvailable: false,
  },
  executive_authority: {
    id: 'executive_authority',
    name: 'Executive Authority Framework',
    category: 'orchestration',
    description: 'Role-based authority and decision delegation',
    role: 'Manages authority hierarchy and decision delegation among executives',
    upstreamDependencies: ['executive_coordination'],
    downstreamConsumers: ['shadow_board'],
    metricsAvailable: false,
  },
  adaptive_immune_system: {
    id: 'adaptive_immune_system',
    name: 'Adaptive Immune System',
    category: 'infrastructure',
    description: 'Anomaly detection and system health monitoring',
    role: 'Detects and responds to anomalies, errors, and degraded states',
    upstreamDependencies: ['redis_pipeline'],
    downstreamConsumers: [],
    metricsAvailable: false,
  },
  digital_conglomerate: {
    id: 'digital_conglomerate',
    name: 'Digital Conglomerate Architecture',
    category: 'infrastructure',
    description: 'Multi-service orchestration and governance',
    role: 'Manages service mesh, inter-service communication, and governance',
    upstreamDependencies: [],
    downstreamConsumers: ['redis_pipeline', 'crm_integration'],
    metricsAvailable: false,
  },
};

export function getEngine(id: string): EngineMetadata | undefined {
  return SOVREN_ENGINES[id];
}

export function getAllEngines(): EngineMetadata[] {
  return Object.values(SOVREN_ENGINES);
}

export function getEnginesByCategory(category: EngineMetadata['category']): EngineMetadata[] {
  return getAllEngines().filter((e) => e.category === category);
}

export function getInstrumentedEngines(): EngineMetadata[] {
  return getAllEngines().filter((e) => e.metricsAvailable);
}

/**
 * Cross-Link Utilities for CRM ⇆ Shadow Board Navigation
 *
 * Production-grade utilities for bi-directional linking between
 * CRM entities and Shadow Board intelligence views.
 */

/**
 * Generate link to contact detail page
 */
export function linkToContact(id: string): string {
  return `/app/crm/contacts/${id}`;
}

/**
 * Generate link to deal detail page
 */
export function linkToDeal(id: string): string {
  return `/app/crm/deals/${id}`;
}

/**
 * Generate link to Shadow Board page
 */
export function linkToShadowBoard(): string {
  return '/app/shadowboard';
}

/**
 * Format executive agent display name
 */
export function formatExecAgent(agent: string): string {
  const agentMap: Record<string, string> = {
    ceo: 'CEO',
    cfo: 'CFO',
    cto: 'CTO',
    cmo: 'CMO',
    coo: 'COO',
    chro: 'CHRO',
    ciso: 'CISO',
    clo: 'CLO',
  };

  return agentMap[agent.toLowerCase()] || agent.toUpperCase();
}

/**
 * Format score with label and color coding
 */
export function formatScoreLabel(score: number | undefined): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  if (score === undefined || score === null) {
    return { label: 'Not Scored', color: 'gray' };
  }

  if (score >= 80) {
    return { label: `${score}/100 - Excellent`, color: 'green' };
  } else if (score >= 60) {
    return { label: `${score}/100 - Good`, color: 'yellow' };
  } else if (score >= 40) {
    return { label: `${score}/100 - Fair`, color: 'yellow' };
  } else {
    return { label: `${score}/100 - Poor`, color: 'red' };
  }
}

/**
 * Format risk level with color coding
 */
export function formatRiskLevel(risk: string | undefined): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  if (!risk) {
    return { label: 'Unknown', color: 'gray' };
  }

  const riskLower = risk.toLowerCase();

  if (riskLower === 'low') {
    return { label: 'Low Risk', color: 'green' };
  } else if (riskLower === 'medium' || riskLower === 'moderate') {
    return { label: 'Moderate Risk', color: 'yellow' };
  } else if (riskLower === 'high') {
    return { label: 'High Risk', color: 'red' };
  } else {
    return { label: risk, color: 'gray' };
  }
}

/**
 * Format complexity level with color coding
 */
export function formatComplexity(complexity: string | undefined): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  if (!complexity) {
    return { label: 'Unknown', color: 'gray' };
  }

  const complexityLower = complexity.toLowerCase();

  if (complexityLower === 'low' || complexityLower === 'simple') {
    return { label: 'Low Complexity', color: 'green' };
  } else if (complexityLower === 'medium' || complexityLower === 'moderate') {
    return { label: 'Medium Complexity', color: 'yellow' };
  } else if (complexityLower === 'high' || complexityLower === 'complex') {
    return { label: 'High Complexity', color: 'red' };
  } else {
    return { label: complexity, color: 'gray' };
  }
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: string | undefined): string {
  if (!timestamp) return 'Unknown';

  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format timeline estimate
 */
export function formatTimeline(timeline: string | undefined): string {
  if (!timeline) return 'Not estimated';
  return timeline;
}

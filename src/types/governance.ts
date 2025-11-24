export interface Seal {
  seal_id: string;
  action_id: string;
  action_type: string;
  executive_id: string;
  timestamp: string;
  hash: string;
  immudb_tx_id: string;
  verifiable: boolean;
}

export interface SealVerification {
  valid: boolean;
  seal_data: {
    hash: string;
    immudb_proof: any;
  };
}

export interface AuthorityLimit {
  executive_id: string;
  role: string;
  can_approve_up_to_usd: number;
  requires_approval_for: string[];
}

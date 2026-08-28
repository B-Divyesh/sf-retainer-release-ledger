export type EventType = 'deposit' | 'milestone' | 'release' | 'refund' | 'balance';
export type ReleaseDecision = 'ready' | 'review' | 'held';

export interface LedgerEvent {
  id: string;
  jobId: string;
  type: EventType;
  amount: number;
  date: string;
  note: string;
  decision?: ReleaseDecision;
  createdAt: string;
}

export interface Job {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  currency: string;
  taxLabel: string;
  reference: string;
  receiptNote: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  businessName: string;
}

export interface Backup {
  schemaVersion: 1;
  exportedAt: string;
  jobs: Job[];
  events: LedgerEvent[];
  settings: AppSettings;
}

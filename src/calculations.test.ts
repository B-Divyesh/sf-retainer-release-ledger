import { describe, expect, it } from 'vitest';
import { calculateTotals } from './calculations';
import type { Job, LedgerEvent } from './types';

const job: Job = { id: 'j1', name: 'Identity', clientName: 'A', clientEmail: '', totalAmount: 1000, currency: 'USD', taxLabel: 'Tax', reference: '', receiptNote: '', archived: false, createdAt: '', updatedAt: '' };
const event = (type: LedgerEvent['type'], amount: number, decision?: LedgerEvent['decision']): LedgerEvent => ({ id: crypto.randomUUID(), jobId: 'j1', type, amount, decision, date: '2026-01-01', note: '', createdAt: new Date().toISOString() });

describe('calculateTotals', () => {
  it('marks covered pending work ready', () => {
    const result = calculateTotals(job, [event('deposit', 500), event('milestone', 400)]);
    expect(result.status).toBe('ready');
    expect(result.available).toBe(500);
    expect(result.payable).toBe(500);
  });

  it('holds uncovered work and accounts for refunds', () => {
    const result = calculateTotals(job, [event('deposit', 500), event('refund', 200), event('milestone', 400)]);
    expect(result.status).toBe('held');
    expect(result.available).toBe(300);
  });

  it('subtracts released value from available funds', () => {
    const result = calculateTotals(job, [event('deposit', 500), event('milestone', 400), event('release', 400, 'ready')]);
    expect(result.released).toBe(400);
    expect(result.available).toBe(100);
    expect(result.status).toBe('review');
  });
});

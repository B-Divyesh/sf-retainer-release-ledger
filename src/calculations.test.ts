import { describe, expect, it } from 'vitest';
import { calculateTotals, MAX_AMOUNT } from './calculations';
import { rowsToCsv } from './csv';
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

  it('forces a hold when released work exceeds payment or finished work', () => {
    const result = calculateTotals(job, [event('deposit', 100), event('milestone', 100), event('release', 500, 'ready')]);
    expect(result.status).toBe('held');
    expect(result.statusReason).toContain('400');
  });

  it('forces a hold when refunds exceed payments', () => {
    const result = calculateTotals(job, [event('deposit', 100), event('refund', 150)]);
    expect(result.status).toBe('held');
    expect(result.statusReason).toContain('50');
  });
});

describe('export and amount boundaries', () => {
  it('sets a finite documented amount maximum', () => {
    expect(Number.isFinite(MAX_AMOUNT * 100)).toBe(true);
    expect(MAX_AMOUNT).toBe(10_000_000);
  });

  it('neutralizes spreadsheet formula prefixes in CSV output', () => {
    const csv = rowsToCsv([['=1+1', '+SUM(1,1)', '-2+3', '@cmd', '\tvalue', '\rvalue', 'safe']]);
    expect(csv).toContain("\"'=1+1\"");
    expect(csv).toContain("\"'+SUM(1,1)\"");
    expect(csv).toContain("\"'-2+3\"");
    expect(csv).toContain("\"'@cmd\"");
  });
});

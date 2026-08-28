import type { Job, LedgerEvent, ReleaseDecision } from './types';

export interface JobTotals {
  paid: number;
  earned: number;
  released: number;
  available: number;
  payable: number;
  pendingWork: number;
  status: ReleaseDecision;
  statusLabel: string;
  statusReason: string;
}

export const MAX_AMOUNT = 10_000_000;

export function calculateTotals(job: Job, events: LedgerEvent[]): JobTotals {
  const relevant = events.filter((event) => event.jobId === job.id);
  const paid = relevant.reduce((sum, event) => {
    if (event.type === 'deposit' || event.type === 'balance') return sum + event.amount;
    if (event.type === 'refund') return sum - event.amount;
    return sum;
  }, 0);
  const earned = relevant.reduce((sum, event) => event.type === 'milestone' ? sum + event.amount : sum, 0);
  const released = relevant.reduce((sum, event) => event.type === 'release' ? sum + event.amount : sum, 0);
  const available = Math.max(0, paid - released);
  const payable = Math.max(0, job.totalAmount - paid);
  const pendingWork = Math.max(0, earned - released);
  const lastDecision = [...relevant]
    .filter((event) => event.type === 'release' && event.decision)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.decision;

  if (paid < 0) {
    return { paid, earned, released, available, payable, pendingWork, status: 'held', statusLabel: 'Hold release', statusReason: `${moneyless(Math.abs(paid))} was refunded beyond recorded payments.` };
  }
  const coveredRelease = Math.min(paid, earned);
  if (released > coveredRelease) {
    const excess = released - Math.max(0, coveredRelease);
    return { paid, earned, released, available, payable, pendingWork, status: 'held', statusLabel: 'Hold release', statusReason: `${moneyless(excess)} was released beyond recorded payments or finished work.` };
  }

  if (lastDecision === 'held') {
    return { paid, earned, released, available, payable, pendingWork, status: 'held', statusLabel: 'Hold release', statusReason: 'The latest recorded decision says to hold this work.' };
  }
  if (pendingWork > 0 && available >= pendingWork) {
    return { paid, earned, released, available, payable, pendingWork, status: 'ready', statusLabel: 'Ready to release', statusReason: `${moneyless(pendingWork)} of pending work is covered by recorded payments.` };
  }
  if (pendingWork > 0) {
    return { paid, earned, released, available, payable, pendingWork, status: 'held', statusLabel: 'Hold release', statusReason: `${moneyless(pendingWork - available)} of pending work is not covered yet.` };
  }
  return { paid, earned, released, available, payable, pendingWork, status: 'review', statusLabel: 'Review next step', statusReason: lastDecision === 'ready' ? 'The latest decision was ready; no unreleased milestone remains.' : 'Record a milestone to compare work ready with payments available.' };
}

function moneyless(amount: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount);
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

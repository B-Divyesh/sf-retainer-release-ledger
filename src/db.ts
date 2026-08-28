import { MAX_AMOUNT } from './calculations';
import type { AppSettings, Backup, Job, LedgerEvent } from './types';

export const isDemoMode = (location.pathname === '/demo' || location.pathname.startsWith('/demo/')) || new URLSearchParams(location.search).get('demo') === '1';
export const DB_NAME = isDemoMode ? 'demo:release-ledger' : 'release-ledger';
const DB_VERSION = 1;
let database: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('jobs')) db.createObjectStore('jobs', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) {
        const events = db.createObjectStore('events', { keyPath: 'id' });
        events.createIndex('jobId', 'jobId');
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your browser could not open the private local ledger. Check storage permissions and try again.'));
  });
  return database;
}

async function all<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName).objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(value);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getJobs(): Promise<Job[]> {
  return (await all<Job>('jobs')).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getJob(id: string): Promise<Job | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('jobs').objectStore('jobs').get(id);
    request.onsuccess = () => resolve(request.result as Job | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function saveJob(job: Job): Promise<void> {
  await put('jobs', job);
}

export async function getEvents(jobId?: string): Promise<LedgerEvent[]> {
  const items = await all<LedgerEvent>('events');
  return items
    .filter((item) => !jobId || item.jobId === jobId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function saveEvent(event: LedgerEvent): Promise<void> {
  await put('events', event);
}

export async function getSettings(): Promise<AppSettings> {
  const db = await openDatabase();
  return new Promise((resolve) => {
    const request = db.transaction('settings').objectStore('settings').get('app');
    request.onsuccess = () => resolve(request.result?.value ?? { theme: 'system', businessName: '' });
    request.onerror = () => resolve({ theme: 'system', businessName: '' });
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await put('settings', { key: 'app', value: settings });
}

export async function createBackup(): Promise<Backup> {
  const [jobs, events, settings] = await Promise.all([getJobs(), getEvents(), getSettings()]);
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), jobs, events, settings };
}

export async function importBackup(value: unknown): Promise<{ jobs: number; events: number }> {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Release Ledger backup.');
  const backup = value as Partial<Backup>;
  if (backup.schemaVersion !== 1 || !Array.isArray(backup.jobs) || !Array.isArray(backup.events)) {
    throw new Error('That backup format is not supported. Choose a JSON export from Release Ledger.');
  }
  const jobs = backup.jobs as Job[];
  const events = backup.events as LedgerEvent[];
  const jobIds = new Set<string>();
  for (const job of jobs) {
    if (!validJob(job) || jobIds.has(job.id)) throw new Error('The backup contains an invalid job record. Nothing was imported.');
    jobIds.add(job.id);
  }
  for (const event of events) {
    if (!validEvent(event) || !jobIds.has(event.jobId)) throw new Error('The backup contains an invalid event record. Nothing was imported.');
  }
  if (backup.settings && !validSettings(backup.settings)) throw new Error('The backup contains invalid settings. Nothing was imported.');

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['jobs', 'events', 'settings'], 'readwrite');
    const jobStore = transaction.objectStore('jobs');
    const eventStore = transaction.objectStore('events');
    for (const job of jobs) jobStore.put(job);
    for (const event of events) eventStore.put(event);
    if (backup.settings) transaction.objectStore('settings').put({ key: 'app', value: backup.settings });
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('The backup could not be imported. Nothing was changed.'));
    transaction.onerror = () => reject(transaction.error ?? new Error('The backup could not be imported. Nothing was changed.'));
  });
  return { jobs: backup.jobs.length, events: backup.events.length };
}

function validAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_AMOUNT && Number.isFinite(Math.round(value * 100));
}

function validJob(job: unknown): job is Job {
  if (!job || typeof job !== 'object') return false;
  const value = job as Partial<Job>;
  return typeof value.id === 'string' && Boolean(value.id) && typeof value.name === 'string' && Boolean(value.name.trim())
    && validAmount(value.totalAmount) && typeof value.currency === 'string' && /^[A-Z]{3}$/i.test(value.currency)
    && typeof value.archived === 'boolean' && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string';
}

function validEvent(event: unknown): event is LedgerEvent {
  if (!event || typeof event !== 'object') return false;
  const value = event as Partial<LedgerEvent>;
  return typeof value.id === 'string' && Boolean(value.id) && typeof value.jobId === 'string'
    && ['deposit', 'milestone', 'release', 'refund', 'balance'].includes(value.type ?? '')
    && validAmount(value.amount) && typeof value.date === 'string' && typeof value.createdAt === 'string'
    && (value.type !== 'release' || ['ready', 'review', 'held'].includes(value.decision ?? ''));
}

function validSettings(settings: unknown): settings is AppSettings {
  if (!settings || typeof settings !== 'object') return false;
  const value = settings as Partial<AppSettings>;
  return ['system', 'light', 'dark'].includes(value.theme ?? '') && typeof value.businessName === 'string';
}

const SAMPLE_BACKUP: Backup = {
  schemaVersion: 1,
  exportedAt: '2026-08-28T12:00:00.000Z',
  settings: { theme: 'system', businessName: 'Juniper Field Studio' },
  jobs: [
    { id: 'demo-brand', name: 'Northstar brand handoff', clientName: 'Northstar Coffee', clientEmail: 'maya@example.test', totalAmount: 2400, currency: 'USD', taxLabel: 'Sales tax', reference: 'NS-204', receiptNote: 'Final source files follow the signed handoff note.', archived: false, createdAt: '2026-08-20T09:00:00.000Z', updatedAt: '2026-08-28T10:00:00.000Z' },
    { id: 'demo-site', name: 'Harbor website launch', clientName: 'Harbor Works', clientEmail: 'accounts@example.test', totalAmount: 3600, currency: 'USD', taxLabel: 'Tax', reference: 'HW-118', receiptNote: '', archived: false, createdAt: '2026-08-18T09:00:00.000Z', updatedAt: '2026-08-27T10:00:00.000Z' },
    { id: 'demo-packaging', name: 'Cedar packaging files', clientName: 'Cedar Pantry', clientEmail: '', totalAmount: 1800, currency: 'USD', taxLabel: 'Tax', reference: 'CP-77', receiptNote: '', archived: false, createdAt: '2026-08-12T09:00:00.000Z', updatedAt: '2026-08-26T10:00:00.000Z' }
  ],
  events: [
    { id: 'de-1', jobId: 'demo-brand', type: 'deposit', amount: 1200, date: '2026-08-20', note: 'Deposit cleared', createdAt: '2026-08-20T09:30:00.000Z' },
    { id: 'de-2', jobId: 'demo-brand', type: 'milestone', amount: 1200, date: '2026-08-27', note: 'Identity files finished', createdAt: '2026-08-27T09:30:00.000Z' },
    { id: 'de-3', jobId: 'demo-site', type: 'deposit', amount: 900, date: '2026-08-18', note: '25% deposit cleared', createdAt: '2026-08-18T09:30:00.000Z' },
    { id: 'de-4', jobId: 'demo-site', type: 'milestone', amount: 1500, date: '2026-08-26', note: 'Launch build approved', createdAt: '2026-08-26T09:30:00.000Z' },
    { id: 'de-5', jobId: 'demo-site', type: 'release', amount: 0, date: '2026-08-27', note: 'Waiting for the next payment', decision: 'held', createdAt: '2026-08-27T09:30:00.000Z' },
    { id: 'de-6', jobId: 'demo-packaging', type: 'deposit', amount: 900, date: '2026-08-12', note: 'Deposit received', createdAt: '2026-08-12T09:30:00.000Z' },
    { id: 'de-7', jobId: 'demo-packaging', type: 'milestone', amount: 600, date: '2026-08-21', note: 'Print files finished', createdAt: '2026-08-21T09:30:00.000Z' },
    { id: 'de-8', jobId: 'demo-packaging', type: 'release', amount: 600, date: '2026-08-22', note: 'Print files sent', decision: 'ready', createdAt: '2026-08-22T09:30:00.000Z' },
    { id: 'de-9', jobId: 'demo-packaging', type: 'refund', amount: 50, date: '2026-08-24', note: 'Unused proofing fee returned', createdAt: '2026-08-24T09:30:00.000Z' },
    { id: 'de-10', jobId: 'demo-packaging', type: 'balance', amount: 50, date: '2026-08-25', note: 'Proofing fee replaced', createdAt: '2026-08-25T09:30:00.000Z' }
  ]
};

export async function seedDemo(force = false): Promise<void> {
  if (!isDemoMode) return;
  const db = await openDatabase();
  if (!force && (await getJobs()).length) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['jobs', 'events', 'settings'], 'readwrite');
    transaction.objectStore('jobs').clear();
    transaction.objectStore('events').clear();
    transaction.objectStore('settings').clear();
    for (const job of SAMPLE_BACKUP.jobs) transaction.objectStore('jobs').put(job);
    for (const event of SAMPLE_BACKUP.events) transaction.objectStore('events').put(event);
    transaction.objectStore('settings').put({ key: 'app', value: SAMPLE_BACKUP.settings });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function discardDemo(): Promise<void> {
  if (!isDemoMode) return;
  const db = await openDatabase();
  db.close();
  database = undefined;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other demo tabs, then try again.'));
  });
}

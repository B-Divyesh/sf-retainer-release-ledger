import type { AppSettings, Backup, Job, LedgerEvent } from './types';

const DB_NAME = 'release-ledger';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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
  for (const job of backup.jobs) {
    if (!job.id || !job.name || typeof job.totalAmount !== 'number') throw new Error('The backup contains an invalid job record.');
    await saveJob(job);
  }
  for (const event of backup.events) {
    if (!event.id || !event.jobId || typeof event.amount !== 'number') throw new Error('The backup contains an invalid event record.');
    await saveEvent(event);
  }
  if (backup.settings) await saveSettings(backup.settings);
  return { jobs: backup.jobs.length, events: backup.events.length };
}

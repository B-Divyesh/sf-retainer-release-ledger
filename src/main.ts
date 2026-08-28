import './styles.css';
import { calculateTotals, formatMoney } from './calculations';
import { createBackup, getEvents, getJob, getJobs, getSettings, importBackup, saveEvent, saveJob } from './db';
import { buyUrl, captureLicenseFromUrl, getLicenseState, storeLicense, verifyLicense } from './license';
import type { AppSettings, EventType, Job, LedgerEvent, ReleaseDecision } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('Application mount was not found.');

captureLicenseFromUrl();
let license = getLicenseState();
let storageError = '';

const eventLabels: Record<EventType, string> = {
  deposit: 'Deposit received',
  milestone: 'Milestone ready',
  release: 'Release decision',
  refund: 'Refund sent',
  balance: 'Balance payment',
};

const icon = (name: 'gate' | 'plus' | 'arrow' | 'download' | 'moon' | 'lock' | 'check') => {
  const paths = {
    gate: '<path d="M6 21V5m12 16V5M4 5h16M8 8h8v10H8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/>',
    moon: '<path d="M20 15.2A8 8 0 1 1 8.8 4 6.5 6.5 0 0 0 20 15.2Z"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};

function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function shell(content: string): string {
  return `
    <header class="site-header">
      <a class="brand route-link" href="/" aria-label="Release Ledger home">
        <span class="brand-mark">${icon('gate')}</span>
        <span>Release <i>Ledger</i></span>
      </a>
      <nav aria-label="Primary">
        <a class="route-link nav-link" href="/">Jobs</a>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Switch color theme">${icon('moon')}</button>
      </nav>
    </header>
    <div class="network-banner" id="network-banner" role="status" ${navigator.onLine ? 'hidden' : ''}>Offline — your ledger still works on this device.</div>
    ${storageError ? `<div class="error-banner" role="alert">${escapeHtml(storageError)}</div>` : ''}
    ${content}
    <footer class="site-footer">
      <p>Private by default. Your job data stays in this browser.</p>
      <div><a class="route-link" href="/privacy">Privacy</a><a class="route-link" href="/terms">Terms</a></div>
      <p class="provenance">Original threshold artwork generated for Release Ledger with Azure AI Foundry.</p>
    </footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;
}

function pathParts(): string[] {
  return location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
}

async function render(): Promise<void> {
  try {
    const [first, id] = pathParts();
    if (first === 'jobs' && id) await renderJob(id);
    else if (first === 'receipt' && id) await renderReceipt(id);
    else if (first === 'privacy') renderPrivacy();
    else if (first === 'terms') renderTerms();
    else await renderHome();
    bindCommon();
    document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  } catch (error) {
    storageError = error instanceof Error ? error.message : 'The ledger could not be loaded.';
    app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">Local storage error</p><h1>Your ledger could not open.</h1><p>${escapeHtml(storageError)}</p><button class="button" type="button" id="retry">Try again</button></main>`);
    document.querySelector('#retry')?.addEventListener('click', () => { storageError = ''; void render(); });
    bindCommon();
  }
}

async function renderHome(): Promise<void> {
  const [jobs, events, settings] = await Promise.all([getJobs(), getEvents(), getSettings()]);
  const active = jobs.filter((job) => !job.archived);
  const archived = jobs.filter((job) => job.archived);
  const totals = active.map((job) => calculateTotals(job, events));
  const attention = totals.filter((total) => total.status === 'held').length;
  const ready = totals.filter((total) => total.status === 'ready').length;

  const jobCards = active.map((job) => {
    const total = calculateTotals(job, events);
    return `<li>
      <a class="job-row route-link" href="/jobs/${encodeURIComponent(job.id)}">
        <span class="status-orb ${total.status}" aria-hidden="true"></span>
        <span class="job-row-main"><strong>${escapeHtml(job.name)}</strong><small>${escapeHtml(job.clientName || 'No client name')} · ${total.statusLabel}</small></span>
        <span class="job-row-money"><strong>${escapeHtml(formatMoney(total.payable, job.currency))}</strong><small>still payable</small></span>
        <span class="row-arrow">${icon('arrow')}</span>
      </a>
    </li>`;
  }).join('');

  app.innerHTML = shell(`
    <main id="main" tabindex="-1">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">A local release record</p>
          <h1 id="page-title">Know what can cross the gate.</h1>
          <p class="lede">Track deposits against finished work, record the release decision, and keep every handoff explainable.</p>
          <div class="hero-actions">
            <button class="button primary" id="new-job" type="button">${icon('plus')} Create job</button>
            <button class="button quiet" id="import-trigger" type="button">Import backup</button>
            <input id="import-file" type="file" accept="application/json" hidden />
          </div>
          <p class="local-note">${icon('lock')} No account. No bank connection. No money held here.</p>
        </div>
        <picture class="hero-art">
          <source media="(max-width: 640px)" srcset="/assets/threshold-garden-720.webp" />
          <img src="/assets/threshold-garden-1200.webp" width="1200" height="800" alt="A paper island with stepping stones leading through a brass gate to a safely wrapped portfolio parcel" fetchpriority="high" decoding="async" />
        </picture>
      </section>

      <section class="workspace" aria-labelledby="jobs-heading">
        <div class="section-heading">
          <div><p class="eyebrow">Current folio</p><h2 id="jobs-heading">Active jobs</h2></div>
          ${active.length ? `<div class="summary-strip"><span><strong>${ready}</strong> ready</span><span><strong>${attention}</strong> held</span><span><strong>${active.length}</strong> total</span></div>` : ''}
        </div>
        ${active.length ? `<ul class="job-list">${jobCards}</ul>` : `
          <div class="empty-state">
            <span class="empty-number" aria-hidden="true">01</span>
            <div><h3>Begin with the agreement.</h3><p>Create a job with its agreed total. Then record the deposit and each completed milestone as they happen.</p><button class="text-button" id="empty-new-job" type="button">Create your first job ${icon('arrow')}</button></div>
          </div>`}
        ${archived.length ? `<details class="archive"><summary>${archived.length} archived ${archived.length === 1 ? 'job' : 'jobs'}</summary><ul class="job-list compact">${archived.map((job) => `<li><a class="job-row route-link" href="/jobs/${encodeURIComponent(job.id)}"><span class="job-row-main"><strong>${escapeHtml(job.name)}</strong><small>${escapeHtml(job.clientName)}</small></span><span class="row-arrow">${icon('arrow')}</span></a></li>`).join('')}</ul></details>` : ''}
      </section>

      <section class="ownership" aria-labelledby="ownership-heading">
        <div><p class="eyebrow">Your records, portable</p><h2 id="ownership-heading">Keep an exit copy.</h2><p>Export every job and event as a JSON backup, or take the full event ledger to a spreadsheet. Export is always free.</p></div>
        <div class="ownership-actions"><button class="button" id="export-json" type="button">${icon('download')} Export backup</button><button class="button quiet" id="export-csv" type="button">Export CSV</button></div>
      </section>

      ${upgradeSection(active.length)}
      ${jobDialog(settings)}
    </main>
  `);

  const openCreate = () => {
    if (!license.unlocked && active.length >= 3) {
      document.querySelector('#unlock')?.scrollIntoView({ behavior: 'smooth' });
      showToast('The free ledger includes three active jobs. Archive one or unlock unlimited jobs.');
      return;
    }
    document.querySelector<HTMLDialogElement>('#job-dialog')?.showModal();
  };
  document.querySelector('#new-job')?.addEventListener('click', openCreate);
  document.querySelector('#empty-new-job')?.addEventListener('click', openCreate);
  bindDialog('#job-dialog');
  document.querySelector<HTMLFormElement>('#job-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const now = new Date().toISOString();
    const job: Job = {
      id: crypto.randomUUID(), name: required(form, 'name'), clientName: String(form.get('clientName') ?? '').trim(),
      clientEmail: String(form.get('clientEmail') ?? '').trim(), totalAmount: numberValue(form, 'totalAmount'),
      currency: String(form.get('currency') ?? 'USD').trim().toUpperCase(), taxLabel: String(form.get('taxLabel') ?? 'Tax').trim(),
      reference: String(form.get('reference') ?? '').trim(), receiptNote: '', archived: false, createdAt: now, updatedAt: now,
    };
    await saveJob(job);
    navigate(`/jobs/${job.id}`);
  });
  document.querySelector('#export-json')?.addEventListener('click', () => void exportJson());
  document.querySelector('#export-csv')?.addEventListener('click', () => void exportCsv());
  document.querySelector('#import-trigger')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#import-file')?.click());
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', importFile);
  bindLicense();
}

function jobDialog(settings: AppSettings): string {
  return `<dialog id="job-dialog" aria-labelledby="job-dialog-title">
    <form method="dialog" class="dialog-card" id="job-form">
      <div class="dialog-heading"><div><p class="eyebrow">New ledger</p><h2 id="job-dialog-title">Create a job</h2></div><button class="icon-button dialog-close" type="button" aria-label="Close">×</button></div>
      <div class="field"><label for="job-name">Job name <span aria-hidden="true">*</span></label><input id="job-name" name="name" required autocomplete="off" /></div>
      <div class="two-fields"><div class="field"><label for="client-name">Client name</label><input id="client-name" name="clientName" autocomplete="name" /></div><div class="field"><label for="client-email">Client email</label><input id="client-email" type="email" name="clientEmail" autocomplete="email" /></div></div>
      <div class="money-fields"><div class="field amount-field"><label for="total-amount">Agreed total <span aria-hidden="true">*</span></label><input id="total-amount" type="number" name="totalAmount" required min="0" step="0.01" inputmode="decimal" /></div><div class="field currency-field"><label for="currency">Currency</label><input id="currency" name="currency" value="USD" maxlength="3" required /></div><div class="field"><label for="tax-label">Tax label</label><input id="tax-label" name="taxLabel" value="Tax" /></div></div>
      <div class="field"><label for="reference">Reference or PO</label><input id="reference" name="reference" /></div>
      ${settings.businessName ? `<p class="form-note">Receipt business: ${escapeHtml(settings.businessName)}</p>` : ''}
      <p class="form-note">Amounts are records only. Release Ledger does not hold funds or process payments.</p>
      <div class="dialog-actions"><button class="button quiet dialog-close" type="button">Cancel</button><button class="button primary" type="submit">Create job</button></div>
    </form>
  </dialog>`;
}

function upgradeSection(activeCount: number): string {
  if (license.unlocked) return `<section class="unlock unlocked" id="unlock"><span class="seal">${icon('check')}</span><div><p class="eyebrow">Owner edition</p><h2>Unlimited ledgers unlocked</h2><p>Your license is stored on this device. ${escapeHtml(license.notice)}</p></div></section>`;
  return `<section class="unlock" id="unlock">
    <div><p class="eyebrow">Owner edition · $24 once</p><h2>Keep every job in one folio.</h2><p>The free ledger includes three active jobs (${activeCount}/3 used). A one-time purchase unlocks unlimited active jobs and custom receipt notes. CSV and JSON exports always remain free.</p><p class="merchant-note">Sociobot / Dodo is the merchant of record. No subscription.</p></div>
    <div class="unlock-actions"><a class="button primary" href="${buyUrl}">Buy once for $24</a><button class="text-button" id="restore-toggle" type="button">Have a license?</button><form id="license-form" class="license-form" hidden><label for="license-token">License token</label><div><input id="license-token" name="license" required autocomplete="off" /><button class="button" type="submit">Verify</button></div></form>${license.notice ? `<p class="license-notice" role="status">${escapeHtml(license.notice)} <a href="${buyUrl}">Buy again</a></p>` : ''}</div>
  </section>`;
}

async function renderJob(id: string): Promise<void> {
  const [job, events, settings] = await Promise.all([getJob(id), getEvents(id), getSettings()]);
  if (!job) { renderNotFound(); return; }
  const total = calculateTotals(job, events);
  const eventRows = events.map((entry) => `<li class="event-row">
    <span class="event-glyph type-${entry.type}">${eventGlyph(entry.type)}</span>
    <div class="event-copy"><strong>${eventLabels[entry.type]}</strong><span>${escapeHtml(entry.note || defaultEventNote(entry))}${entry.decision ? ` · ${escapeHtml(entry.decision)}` : ''}</span></div>
    <time datetime="${escapeHtml(entry.date)}">${formatDate(entry.date)}</time>
    <strong class="event-amount">${entry.amount ? escapeHtml(formatMoney(entry.amount, job.currency)) : '—'}</strong>
  </li>`).join('');

  app.innerHTML = shell(`
    <main id="main" tabindex="-1" class="job-page">
      <div class="crumb"><a class="route-link" href="/">← All jobs</a><span>${escapeHtml(job.reference || 'No reference')}</span></div>
      <section class="job-title">
        <div><p class="eyebrow">${job.archived ? 'Archived ledger' : 'Active ledger'}</p><h1>${escapeHtml(job.name)}</h1><p>${escapeHtml(job.clientName || 'Client not named')}${job.clientEmail ? ` · <a href="mailto:${escapeHtml(job.clientEmail)}">${escapeHtml(job.clientEmail)}</a>` : ''}</p></div>
        <div class="job-actions"><a class="button quiet route-link" href="/receipt/${encodeURIComponent(job.id)}">Client receipt</a><button class="button quiet" id="edit-job" type="button">Edit details</button></div>
      </section>

      <section class="verdict ${total.status}" aria-labelledby="verdict-heading">
        <div class="verdict-mark"><span>${statusIcon(total.status)}</span><small>Release status</small></div>
        <div><h2 id="verdict-heading">${total.statusLabel}</h2><p>${escapeHtml(total.statusReason)}</p></div>
        <button class="button verdict-action" id="record-event" type="button">${icon('plus')} Record event</button>
      </section>

      <section class="balance-grid" aria-label="Job balances">
        <div><small>Received net</small><strong>${escapeHtml(formatMoney(total.paid, job.currency))}</strong><span>Deposits + balance − refunds</span></div>
        <div><small>Available to cover work</small><strong>${escapeHtml(formatMoney(total.available, job.currency))}</strong><span>Received net − already released</span></div>
        <div><small>Still payable</small><strong>${escapeHtml(formatMoney(total.payable, job.currency))}</strong><span>Agreed ${escapeHtml(formatMoney(job.totalAmount, job.currency))}</span></div>
        <div><small>Pending milestone work</small><strong>${escapeHtml(formatMoney(total.pendingWork, job.currency))}</strong><span>Ready − released</span></div>
      </section>

      <section class="ledger-section" aria-labelledby="events-heading">
        <div class="section-heading"><div><p class="eyebrow">Audit trail</p><h2 id="events-heading">Ledger events</h2></div><button class="text-button" id="record-event-secondary" type="button">Record event ${icon('arrow')}</button></div>
        ${events.length ? `<ol class="event-list">${eventRows}</ol>` : `<div class="ledger-empty"><p>No entries yet. Record the deposit or first milestone to calculate release coverage.</p></div>`}
      </section>

      <section class="job-settings">
        <div><h2>Ledger controls</h2><p>${escapeHtml(job.taxLabel || 'Tax')} is kept as your chosen label; all amounts entered should follow the total you agreed with the client.</p></div>
        <div><button class="button quiet" id="job-csv" type="button">Export this job</button><button class="button quiet" id="archive-job" type="button">${job.archived ? 'Restore job' : 'Archive job'}</button></div>
      </section>
      ${eventDialog(job)}
      ${editJobDialog(job, settings)}
    </main>
  `);

  const openEvent = () => document.querySelector<HTMLDialogElement>('#event-dialog')?.showModal();
  document.querySelector('#record-event')?.addEventListener('click', openEvent);
  document.querySelector('#record-event-secondary')?.addEventListener('click', openEvent);
  bindDialog('#event-dialog');
  bindDialog('#edit-job-dialog');
  bindEventForm(job);
  document.querySelector('#edit-job')?.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#edit-job-dialog')?.showModal());
  document.querySelector<HTMLFormElement>('#edit-job-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement);
    await saveJob({ ...job, name: required(form, 'name'), clientName: String(form.get('clientName') ?? '').trim(), clientEmail: String(form.get('clientEmail') ?? '').trim(), totalAmount: numberValue(form, 'totalAmount'), currency: required(form, 'currency').toUpperCase(), taxLabel: String(form.get('taxLabel') ?? '').trim(), reference: String(form.get('reference') ?? '').trim(), receiptNote: String(form.get('receiptNote') ?? '').trim(), updatedAt: new Date().toISOString() });
    showToast('Job details saved.'); await render();
  });
  document.querySelector('#archive-job')?.addEventListener('click', async () => {
    await saveJob({ ...job, archived: !job.archived, updatedAt: new Date().toISOString() });
    showToast(job.archived ? 'Job restored.' : 'Job archived. You can restore it later.'); await render();
  });
  document.querySelector('#job-csv')?.addEventListener('click', () => exportCsv(job.id));
}

function eventDialog(job: Job): string {
  return `<dialog id="event-dialog" aria-labelledby="event-dialog-title"><form method="dialog" id="event-form" class="dialog-card">
    <div class="dialog-heading"><div><p class="eyebrow">${escapeHtml(job.name)}</p><h2 id="event-dialog-title">Record an event</h2></div><button class="icon-button dialog-close" type="button" aria-label="Close">×</button></div>
    <div class="field"><label for="event-type">Event type</label><select id="event-type" name="type">${Object.entries(eventLabels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select><p class="field-help" id="event-help">Money received at the start of the job.</p></div>
    <div class="two-fields"><div class="field"><label for="event-amount">Amount (${escapeHtml(job.currency)})</label><input id="event-amount" type="number" name="amount" min="0" step="0.01" inputmode="decimal" required /></div><div class="field"><label for="event-date">Date</label><input id="event-date" type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" required /></div></div>
    <fieldset id="decision-fields" hidden><legend>Decision recorded</legend><div class="decision-options"><label><input type="radio" name="decision" value="ready" /> Ready</label><label><input type="radio" name="decision" value="review" /> Review</label><label><input type="radio" name="decision" value="held" /> Hold</label></div><p class="field-help">Use amount 0 to record a decision without handing work over.</p></fieldset>
    <div class="field"><label for="event-note">Note</label><textarea id="event-note" name="note" rows="3" placeholder="What changed or what was agreed?"></textarea></div>
    <p class="form-error" id="event-error" role="alert"></p>
    <div class="dialog-actions"><button class="button quiet dialog-close" type="button">Cancel</button><button class="button primary" type="submit">Save event</button></div>
  </form></dialog>`;
}

function editJobDialog(job: Job, settings: AppSettings): string {
  return `<dialog id="edit-job-dialog" aria-labelledby="edit-job-title"><form method="dialog" id="edit-job-form" class="dialog-card">
    <div class="dialog-heading"><div><p class="eyebrow">Job settings</p><h2 id="edit-job-title">Edit details</h2></div><button class="icon-button dialog-close" type="button" aria-label="Close">×</button></div>
    <div class="field"><label for="edit-name">Job name</label><input id="edit-name" name="name" value="${escapeHtml(job.name)}" required /></div>
    <div class="two-fields"><div class="field"><label for="edit-client">Client name</label><input id="edit-client" name="clientName" value="${escapeHtml(job.clientName)}" /></div><div class="field"><label for="edit-email">Client email</label><input id="edit-email" type="email" name="clientEmail" value="${escapeHtml(job.clientEmail)}" /></div></div>
    <div class="money-fields"><div class="field amount-field"><label for="edit-total">Agreed total</label><input id="edit-total" type="number" name="totalAmount" min="0" step="0.01" value="${job.totalAmount}" required /></div><div class="field currency-field"><label for="edit-currency">Currency</label><input id="edit-currency" name="currency" maxlength="3" value="${escapeHtml(job.currency)}" required /></div><div class="field"><label for="edit-tax">Tax label</label><input id="edit-tax" name="taxLabel" value="${escapeHtml(job.taxLabel)}" /></div></div>
    <div class="field"><label for="edit-reference">Reference or PO</label><input id="edit-reference" name="reference" value="${escapeHtml(job.reference)}" /></div>
    <div class="field"><label for="receipt-note">Receipt note ${license.unlocked ? '' : '<span class="paid-label">Owner</span>'}</label><textarea id="receipt-note" name="receiptNote" rows="3" ${license.unlocked ? '' : 'disabled'}>${escapeHtml(job.receiptNote)}</textarea></div>
    <div class="field"><label for="business-name">Business name</label><input id="business-name" value="${escapeHtml(settings.businessName)}" disabled /><p class="field-help">Business name can be set after importing an Owner backup. v1 receipts default to Release Ledger.</p></div>
    <div class="dialog-actions"><button class="button quiet dialog-close" type="button">Cancel</button><button class="button primary" type="submit">Save details</button></div>
  </form></dialog>`;
}

function bindEventForm(job: Job): void {
  const type = document.querySelector<HTMLSelectElement>('#event-type');
  const decision = document.querySelector<HTMLElement>('#decision-fields');
  const help = document.querySelector<HTMLElement>('#event-help');
  const amount = document.querySelector<HTMLInputElement>('#event-amount');
  const helps: Record<EventType, string> = {
    deposit: 'Money received at the start of the job.',
    milestone: 'Value of work now complete and ready to consider releasing.',
    release: 'A decision and the value of work actually handed over. Use 0 if nothing was sent.',
    refund: 'Money returned to the client; this reduces available coverage.',
    balance: 'A later payment received from the client.',
  };
  const sync = () => {
    const selected = type?.value as EventType;
    if (help) help.textContent = helps[selected];
    if (decision) decision.hidden = selected !== 'release';
    if (amount) amount.min = selected === 'release' ? '0' : '0.01';
  };
  type?.addEventListener('change', sync); sync();
  document.querySelector<HTMLFormElement>('#event-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const selected = required(form, 'type') as EventType;
    const amountValue = numberValue(form, 'amount'); const decisionValue = form.get('decision') as ReleaseDecision | null;
    const error = document.querySelector<HTMLElement>('#event-error');
    if (selected !== 'release' && amountValue <= 0) { if (error) error.textContent = 'Enter an amount greater than zero.'; return; }
    if (selected === 'release' && !decisionValue) { if (error) error.textContent = 'Choose the release decision you made.'; return; }
    const entry: LedgerEvent = { id: crypto.randomUUID(), jobId: job.id, type: selected, amount: amountValue, date: required(form, 'date'), note: String(form.get('note') ?? '').trim(), decision: selected === 'release' ? decisionValue ?? undefined : undefined, createdAt: new Date().toISOString() };
    await saveEvent(entry); await saveJob({ ...job, updatedAt: new Date().toISOString() });
    showToast(`${eventLabels[selected]} recorded.`); await render();
  });
}

async function renderReceipt(id: string): Promise<void> {
  const [job, events, settings] = await Promise.all([getJob(id), getEvents(id), getSettings()]);
  if (!job) { renderNotFound(); return; }
  const total = calculateTotals(job, events);
  app.innerHTML = shell(`<main id="main" tabindex="-1" class="receipt-page">
    <div class="receipt-toolbar"><a class="route-link" href="/jobs/${encodeURIComponent(job.id)}">← Back to job</a><button class="button primary" id="print-receipt" type="button">Print / save PDF</button></div>
    <article class="receipt-sheet">
      <header><div><p class="eyebrow">Client receipt</p><h1>${escapeHtml(job.name)}</h1><p>Prepared for ${escapeHtml(job.clientName || 'client')}</p></div><div class="receipt-brand"><span>${icon('gate')}</span><strong>${escapeHtml(settings.businessName || 'Release Ledger')}</strong></div></header>
      <dl class="receipt-meta"><div><dt>Reference</dt><dd>${escapeHtml(job.reference || '—')}</dd></div><div><dt>Issued</dt><dd>${formatDate(new Date().toISOString().slice(0, 10))}</dd></div><div><dt>Currency</dt><dd>${escapeHtml(job.currency)}</dd></div><div><dt>${escapeHtml(job.taxLabel || 'Tax')}</dt><dd>Included as agreed</dd></div></dl>
      <section class="receipt-total"><div><small>Payments received, net of refunds</small><strong>${escapeHtml(formatMoney(total.paid, job.currency))}</strong></div><div><small>Remaining on agreed total</small><strong>${escapeHtml(formatMoney(total.payable, job.currency))}</strong></div></section>
      <section><h2>Record</h2><table><thead><tr><th>Date</th><th>Entry</th><th>Note</th><th>Amount</th></tr></thead><tbody>${events.map((entry) => `<tr><td>${formatDate(entry.date)}</td><td>${eventLabels[entry.type]}</td><td>${escapeHtml(entry.note || defaultEventNote(entry))}</td><td>${entry.amount ? escapeHtml(formatMoney(entry.amount, job.currency)) : '—'}</td></tr>`).join('') || '<tr><td colspan="4">No entries recorded.</td></tr>'}</tbody></table></section>
      ${job.receiptNote ? `<p class="receipt-note">${escapeHtml(job.receiptNote)}</p>` : ''}
      <footer><p>This receipt reports entries recorded by the service provider. Release Ledger does not process or hold funds and is not an escrow service.</p><p>Generated locally · ${escapeHtml(location.host || 'Release Ledger')}</p></footer>
    </article>
  </main>`);
  document.querySelector('#print-receipt')?.addEventListener('click', () => window.print());
}

function renderPrivacy(): void {
  app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">Plain-language policy</p><h1>Privacy lives on your device.</h1><p class="lede">Release Ledger is designed so the factory never needs your clients’ details.</p><h2>What is stored</h2><p>Jobs, client contact details, money amounts, notes, settings, and license tokens are stored in your browser using IndexedDB or localStorage. They do not leave the device unless you export them or use license verification.</p><h2>License verification</h2><p>If you add an Owner license, the token is sent to the Sociobot billing API at most once per day to check whether it is active. Sociobot / Dodo is the merchant of record for purchases.</p><h2>What we do not do</h2><p>There is no advertising, behavioral analytics, bank connection, card entry, or remote copy of your ledger. Release Ledger never holds money.</p><h2>Your control</h2><p>Use “Export backup” to take a copy. To remove local data, clear site data for this domain in your browser. Removing a site or browser profile can erase data, so export first.</p><p class="legal-date">Effective 28 August 2026 · <a class="route-link" href="/">Return to ledger</a></p></main>`);
}

function renderTerms(): void {
  app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">Terms of use</p><h1>A record, not an escrow.</h1><p class="lede">Release Ledger helps you document your own decisions. It does not provide financial, legal, accounting, payment, collection, or escrow services.</p><h2>Your responsibility</h2><p>You are responsible for checking entries, backups, contracts, taxes, and release decisions. A green status reflects only the values you entered; it is not a guarantee that a payment cannot be reversed or disputed.</p><h2>Local data</h2><p>Your browser stores the ledger. Keep backups suitable for your obligations. The software is provided “as is,” without warranties, to the extent permitted by law.</p><h2>Owner license</h2><p>Owner edition is a one-time $24 purchase that unlocks unlimited active jobs and custom receipt notes for this product. Sociobot / Dodo is the merchant of record. Refunds are handled by the merchant and revoke the corresponding license.</p><h2>Acceptable use</h2><p>Do not use Release Ledger to misrepresent payments, impersonate an escrow provider, or create deceptive receipts.</p><p class="legal-date">Effective 28 August 2026 · <a class="route-link" href="/privacy">Read privacy</a></p></main>`);
}

function renderNotFound(): void {
  app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">404 · Missing folio</p><h1>That ledger is not on this device.</h1><p>It may live in another browser or have been cleared. Import a backup or return to your jobs.</p><a class="button primary route-link" href="/">Return to jobs</a></main>`);
}

function bindCommon(): void {
  document.querySelectorAll<HTMLAnchorElement>('a.route-link').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link.pathname);
  }));
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'light' : 'dark'; localStorage.setItem('release-ledger-theme', dark ? 'light' : 'dark');
  });
}

function bindDialog(selector: string): void {
  const dialog = document.querySelector<HTMLDialogElement>(selector);
  dialog?.querySelectorAll('.dialog-close').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

function bindLicense(): void {
  const form = document.querySelector<HTMLFormElement>('#license-form');
  document.querySelector('#restore-toggle')?.addEventListener('click', () => { if (form) { form.hidden = !form.hidden; if (!form.hidden) form.querySelector<HTMLInputElement>('input')?.focus(); } });
  form?.addEventListener('submit', async (event) => {
    event.preventDefault(); const token = required(new FormData(event.currentTarget as HTMLFormElement), 'license'); storeLicense(token); license = await verifyLicense(true); showToast(license.unlocked ? 'Owner edition unlocked.' : 'That license is not active.'); await render();
  });
}

function required(form: FormData, key: string): string {
  const value = String(form.get(key) ?? '').trim(); if (!value) throw new Error(`Please complete ${key}.`); return value;
}
function numberValue(form: FormData, key: string): number { const value = Number(form.get(key)); if (!Number.isFinite(value) || value < 0) throw new Error('Enter a valid amount.'); return Math.round(value * 100) / 100; }
function formatDate(date: string): string { return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`)); }
function defaultEventNote(entry: LedgerEvent): string { return entry.type === 'release' ? 'Release decision recorded' : 'No note'; }
function eventGlyph(type: EventType): string { return ({ deposit: '+', balance: '+', milestone: '◇', release: '→', refund: '−' } as const)[type]; }
function statusIcon(status: ReleaseDecision): string { return status === 'ready' ? '✓' : status === 'held' ? '!' : '…'; }
function navigate(path: string): void { history.pushState({}, '', path); window.scrollTo(0, 0); void render(); }
function showToast(message: string): void { const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return; toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 3600); }

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportJson(): Promise<void> { download(`release-ledger-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(await createBackup(), null, 2), 'application/json'); showToast('Backup exported.'); }
async function exportCsv(jobId?: string): Promise<void> {
  const [jobs, events] = await Promise.all([getJobs(), getEvents()]); const relevantJobs = jobId ? jobs.filter((job) => job.id === jobId) : jobs; const ids = new Set(relevantJobs.map((job) => job.id));
  const header = ['Job', 'Client', 'Reference', 'Currency', 'Agreed total', 'Date', 'Event', 'Amount', 'Decision', 'Note'];
  const rows = events.filter((entry) => ids.has(entry.jobId)).map((entry) => { const job = relevantJobs.find((item) => item.id === entry.jobId)!; return [job.name, job.clientName, job.reference, job.currency, job.totalAmount, entry.date, eventLabels[entry.type], entry.amount, entry.decision ?? '', entry.note]; });
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'); download(`release-ledger${jobId ? '-job' : ''}.csv`, csv, 'text/csv;charset=utf-8'); showToast('CSV exported.');
}
async function importFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try { const result = await importBackup(JSON.parse(await file.text())); showToast(`Imported ${result.jobs} jobs and ${result.events} events.`); await render(); } catch (error) { showToast(error instanceof Error ? error.message : 'Import failed.'); } finally { input.value = ''; }
}

function applyTheme(): void { const saved = localStorage.getItem('release-ledger-theme'); if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved; }
applyTheme();
window.addEventListener('popstate', () => void render());
window.addEventListener('online', () => { const banner = document.querySelector<HTMLElement>('#network-banner'); if (banner) banner.hidden = true; showToast('Back online.'); });
window.addEventListener('offline', () => { const banner = document.querySelector<HTMLElement>('#network-banner'); if (banner) banner.hidden = false; });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('An update is ready. Reload to use it.'); });
      });
    }).catch(() => { /* The ledger remains usable without install support. */ });
  });
}

void render();
void verifyLicense().then((state) => { license = state; });

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a job, announces an entry, and produces a receipt', async ({ page }) => {
  const errors: string[] = []; page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/'); await page.getByRole('button', { name: 'Create job' }).click(); await page.getByLabel('Job name').fill('Brand identity handoff'); await page.getByLabel('Client name').fill('Northstar Studio'); await page.getByLabel('Client email').fill('hello@example.test'); await page.getByLabel('Agreed total').fill('1200'); await page.getByRole('button', { name: 'Create job' }).last().click();
  await page.getByRole('button', { name: 'Record entry' }).first().click(); await page.getByLabel('Amount (USD)').fill('600'); await page.getByLabel('Note', { exact: true }).fill('Deposit cleared'); await page.getByRole('button', { name: 'Save entry' }).click(); await expect(page.locator('#toast')).toContainText('Deposit received recorded.');
  await page.getByRole('button', { name: 'Record entry' }).first().click(); await page.getByLabel('Entry type').selectOption('milestone'); await page.getByLabel('Amount (USD)').fill('600'); await page.getByRole('button', { name: 'Save entry' }).click(); await expect(page.getByRole('heading', { name: 'Ready to release' })).toBeVisible();
  await page.getByRole('link', { name: 'Client receipt' }).click(); await expect(page).toHaveTitle('Receipt for Brand identity handoff — Release Ledger'); expect(errors).toEqual([]);
});

test('route metadata, focus, navigation, and not-found state work', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('body')).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByLabel('Primary').getByRole('link', { name: 'Privacy' }).click(); await expect(page).toHaveTitle('Privacy — Release Ledger'); await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack(); await expect(page.getByRole('heading', { level: 1 })).toBeFocused(); await page.goto('/not-a-real-route'); await expect(page).toHaveTitle('Page not found — Release Ledger'); await expect(page.getByRole('heading', { name: 'This page is not in the ledger' })).toBeVisible();
});

test('invalid import is atomic, extreme amounts are blocked, and CSV cells are inert', async ({ page }) => {
  await page.goto('/'); const invalid = { schemaVersion: 1, exportedAt: new Date().toISOString(), settings: { theme: 'system', businessName: '' }, jobs: [{ id: 'valid-prefix', name: 'Partially persisted', clientName: '', clientEmail: '', totalAmount: 100, currency: 'USD', taxLabel: 'Tax', reference: '', receiptNote: '', archived: false, createdAt: '', updatedAt: '' }, { id: '', name: '', totalAmount: 4 }], events: [] };
  await page.locator('#import-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) }); await expect(page.locator('#toast')).toContainText('Nothing was imported');
  expect(await page.evaluate(async () => new Promise<number>((resolve, reject) => { const open = indexedDB.open('release-ledger'); open.onsuccess = () => { const request = open.result.transaction('jobs').objectStore('jobs').count(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }; }))).toBe(0);
  await page.getByRole('button', { name: 'Create job' }).click(); await page.getByLabel('Job name').fill('=HYPERLINK("https://example.test")'); await page.getByLabel('Agreed total').fill('1e308'); expect(await page.getByLabel('Agreed total').evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false); await page.getByLabel('Agreed total').fill('100'); await page.getByRole('button', { name: 'Create job' }).last().click();
  await page.getByRole('button', { name: 'Record entry' }).first().click(); await page.getByLabel('Amount (USD)').fill('100'); await page.getByLabel('Note', { exact: true }).fill('+SUM(1,1)'); await page.getByRole('button', { name: 'Save entry' }).click(); const promised = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export this job' }).click(); const stream = await (await promised).createReadStream(); const csv = Buffer.concat(await stream.toArray()).toString(); expect(csv).toContain("'=HYPERLINK"); expect(csv).toContain("'+SUM");
});

test('all pages have no serious or critical axe violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/not-a-real-route']) { await page.goto(path); const results = await new AxeBuilder({ page }).analyze(); expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), path).toEqual([]); }
});

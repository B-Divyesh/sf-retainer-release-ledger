import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a job, records coverage, and produces a receipt', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Create job' }).first().click();
  await page.getByLabel('Job name').fill('Brand identity handoff');
  await page.getByLabel('Client name').fill('Northstar Studio');
  await page.getByLabel('Client email').fill('hello@example.test');
  await page.getByLabel('Agreed total').fill('1200');
  await page.getByRole('button', { name: 'Create job' }).last().click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brand identity handoff');
  await expect(page.getByText('Review next step')).toBeVisible();

  await page.getByRole('button', { name: 'Record event' }).first().click();
  await page.getByLabel('Amount (USD)').fill('600');
  await page.getByLabel('Note', { exact: true }).fill('Deposit cleared');
  await page.getByRole('button', { name: 'Save event' }).click();

  await page.getByRole('button', { name: 'Record event' }).first().click();
  await page.getByLabel('Event type').selectOption('milestone');
  await page.getByLabel('Amount (USD)').fill('600');
  await page.getByLabel('Note', { exact: true }).fill('Final files prepared');
  await page.getByRole('button', { name: 'Save event' }).click();

  await expect(page.getByRole('heading', { name: 'Ready to release' })).toBeVisible();
  await expect(page.locator('.balance-grid')).toContainText('$600.00');

  await page.getByRole('link', { name: 'Client receipt' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brand identity handoff');
  await expect(page.getByText('Northstar Studio')).toBeVisible();
  expect(errors).toEqual([]);
});

test('home and legal pages have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  const home = await new AxeBuilder({ page }).exclude('picture').analyze();
  expect(home.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy lives on your device.');
  const privacy = await new AxeBuilder({ page }).analyze();
  expect(privacy.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('dark treatment keeps accessible contrast', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('installed app shell and records survive offline reload', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.getByRole('button', { name: 'Create job' }).first().click();
  await page.getByLabel('Job name').fill('Offline editorial');
  await page.getByLabel('Agreed total').fill('800');
  await page.getByRole('button', { name: 'Create job' }).last().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offline editorial');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offline editorial');
  await expect(page.getByText(/Offline — your ledger still works/)).toBeVisible();
});

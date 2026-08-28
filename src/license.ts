const SLUG = 'retainer-release-ledger';
const API_BASE = (import.meta.env.VITE_BILLING_API_BASE as string | undefined) ?? 'https://api.sociobot.in';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

export interface LicenseState {
  unlocked: boolean;
  checking: boolean;
  notice: string;
}

interface CachedVerdict {
  valid: boolean;
  checkedAt: number;
}

export const buyUrl = `${API_BASE}/api/v1/products/${SLUG}/checkout`;

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function getLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, checking: false, notice: '' };
  const cached = getCached();
  if (cached?.valid) return { unlocked: true, checking: Date.now() - cached.checkedAt >= DAY, notice: '' };
  if (cached && !cached.valid) return { unlocked: false, checking: false, notice: 'License no longer active.' };
  return { unlocked: true, checking: true, notice: 'Checking license…' };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return getLicenseState();
  const cached = getCached();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return getLicenseState();
  try {
    const response = await fetch(`${API_BASE}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies CachedVerdict));
    return result.valid
      ? { unlocked: true, checking: false, notice: '' }
      : { unlocked: false, checking: false, notice: 'License no longer active.' };
  } catch {
    return cached?.valid
      ? { unlocked: true, checking: false, notice: 'Offline — using your last verified license.' }
      : { unlocked: true, checking: false, notice: 'License will be verified when you are online.' };
  }
}

function getCached(): CachedVerdict | null {
  try {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as CachedVerdict | null;
  } catch {
    return null;
  }
}

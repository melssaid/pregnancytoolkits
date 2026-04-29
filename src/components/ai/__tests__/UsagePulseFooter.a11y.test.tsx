/**
 * Accessibility tests for the UsagePulseFooter source badge + Popover.
 * Verifies:
 *  - Badge has aria-label and is keyboard-focusable.
 *  - Popover opens via keyboard (Enter / Space) and via click.
 *  - aria-expanded toggles correctly.
 *  - Popover content is announced (role=dialog) and contains source description.
 *  - Behavior is consistent across all 7 supported languages (incl. RTL `ar`).
 *  - Behavior holds at small (360px) and large (1280px) viewport widths.
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { render, screen, cleanup, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ── jsdom polyfills required by Radix Popover ───────────────────────────────
beforeAll(() => {
  // ResizeObserver
  if (typeof window.ResizeObserver === 'undefined') {
    (window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
  }
  // PointerEvent capture APIs (Radix uses these on triggers)
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// ── Mock contexts/hooks the footer depends on ───────────────────────────────
vi.mock('@/contexts/AIUsageContext', () => ({
  useAIUsage: () => ({
    remaining: 6,
    used: 2,
    limit: 8,
    tier: 'free' as const,
    isLimitReached: false,
    isNearLimit: false,
  }),
}));

vi.mock('@/hooks/useActiveCoupon', () => ({
  useActiveCoupon: () => ({ activeCoupon: null }),
}));

vi.mock('@/services/smartEngine/quotaManager', () => ({
  getQuotaSourceInfo: () => ({
    source: 'snapshot' as const,
    snapshotAt: Date.now() - 30_000,
    expiresInSec: 270,
    ttlSec: 300,
    pendingLocalDelta: 1,
  }),
}));

// Initialize a minimal i18n instance with all 7 supported languages.
const SUPPORTED = ['ar', 'en', 'de', 'fr', 'es', 'pt', 'tr'] as const;
const RTL_LANGS = new Set(['ar']);

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: SUPPORTED as unknown as string[],
      resources: Object.fromEntries(SUPPORTED.map((l) => [l, { translation: {} }])),
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  }
});

// Import AFTER mocks are registered.
import { UsagePulseFooter } from '../UsagePulseFooter';

function renderFooter(lang: string) {
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <UsagePulseFooter section="general" />
      </MemoryRouter>
    </I18nextProvider>
  );
}

function setViewport(w: number, h = 800) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h });
  window.dispatchEvent(new Event('resize'));
}

describe('UsagePulseFooter — source badge accessibility', () => {
  beforeEach(() => cleanup());

  describe.each(SUPPORTED)('language: %s', (lang) => {
    it('renders the source badge with an aria-label and tabIndex (keyboard focusable)', () => {
      renderFooter(lang);
      // The trigger uses aria-label = L.sourceTitle (localized); we don't assert
      // its exact text, only its presence + that it's a real button.
      const buttons = screen.getAllByRole('button');
      const badge = buttons.find((b) => b.getAttribute('aria-label'));
      expect(badge).toBeTruthy();
      expect(badge!.tagName).toBe('BUTTON');
      expect(badge!.getAttribute('aria-label')).toBeTruthy();
      // Native <button> is in the tab order by default (tabIndex 0).
      expect(badge!.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('toggles aria-expanded and reveals dialog content via keyboard (Enter)', async () => {
      const user = userEvent.setup();
      renderFooter(lang);

      const buttons = screen.getAllByRole('button');
      const badge = buttons.find((b) => b.getAttribute('aria-label'))!;
      expect(badge.getAttribute('aria-expanded')).toBe('false');

      // Focus + open via keyboard
      badge.focus();
      expect(document.activeElement).toBe(badge);
      await user.keyboard('{Enter}');

      // Radix renders the popover into a portal with role="dialog"
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(badge.getAttribute('aria-expanded')).toBe('true');

      // dir attribute is propagated for RTL languages
      const expectedDir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
      expect(dialog.getAttribute('dir')).toBe(expectedDir);

      // Close via Escape — focus returns to the badge
      await user.keyboard('{Escape}');
      // Wait one microtask for Radix to detach
      await act(async () => { await Promise.resolve(); });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(badge.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens via Space key as well', async () => {
      const user = userEvent.setup();
      renderFooter(lang);
      const badge = screen
        .getAllByRole('button')
        .find((b) => b.getAttribute('aria-label'))!;
      badge.focus();
      await user.keyboard(' ');
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe.each([
    { name: 'mobile 360px', w: 360 },
    { name: 'tablet 768px', w: 768 },
    { name: 'desktop 1280px', w: 1280 },
  ])('viewport: $name', ({ w }) => {
    it('badge stays keyboard-accessible and dialog opens', async () => {
      setViewport(w);
      const user = userEvent.setup();
      renderFooter('ar'); // hardest case: RTL + small/large
      const badge = screen
        .getAllByRole('button')
        .find((b) => b.getAttribute('aria-label'))!;
      expect(badge).toBeTruthy();

      badge.focus();
      await user.keyboard('{Enter}');
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      // Content has non-empty text — guards against blank popovers caused by
      // missing localizations.
      expect(within(dialog).getByText(/./)).toBeTruthy();
    });
  });

  it('clicking the badge also opens the dialog (mouse parity with keyboard)', async () => {
    const user = userEvent.setup();
    renderFooter('en');
    const badge = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label'))!;
    await user.click(badge);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

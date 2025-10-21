import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useThemeEngine } from '../useThemeEngine';

const registry = {
  themes: [
    {
      id: 'omv-default',
      label: 'Default',
      tokens: {
        'colors.surfacePrimary': '#0c1c2c',
        'typography.fontFamilyBase': 'Inter, sans-serif'
      },
      derivedTokens: {
        'colors.surfaceBorder': 'color-mix(in srgb, var(--omv-colors-surfacePrimary) 85%, white)'
      },
      assets: {
        fonts: [
          {
            family: 'Inter',
            weight: 400,
            style: 'normal',
            src: '/assets/themes/omv-default/fonts/inter-400.woff2'
          }
        ]
      }
    },
    {
      id: 'omv-dark',
      label: 'Dark',
      tokens: {
        'colors.surfacePrimary': '#000000'
      }
    }
  ],
  defaultThemeId: 'omv-default'
};

describe('useThemeEngine', () => {
  let engine: ReturnType<typeof useThemeEngine> | undefined;

  const cleanupStyleTags = () => {
    document.head
      .querySelectorAll('style[data-theme-fonts], link[data-theme-css]')
      .forEach((node) => node.remove());
  };

  afterEach(() => {
    cleanupStyleTags();
    vi.restoreAllMocks();
    engine?.reset();
    engine = undefined;
  });

  const createEngine = () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => registry
    });
    engine = useThemeEngine({ fetcher: mockFetch });
    return engine;
  };

  it('loads registry and applies default theme tokens', async () => {
    const themeEngine = createEngine();
    await themeEngine.loadThemes();
    await nextTick();

    expect(themeEngine.activeThemeId.value).toBe('omv-default');
    expect(document.documentElement.style.getPropertyValue('--omv-colors.surfacePrimary')).toBe(
      '#0c1c2c'
    );
    expect(
      document.documentElement.style.getPropertyValue('--omv-derivedTokens.colors.surfaceBorder')
    ).toBe('color-mix(in srgb, var(--omv-colors-surfacePrimary) 85%, white)');
  });

  it('applies a new theme when requested', async () => {
    const themeEngine = createEngine();
    await themeEngine.loadThemes();
    await themeEngine.applyTheme('omv-dark');

    expect(themeEngine.activeThemeId.value).toBe('omv-dark');
    expect(document.documentElement.style.getPropertyValue('--omv-colors.surfacePrimary')).toBe(
      '#000000'
    );
  });

  it('injects font assets once per theme', async () => {
    const themeEngine = createEngine();
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    await themeEngine.loadThemes();
    await nextTick();

    expect(appendChildSpy).toHaveBeenCalledWith(expect.objectContaining({ tagName: 'STYLE' }));
  });
});

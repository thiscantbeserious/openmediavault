import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useThemeStore } from '../themeStore';

vi.mock('../../composables/useThemeEngine', () => {
	const activeThemeId = { value: null };
	const loadThemes = vi.fn().mockImplementation(async () => {
		activeThemeId.value = 'default';
		return {
			themes: [
				{
					id: 'default',
					label: 'Default',
					tokens: {
						'colors.surfacePrimary': '#000'
					}
				}
			],
			defaultThemeId: 'default'
		};
	});
	const applyTheme = vi.fn().mockResolvedValue(undefined);
	const reset = vi.fn();

	return {
		useThemeEngine: vi.fn().mockReturnValue({
			loadThemes,
			applyTheme,
			reset,
			activeThemeId,
			themes: { value: { themes: [], defaultThemeId: 'default' } }
		})
	};
});

const { useThemeEngine } = await import('../../composables/useThemeEngine');

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('useThemeStore', () => {
	it('loads registry on demand and exposes active theme id', async () => {
		const store = useThemeStore();
		await store.ensureLoaded();
		expect(store.activeThemeId).toBe('default');
		expect(useThemeEngine).toHaveBeenCalled();
	});

	it('switches theme via engine', async () => {
		const store = useThemeStore();
		await store.ensureLoaded();
		await store.applyTheme('dark');
		const engine = (useThemeEngine as unknown as any).mock.results[0].value;
		expect(engine.applyTheme).toHaveBeenCalledWith('dark');
	});
});

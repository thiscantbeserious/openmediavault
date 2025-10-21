import { computed, ref, watchEffect } from 'vue';

type ThemeFonts = Array<{
	family: string;
	weight: string | number;
	style: string;
	src: string;
}>;

export type ThemeRegistryEntry = {
	id: string;
	label: string;
	tokens?: Record<string, string>;
	derivedTokens?: Record<string, string>;
	assets?: {
		logo?: string;
		favicon?: string;
		iconSprite?: string;
		iconFontCss?: string;
		fonts?: ThemeFonts;
	};
};

export type ThemeRegistry = {
	themes: ThemeRegistryEntry[];
	defaultThemeId: string | null;
};

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

interface ThemeEngineOptions {
	fetcher?: Fetcher;
	registryUrl?: string;
}

const FALLBACK_REGISTRY_URL = '/assets/theme-registry.json';

const fontMarkerAttribute = 'data-theme-fonts';
const cssMarkerAttribute = 'data-theme-css';

const registryCache = ref<ThemeRegistry | null>(null);
const activeThemeId = ref<string | null>(null);
const tokens = ref<Record<string, string>>({});
const derivedTokens = ref<Record<string, string>>({});

const injectFontFace = (fonts: ThemeFonts = []) => {
	if (!fonts || !fonts.length) return;
	let styleEl = document.head.querySelector(`style[${fontMarkerAttribute}]`);
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.setAttribute(fontMarkerAttribute, '');
		document.head.appendChild(styleEl);
	}
	const css = fonts
		.map((font: ThemeFonts[number]) => {
			return `@font-face { font-family: "${font.family}"; font-weight: ${font.weight}; font-style: ${font.style}; src: url(${font.src}) format("woff2"); }`;
		})
		.join('\n');
	styleEl.textContent = css;
};

const injectStylesheet = (href: string | undefined) => {
	if (!href) return;
	const existing = document.head.querySelector(`link[${cssMarkerAttribute}]`);
	if (existing) {
		existing.remove();
	}
	const linkEl = document.createElement('link');
	linkEl.setAttribute(cssMarkerAttribute, '');
	linkEl.rel = 'stylesheet';
	linkEl.href = href;
	document.head.appendChild(linkEl);
};

const applyCssVariables = (entries: Record<string, any> = {}, prefix = '') => {
	const flattenTokens = (obj: Record<string, any>, parentKey = ''): Record<string, string> => {
		const result: Record<string, string> = {};

		for (const [key, value] of Object.entries(obj)) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;

			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				Object.assign(result, flattenTokens(value, fullKey));
			} else if (typeof value === 'string') {
				result[fullKey] = value;
			}
		}

		return result;
	};

	const flattened = flattenTokens(entries);
	Object.entries(flattened).forEach(([key, value]) => {
		const dottedKey = `--omv-${prefix}${key}`;
		const hyphenKey = `--omv-${prefix}${key.replaceAll('.', '-')}`;
		document.documentElement.style.setProperty(dottedKey, value);
		document.documentElement.style.setProperty(hyphenKey, value);
	});
};

export const useThemeEngine = (options: ThemeEngineOptions = {}) => {
	const fetcher: Fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
	const registryUrl = options.registryUrl ?? FALLBACK_REGISTRY_URL;

	const loadThemes = async (): Promise<ThemeRegistry> => {
		const response = await fetcher(registryUrl, {
			credentials: 'same-origin'
		});
		if (!response.ok) {
			throw new Error(`Failed to load theme registry (${response.status} ${response.statusText})`);
		}
		const data = (await response.json()) as ThemeRegistry;
		registryCache.value = data;
		if (!activeThemeId.value && data.defaultThemeId) {
			await applyTheme(data.defaultThemeId);
		}
		return data;
	};

	const applyTheme = async (themeId: string): Promise<void> => {
		const registry = registryCache.value;
		if (!registry) {
			throw new Error('Theme registry not loaded');
		}
		const entry = registry.themes.find((item) => item.id === themeId);
		if (!entry) {
			throw new Error(`Theme '${themeId}' not found`);
		}
		tokens.value = entry.tokens ?? {};
		derivedTokens.value = entry.derivedTokens ?? {};
		applyCssVariables(tokens.value);
		applyCssVariables(derivedTokens.value, 'derivedTokens.');
		if (entry.assets?.fonts?.length) {
			injectFontFace(entry.assets.fonts);
		}
		if (entry.assets?.iconFontCss) {
			injectStylesheet(entry.assets.iconFontCss);
		}
		activeThemeId.value = entry.id;
	};

	const reset = () => {
		registryCache.value = null;
		activeThemeId.value = null;
		tokens.value = {};
		derivedTokens.value = {};
		document.head
			.querySelectorAll(`style[${fontMarkerAttribute}], link[${cssMarkerAttribute}]`)
			.forEach((node) => node.remove());
	};

	const themeMap = computed(() => {
		const registry = registryCache.value;
		if (!registry) return {} as Record<string, ThemeRegistryEntry>;
		return registry.themes.reduce((acc, curr) => {
			acc[curr.id] = curr;
			return acc;
		}, {} as Record<string, ThemeRegistryEntry>);
	});

	watchEffect(() => {
		if (!registryCache.value?.defaultThemeId || activeThemeId.value) return;
		void applyTheme(registryCache.value.defaultThemeId);
	});

	return {
		loadThemes,
		applyTheme,
		reset,
		activeThemeId,
		tokens,
		derivedTokens,
		themes: registryCache,
		themeMap
	} as const;
};

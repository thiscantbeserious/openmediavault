import { beforeAll } from 'vitest';
import { config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

// Polyfill ResizeObserver for Vuetify layout in jsdom
globalThis.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

beforeAll(() => {
	const vuetify = createVuetify({ components, directives });
	config.global.plugins = [...(config.global.plugins ?? []), vuetify];
});

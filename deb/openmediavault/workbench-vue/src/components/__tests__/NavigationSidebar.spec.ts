import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

vi.mock('../../stores/navigationStore', () => ({
	useNavigationStore: vi.fn().mockReturnValue({
		entries: {
			value: [
				{ path: 'services', text: 'Services', url: '/services' },
				{ path: 'services.ssh', text: 'SSH', url: '/services/ssh' }
			]
		},
		status: { value: 'ready' },
		fetch: vi.fn().mockResolvedValue(undefined)
	})
}));

import NavigationSidebar from '../NavigationSidebar.vue';

const withAppAndLayout = (TestComponent: any) => ({
  components: { TestComponent },
  template: '<v-app><v-layout><TestComponent /></v-layout></v-app>'
});

describe('NavigationSidebar', () => {
	it('renders menu entries as a snapshot', () => {
    const vuetify = createVuetify();
    const wrapper = mount(withAppAndLayout(NavigationSidebar), {
      global: {
        plugins: [vuetify]
      }
    });
		expect(wrapper.html()).toMatchSnapshot();
	});
});

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

vi.mock('../../components/NavigationSidebar.vue', () => ({
	default: {
		template: '<aside data-testid="sidebar">Sidebar</aside>'
	}
}));

vi.mock('../../stores/themeStore', () => ({
	useThemeStore: () => ({
		ensureLoaded: vi.fn().mockResolvedValue(undefined)
	})
}));

import WorkbenchLayout from '../WorkbenchLayout.vue';

const withApp = (component: any) => ({
  components: { component },
  template: '<v-app><component><slot /></component></v-app>'
});

describe('WorkbenchLayout', () => {
	it('renders the sidebar and slot content', () => {
        const vuetify = createVuetify();
        const wrapper = mount(withApp(WorkbenchLayout), {
          global: {
            plugins: [vuetify]
          },
          slots: {
            default: '<div data-testid="content">Main</div>'
          }
        });
		expect(wrapper.html()).toMatchSnapshot();
	});
});

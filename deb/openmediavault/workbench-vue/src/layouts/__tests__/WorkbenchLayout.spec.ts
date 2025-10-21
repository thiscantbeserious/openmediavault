import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

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

describe('WorkbenchLayout', () => {
  it('renders the sidebar and slot content', () => {
    const wrapper = mount(WorkbenchLayout, {
      slots: {
        default: '<div data-testid="content">Main</div>'
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});

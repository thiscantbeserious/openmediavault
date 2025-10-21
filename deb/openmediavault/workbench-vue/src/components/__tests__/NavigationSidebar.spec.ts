import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

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

describe('NavigationSidebar', () => {
  it('renders menu entries as a snapshot', () => {
    const wrapper = mount(NavigationSidebar);
    expect(wrapper.html()).toMatchSnapshot();
  });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useNavigationStore } from '../navigationStore';

vi.mock('../../composables/useNavigationConfigs', async () => {
  const actual = await vi.importActual<typeof import('../../composables/useNavigationConfigs')>(
    '../../composables/useNavigationConfigs'
  );
  return {
    ...actual,
    useNavigationConfigs: vi.fn().mockReturnValue({
      menus: { value: [] },
      status: { value: 'idle' },
      error: { value: null },
      load: vi.fn()
    })
  };
});

describe('useNavigationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loads navigation entries via the composable', async () => {
    const mockLoad = vi.fn().mockResolvedValue(undefined);
    const mockMenus = { value: [{ path: 'services.ssh', text: 'SSH', url: '/services/ssh' }] };

    const { useNavigationConfigs } = await import('../../composables/useNavigationConfigs');
    (useNavigationConfigs as any).mockReturnValue({
      menus: mockMenus,
      status: { value: 'ready' },
      error: { value: null },
      load: mockLoad
    });

    const store = useNavigationStore();
    await store.fetch();

    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(store.entries.value).toEqual(mockMenus.value);
    expect(store.status.value).toBe('ready');
  });

  it('captures load errors', async () => {
    const mockError = new Error('boom');
    const { useNavigationConfigs } = await import('../../composables/useNavigationConfigs');
    (useNavigationConfigs as any).mockReturnValue({
      menus: { value: [] },
      status: { value: 'error' },
      error: { value: mockError },
      load: vi.fn().mockRejectedValue(mockError)
    });

    const store = useNavigationStore();
    await expect(store.fetch()).rejects.toThrow('boom');
    expect(store.error.value).toBe(mockError);
    expect(store.entries.value).toEqual([]);
  });
});

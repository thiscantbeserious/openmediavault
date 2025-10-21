import { describe, expect, it, vi } from 'vitest';

import { useNavigationConfigs } from '../useNavigationConfigs';

describe('useNavigationConfigs', () => {
  const sampleNavigation = [
    {
      path: 'services.ssh',
      text: 'SSH',
      url: '/services/ssh'
    }
  ];

  it('loads navigation configs from the default endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleNavigation
    });
    const { menus, status, load } = useNavigationConfigs({ fetcher: mockFetch });

    expect(status.value).toBe('idle');

    await load();

    expect(mockFetch).toHaveBeenCalledWith('/assets/navigation-config.json', {
      credentials: 'same-origin'
    });
    expect(status.value).toBe('ready');
    expect(menus.value).toEqual(sampleNavigation);
  });

  it('records an error when fetching navigation fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    const { status, error, load } = useNavigationConfigs({ fetcher: mockFetch });

    await expect(load()).rejects.toThrow('Failed to load navigation configuration');
    expect(status.value).toBe('error');
    expect(error.value?.message).toContain('Failed to load navigation configuration');
  });
});

import { describe, expect, it, vi } from 'vitest';

import { useRouteConfigs } from '../useRouteConfigs';

describe('useRouteConfigs', () => {
  const sampleRoutes = [
    {
      url: '/services/ssh',
      title: 'SSH',
      component: {
        type: 'formPage',
        config: { fields: [] }
      }
    }
  ];

  it('loads route configs from the default endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleRoutes
    });
    const { configs, status, load } = useRouteConfigs({ fetcher: mockFetch });

    expect(status.value).toBe('idle');

    await load();

    expect(mockFetch).toHaveBeenCalledWith('/assets/route-config.json', {
      credentials: 'same-origin'
    });
    expect(status.value).toBe('ready');
    expect(configs.value).toEqual(sampleRoutes);
  });

  it('records an error when loading fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    });
    const { status, error, load } = useRouteConfigs({ fetcher: mockFetch });

    await expect(load()).rejects.toThrow('Failed to load route configuration');
    expect(status.value).toBe('error');
    expect(error.value?.message).toContain('Failed to load route configuration');
  });
});

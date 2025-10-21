import { describe, expect, it, vi } from 'vitest';
import { buildConfigRoutes } from '../configRouter';

vi.mock('../../composables/useRouteConfigs', async () => {
  const actual = await vi.importActual<typeof import('../../composables/useRouteConfigs')>(
    '../../composables/useRouteConfigs'
  );
  return {
    ...actual,
    useRouteConfigs: vi.fn().mockReturnValue({
      configs: {
        value: [
          {
            url: '/services/ssh',
            component: {
              type: 'blankPage',
              config: {}
            }
          }
        ]
      },
      status: { value: 'ready' },
      error: { value: null },
      load: vi.fn()
    })
  };
});

const DummyComponent = { template: '<div data-testid="dummy">Dummy</div>' };

vi.mock('../componentRegistry', () => ({
  getComponentByType: vi.fn().mockImplementation(() => DummyComponent)
}));

describe('buildConfigRoutes', () => {
  it('creates Vue Router records for config routes', async () => {
    const loader = await buildConfigRoutes();

    expect(loader.routes).toHaveLength(1);
    expect(loader.routes[0]?.path).toBe('/services/ssh');
  });
});

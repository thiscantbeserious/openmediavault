import { describe, expect, it, vi } from 'vitest';

vi.mock('../configRouter', () => ({
  buildConfigRoutes: vi.fn().mockResolvedValue({
    routes: [
      {
        path: '/services/ssh',
        component: { template: '<div>dummy</div>' }
      }
    ],
    load: vi.fn()
  })
}));

import router, { configRoutesReady } from '../index';

describe('router/index', () => {
  it('adds config-driven routes to the router instance', async () => {
    await configRoutesReady;
    const paths = router.getRoutes().map((route) => route.path);
    expect(paths).toContain('/services/ssh');
  });
});

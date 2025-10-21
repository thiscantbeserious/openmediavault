import type { RouteRecordRaw } from 'vue-router';

import { getComponentByType } from './componentRegistry';
import { useRouteConfigs } from '../composables/useRouteConfigs';

const retryWithBackoff = async (fn: () => Promise<void>, retries = 3, delay = 25): Promise<void> => {
  try {
    await fn();
  } catch (err) {
    if (retries <= 0) {
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    await retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export type ConfigRouteLoader = {
  routes: RouteRecordRaw[];
  load: () => Promise<void>;
};

export const buildConfigRoutes = async (): Promise<ConfigRouteLoader> => {
  const { configs, load } = useRouteConfigs();
  await retryWithBackoff(load);

  const routes: RouteRecordRaw[] = configs.value.map((routeConfig) => {
    const component = getComponentByType(routeConfig.component.type) ?? {
      template: '<div>Unsupported route</div>'
    };
    return {
      path: routeConfig.url,
      component,
      props: {
        config: routeConfig.component.config
      }
    };
  });

  return {
    routes,
    load: async () => {
      await retryWithBackoff(load);
    }
  };
};

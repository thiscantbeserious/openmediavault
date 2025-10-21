import { createRouter, createWebHashHistory } from 'vue-router';

import PlaceholderView from '../views/PlaceholderView.vue';
import { buildConfigRoutes } from './configRouter';
import type { ConfigRouteLoader } from './configRouter';

const baseRoutes = [
  {
    path: '/',
    name: 'home',
    component: PlaceholderView
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: baseRoutes
});

export const configRoutesReady: Promise<ConfigRouteLoader | null> = buildConfigRoutes()
  .then((loader) => {
    loader.routes.forEach((route) => {
      router.addRoute(route);
    });
    return loader;
  })
  .catch((error) => {
    console.error('Failed to load dynamic routes', error);
    return null;
  });

export default router;

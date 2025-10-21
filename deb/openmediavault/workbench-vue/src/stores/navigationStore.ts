import { defineStore } from 'pinia';

import { useNavigationConfigs } from '../composables/useNavigationConfigs';

export const useNavigationStore = defineStore('navigation', () => {
  const loader = useNavigationConfigs();
  const entries = loader.menus;
  const status = loader.status;
  const error = loader.error;

  const fetch = async () => {
    await loader.load();
    return entries.value;
  };

  return {
    entries,
    status,
    error,
    fetch
  };
});

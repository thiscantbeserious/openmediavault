import { computed } from 'vue';
import { defineStore } from 'pinia';

import { useThemeEngine } from '../composables/useThemeEngine';

export const useThemeStore = defineStore('theme', () => {
  const engine = useThemeEngine();
  let loaded = false;

  const ensureLoaded = async () => {
    if (!loaded) {
      await engine.loadThemes();
      loaded = true;
    }
  };

  const applyTheme = async (themeId: string) => {
    await ensureLoaded();
    await engine.applyTheme(themeId);
  };

  const reset = () => {
    engine.reset();
    loaded = false;
  };

  const activeThemeId = computed(() => engine.activeThemeId.value);

  return {
    ensureLoaded,
    applyTheme,
    reset,
    activeThemeId,
    registry: engine.themes
  };
});

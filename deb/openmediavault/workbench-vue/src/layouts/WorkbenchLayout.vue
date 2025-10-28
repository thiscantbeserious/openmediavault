<template>
  <v-app>
    <v-layout class="workbench-layout">
      <TopBar class="workbench-layout__topbar">
        <template #prepend>
          <v-btn icon variant="text" @click="drawerOpen = !drawerOpen" aria-label="toggle navigation">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <template #breadcrumbs>
          <v-breadcrumbs density="compact">
            <template v-for="(crumb, idx) in breadcrumbTrail" :key="crumb.url || idx">
              <v-breadcrumbs-item
                v-if="idx < breadcrumbTrail.length - 1"
                :to="crumb.url"
                exact
              >
                {{ crumb.text }}
              </v-breadcrumbs-item>
              <v-breadcrumbs-item v-else :disabled="true">{{ crumb.text }}</v-breadcrumbs-item>
              <v-breadcrumbs-divider v-if="idx < breadcrumbTrail.length - 1">
                <v-icon size="14">mdi-chevron-right</v-icon>
              </v-breadcrumbs-divider>
            </template>
          </v-breadcrumbs>
        </template>
      </TopBar>

      <NavigationSidebar :model-value="drawerOpen" @update:model-value="drawerOpen = $event" />

      <v-main>
        <v-container fluid class="workbench-layout__content" style="max-width: 100%">
          <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import NavigationSidebar from '../components/NavigationSidebar.vue';
import TopBar from '../components/TopBar.vue';
import { useThemeStore } from '../stores/themeStore';
import { useNavigationStore } from '../stores/navigationStore';
import type { NavigationMenuItem } from '../composables/useNavigationConfigs';

const themeStore = useThemeStore();
const drawerOpen = ref(true);
const route = useRoute();

const navigationStore = useNavigationStore();
const { entries, status } = storeToRefs(navigationStore);

const findBreadcrumbTrail = (items: NavigationMenuItem[], currentPath: string) => {
  let best: Array<{ text: string; url: string }> = [];

  const dfs = (item: NavigationMenuItem, trail: Array<{ text: string; url: string }>) => {
    const selfUrl = item.url ?? '';
    const nextTrail = [...trail, { text: item.text, url: selfUrl }];
    const matches = selfUrl && (currentPath === selfUrl || currentPath.startsWith(selfUrl + '/'));
    if (matches && nextTrail.length > best.length) best = nextTrail;
    if (Array.isArray(item.children)) {
      for (const child of item.children) dfs(child, nextTrail);
    }
  };

  for (const it of items) dfs(it, []);
  return best.length ? best : [{ text: 'Dashboard', url: '/dashboard' }];
};

const breadcrumbTrail = computed(() => {
  const list = entries.value ?? [];
  return findBreadcrumbTrail(list, route.path);
});

onMounted(() => {
  themeStore.ensureLoaded().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to load themes', error);
  });
  if (status.value === 'idle') {
    navigationStore.fetch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load navigation entries', error);
    });
  }
});
</script>

<style scoped>
.workbench-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--omv-colors-surface-background, #f5f5f5);
  font-family: var(--omv-typography-fontFamilyBase, 'Inter', 'Roboto', 'HelveticaNeue', 'Helvetica Neue', helvetica, arial, sans-serif);
}

.workbench-layout__content {
  flex: 1;
  padding: var(--omv-layout-margin, 1.5rem);
  color: var(--omv-colors-text-primary, #000000);
  background-color: var(--omv-colors-surface-content, #ffffff);
  border-top: 0; /* avoid visual seam with app bar */
}
</style>

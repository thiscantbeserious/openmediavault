<template>
  <v-app>
    <v-layout class="workbench-layout">
      <TopBar class="workbench-layout__topbar">
        <template #prepend>
          <v-btn icon variant="text" @click="drawerOpen = !drawerOpen" aria-label="toggle navigation">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
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
import { onMounted, ref } from 'vue';

import NavigationSidebar from '../components/NavigationSidebar.vue';
import TopBar from '../components/TopBar.vue';
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();
const drawerOpen = ref(true);

onMounted(() => {
  themeStore.ensureLoaded().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to load themes', error);
  });
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
}
</style>

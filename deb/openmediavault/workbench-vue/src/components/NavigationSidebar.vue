<template>
  <v-navigation-drawer
    class="navigation-sidebar"
    data-testid="navigation-sidebar"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :rail="!modelValue"
    theme="dark"
    :width="320"
    :rail-width="72"
    permanent
  >
    <template #prepend>
      <header class="navigation-sidebar__header">
        <slot name="header">Workbench</slot>
      </header>
    </template>
    <v-list nav density="comfortable" class="navigation-sidebar__content">
      <v-list-item
        v-for="entry in displayEntries"
        :key="entry.url"
        :to="entry.url"
        link
        :title="entry.text"
        :prepend-icon="entry.icon || 'mdi-menu'"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useNavigationStore } from '../stores/navigationStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const navigationStore = useNavigationStore();

const entries = navigationStore.entries;
const status = navigationStore.status;

const fallbackEntries = [
  { path: 'dashboard', text: 'Dashboard', url: '/', icon: 'mdi-view-dashboard' },
  { path: 'system', text: 'System', url: '/system', icon: 'mdi-cog-outline' },
  { path: 'network', text: 'Network', url: '/network', icon: 'mdi-lan' },
  { path: 'storage', text: 'Storage', url: '/storage', icon: 'mdi-harddisk' },
  { path: 'services', text: 'Services', url: '/services', icon: 'mdi-cube-outline' },
  { path: 'users', text: 'Users', url: '/users', icon: 'mdi-account-group-outline' },
  { path: 'diagnostics', text: 'Diagnostics', url: '/diagnostics', icon: 'mdi-stethoscope' }
];

const displayEntries = computed(() => (entries.value?.length ? entries.value : fallbackEntries));

onMounted(() => {
  if (status.value === 'idle') {
    navigationStore.fetch().catch((error) => {
      console.error('Failed to load navigation entries', error);
    });
  }
});
</script>

<style scoped>
.navigation-sidebar {
  width: var(--omv-layout-navigationBarWidth, 18.75rem);
  background-color: var(--omv-colors-surface-primary, #0c1c2c);
  color: var(--omv-colors-textOnPrimary, #ffffff);
  min-height: 100vh;
  padding: var(--omv-layout-margin, 1.5rem) var(--omv-layout-padding, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--omv-layout-margin, 1.5rem);
  font-family: var(--omv-typography-fontFamilyBase, 'Inter', 'Roboto', 'HelveticaNeue', 'Helvetica Neue', helvetica, arial, sans-serif);
}

.navigation-sidebar__header {
  font-size: var(--omv-typography-fontSizeSubheading2, 16px);
  font-weight: var(--omv-typography-fontWeightSubheading2, 500);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.navigation-sidebar__content {
  flex: 1;
  overflow-y: auto;
}

.navigation-sidebar__item {
  list-style: none;
  margin-bottom: 0.75rem;
}

.navigation-sidebar__item a {
  color: inherit;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 0.15s ease;
  font-size: var(--omv-typography-fontSizeBase, 14px);
}

.navigation-sidebar__item a:hover {
  opacity: 1;
  background-color: var(--omv-colors-surface-hover, rgba(0, 0, 0, 0.04));
  padding: 0.5rem;
  border-radius: var(--omv-layout-borderRadius, 4px);
}
</style>

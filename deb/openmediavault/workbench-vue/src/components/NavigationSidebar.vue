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
        <v-text-field
          v-model="searchQuery"
          class="navigation-sidebar__search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search"
          variant="solo"
          density="compact"
          hide-details
          clearable
          @click:clear="onClearSearch"
        />
      </header>
    </template>
    <v-list
      nav
      density="comfortable"
      class="navigation-sidebar__content"
      v-model:opened="openedGroups"
      open-on-click
    >
      <template v-for="entry in filteredEntries" :key="entry.path">
        <v-list-group v-if="hasChildren(entry)" :value="entry.path">
          <template #activator="{ props, isOpen }">
            <v-list-item
              v-bind="props"
              :title="entry.text"
              :prepend-icon="entry.icon || 'mdi-menu'"
              :append-icon="isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              active-class="navigation-sidebar__item--active"
              :class="{ 'navigation-sidebar__item--active': isParentActive(entry) }"
              rounded="0"
            />
          </template>
          <v-list-item
            v-for="child in entry.children"
            :key="child.url"
            :to="child.url || '/'"
            link
            :title="child.text"
            :prepend-icon="child.icon"
            :class="{ 'navigation-sidebar__item--active': isActive(child.url) }"
            active-class="navigation-sidebar__item--active"
            rounded="0"
          />
        </v-list-group>
        <v-list-item
          v-else
          :to="entry.url || '/'"
          link
          :title="entry.text"
          :prepend-icon="entry.icon || 'mdi-menu'"
          :class="{ 'navigation-sidebar__item--active': isActive(entry.url) }"
          active-class="navigation-sidebar__item--active"
          rounded="0"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { NavigationMenuItem } from '../composables/useNavigationConfigs';

import { useNavigationStore } from '../stores/navigationStore';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const navigationStore = useNavigationStore();
const route = useRoute();
const searchQuery = ref('');

const { entries, status } = storeToRefs(navigationStore);

const fallbackEntries: NavigationMenuItem[] = [
  { path: 'dashboard', text: 'Dashboard', url: '/', icon: 'mdi-view-dashboard' },
  { path: 'system', text: 'System', url: '/system', icon: 'mdi-cog-outline' },
  { path: 'network', text: 'Network', url: '/network', icon: 'mdi-lan' },
  { path: 'storage', text: 'Storage', url: '/storage', icon: 'mdi-harddisk' },
  {
    path: 'services',
    text: 'Services',
    url: '/services',
    icon: 'mdi-cube-outline',
    children: [
      { path: 'services.ssh', text: 'SSH', url: '/services/ssh', icon: 'mdi-ssh' }
    ]
  },
  { path: 'users', text: 'Users', url: '/users', icon: 'mdi-account-group-outline' },
  { path: 'diagnostics', text: 'Diagnostics', url: '/diagnostics', icon: 'mdi-stethoscope' }
];

const displayEntries = computed(() => (entries.value && entries.value.length ? entries.value : fallbackEntries));

const filterTree = (items: NavigationMenuItem[], q: string): NavigationMenuItem[] => {
  const matches = (txt: string | undefined) => !!txt && txt.toLowerCase().includes(q);
  const result: NavigationMenuItem[] = [];
  for (const item of items) {
    const childMatches = Array.isArray(item.children) ? filterTree(item.children, q) : [];
    const selfMatch = matches(item.text);
    if (selfMatch || childMatches.length > 0) {
      result.push({
        ...item,
        // Only show matching children to keep search results concise
        children: childMatches.length > 0 ? childMatches : undefined
      });
    }
  }
  return result;
};

const filteredEntries = computed(() => {
  const q = (searchQuery.value ?? '').toString().trim().toLowerCase();
  if (!q) return displayEntries.value;
  return filterTree(displayEntries.value, q);
});

const onClearSearch = () => {
  searchQuery.value = '';
};

const hasChildren = (entry: NavigationMenuItem): entry is NavigationMenuItem & { children: NavigationMenuItem[] } => {
  return Array.isArray(entry.children) && entry.children.length > 0;
};

onMounted(() => {
  if (status.value === 'idle') {
    navigationStore.fetch().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load navigation entries', error);
    });
  }
  syncOpenGroups();
});

watch(() => route.path, () => {
  syncOpenGroups();
});

watch(searchQuery, () => {
  const q = (searchQuery.value ?? '').toString().trim().toLowerCase();
  if (!q) {
    syncOpenGroups();
    return;
  }
  // Open all groups that remain in filtered results
  const open: Record<string, boolean> = {};
  const markParents = (items: NavigationMenuItem[]) => {
    for (const it of items) {
      if (Array.isArray(it.children) && it.children.length > 0) {
        open[it.path] = true;
        markParents(it.children);
      }
    }
  };
  markParents(filteredEntries.value);
  openGroups.value = open;
});

const openGroups = ref<Record<string, boolean>>({});
const openedGroups = computed({
  get: () => Object.keys(openGroups.value).filter((k) => openGroups.value[k]),
  set: (vals: string[]) => {
    const q = (searchQuery.value ?? '').toString().trim();
    const allowMultiple = q.length > 0; // during search, allow multiple groups open
    const keys = allowMultiple ? vals : vals.length ? [vals[vals.length - 1]] : [];
    const next: Record<string, boolean> = {};
    for (const v of keys) next[v] = true;
    openGroups.value = next;
  }
});
const isParentActive = (entry: NavigationMenuItem): boolean => {
  const current = route.path;
  if (entry.url && current === entry.url) return true;
  if (Array.isArray(entry.children)) {
    return entry.children.some((c) => current === c.url || current.startsWith(`${c.url}/`));
  }
  return false;
};

const syncOpenGroups = () => {
  const list = displayEntries.value;
  const state: Record<string, boolean> = {};
  for (const e of list) {
    if (Array.isArray((e as any).children) && (e as any).children.length) {
      state[e.path] = isParentActive(e as NavigationMenuItem);
    }
  }
  openGroups.value = state;
};

const isActive = (url?: string): boolean => {
  if (!url) return false;
  const current = route.path;
  // Exact match or current starts with the url and next char is '/' to treat url as a section root
  return current === url || current.startsWith(url + '/');
};
</script>

<style scoped>
.navigation-sidebar {
  width: var(--omv-layout-navigationBarWidth, 18.75rem);
  background-color: var(--omv-colors-surface-primary, #0c1c2c);
  color: var(--omv-colors-textOnPrimary, #ffffff);
  min-height: 100vh;
  padding: var(--omv-layout-margin, 1.5rem) 0;
  display: flex;
  flex-direction: column;
  gap: var(--omv-layout-margin, 1.5rem);
  font-family: var(--omv-typography-fontFamilyBase, 'Inter', 'Roboto', 'HelveticaNeue', 'Helvetica Neue', helvetica, arial, sans-serif);
}

.navigation-sidebar__header {
  padding: 0 var(--omv-layout-padding, 1rem);
}

.navigation-sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* default theme: no inset padding so items align to drawer edge */
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

/* Hover state: subtle bg, no rounded corners so it fills the row */
.navigation-sidebar__item a:hover {
  opacity: 1;
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

/* Navigation item typography (themeable) */
.navigation-sidebar__content :deep(.v-list-item-title) {
  font-size: var(--omv-typography-fontSizeNavItem, 15px);
  line-height: 1.3;
  font-weight: var(--omv-typography-fontWeightNavItem, 500);
}

/* Active nav item: thin left indicator and subtle background */
.navigation-sidebar__item--active {
  box-shadow: inset 3px 0 0 0 rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Hover feedback for list items (full width, no rounding) */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  box-shadow: inset 3px 0 0 0 rgba(var(--v-theme-primary), 0.4);
}

/* Accessible focus ring without layout shift */
.v-list-item:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}

/* Search field tuning to blend with dark drawer */
.navigation-sidebar__search :deep(.v-field) {
  background-color: rgba(var(--v-theme-surface), 0.1);
  color: rgb(var(--v-theme-on-surface));
}
.navigation-sidebar__search :deep(.v-field__outline) {
  display: none;
}
.navigation-sidebar__search :deep(input::placeholder) {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* List item spacing & icon alignment */
.navigation-sidebar__content :deep(.v-list-item) {
  /* Horizontal padding applied to the whole item, including icon area */
  padding-inline: var(--omv-nav-item-padding, 1rem);
}
.navigation-sidebar__content :deep(.v-list-item .v-list-item__prepend) {
  width: 36px; /* reduce default ~56px prepend area */
  margin-inline-end: 0.6rem; /* tighter gap between icon and label */
  margin-inline-start: 0.8rem;
}

/* Indentation for child items */
.navigation-sidebar__content :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: calc(var(--omv-nav-item-padding, 1rem) + 16px);
  padding-inline-end: var(--omv-nav-item-padding, 1rem);
}

/* Always show group chevrons and ensure theme-consistent color */
.navigation-sidebar__content :deep(.v-list-group .v-list-item__append) {
  margin-inline-start: auto;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}
.navigation-sidebar__content :deep(.v-list-group .v-list-item__append .v-icon) {
  color: rgba(var(--v-theme-on-surface), 0.8);
}
</style>

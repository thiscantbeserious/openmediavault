<template>
  <aside class="navigation-sidebar" data-testid="navigation-sidebar">
    <header class="navigation-sidebar__header">
      <slot name="header">Workbench</slot>
    </header>
    <nav class="navigation-sidebar__content">
      <ul>
        <li v-for="entry in entries.value" :key="entry.url" class="navigation-sidebar__item">
          <a :href="entry.url">{{ entry.text }}</a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useNavigationStore } from '../stores/navigationStore';

const navigationStore = useNavigationStore();

const entries = navigationStore.entries;
const status = navigationStore.status;

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
  width: 280px;
  background: rgba(15, 25, 40, 0.92);
  color: #f0f4ff;
  min-height: 100vh;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.navigation-sidebar__header {
  font-size: 1.1rem;
  font-weight: 600;
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
}

.navigation-sidebar__item a:hover {
  opacity: 1;
}
</style>

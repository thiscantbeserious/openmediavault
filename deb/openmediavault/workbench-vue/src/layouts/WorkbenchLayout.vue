<template>
  <div class="workbench-layout">
    <NavigationSidebar class="workbench-layout__sidebar" />
    <section class="workbench-layout__content">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from '../components/NavigationSidebar.vue';
</script>

<style scoped>
.workbench-layout {
  display: flex;
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(30, 50, 80, 0.8), rgba(5, 10, 20, 0.95));
}

.workbench-layout__sidebar {
  flex-shrink: 0;
}

.workbench-layout__content {
  flex: 1;
  padding: 2rem;
  color: #e2e8f8;
}
</style>

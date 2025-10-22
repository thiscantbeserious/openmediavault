<template>
  <v-app-bar density="comfortable" class="topbar" data-testid="topbar">
    <slot name="prepend" />
    <v-toolbar-title class="topbar__branding">
      <span class="topbar__logo">openmediavault</span>
    </v-toolbar-title>
    <v-spacer class="topbar__spacer" />
    <div class="topbar__actions">
      <v-btn icon aria-label="notifications" variant="text"><v-icon>mdi-bell-outline</v-icon></v-btn>
      <v-btn icon aria-label="help" variant="text"><v-icon>mdi-help-circle-outline</v-icon></v-btn>
      <v-btn icon aria-label="user" variant="text"><v-icon>mdi-account-circle-outline</v-icon></v-btn>
      <v-btn icon aria-label="power" variant="text"><v-icon>mdi-power</v-icon></v-btn>
    </div>
  </v-app-bar>
 </template>

<script setup lang="ts">
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  height: var(--omv-layout-topBarHeight, 4rem);
  padding: 0 1rem;
  background-color: var(--omv-colors-surface-topbar, #5dacdf);
  color: var(--omv-colors-neutral-white, #ffffff);
  box-shadow: 0px 2px 0px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.13)), 0px 2px 25px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.04)), 0px 1px 10px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0)) !important;
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);*/

}

.topbar__branding {
  font-weight: 600;
}

.topbar__spacer {
  flex: 1;
}

.topbar__actions {
  display: flex;
  gap: 0.5rem;
}

.topbar__icon {
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
}
</style>




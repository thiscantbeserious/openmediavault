<template>
  <v-app-bar density="comfortable" class="topbar" data-testid="topbar">
    <div class="topbar__brandbg">
      <div class="topbar__brandblock">
        <slot name="prepend" />
        <span class="topbar__brandtext">openmediavault</span>
      </div>
    </div>
    <nav class="topbar__breadcrumbs" aria-label="Breadcrumb">
      <slot name="breadcrumbs" />
    </nav>
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
  padding: 0 1rem 0 0; /* no left padding so brand block can be flush */
  background-color: var(--omv-colors-surface-topbar, #5dacdf);
  color: var(--omv-colors-neutral-white, #ffffff);
  box-shadow: 0px 2px 0px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.13)), 0px 2px 25px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.04)), 0px 1px 10px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0)) !important;
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);*/
  border-bottom: none !important;
  overflow: hidden;

}

/* Vuetify adds a bottom divider via ::before on v-app-bar – remove it */
.topbar::before {
  border-bottom: 0 !important;
  box-shadow: none !important;
}

.topbar__brandbg {
  position: relative;
  height: 100%;
  align-self: stretch;
  width: calc(var(--omv-layout-navigationBarWidth, 18.75rem) - 80px);
  /*width: calc(var(--omv-layout-navigationBarWidth, 18.75rem) + 44px);*/
  /*background: var(--omv-topbar-brandBackground, linear-gradient(180deg, #273c90 0%, #162856 100%));*/
  /* slant from top-right to left creating a forward-leaning tab */
  clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%);
  margin-right: 1rem;
  margin-left: 0.5rem;
}

.topbar__brandblock {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  align-self: stretch; /* ensure it spans full app-bar height */
  padding-left: 0;
  padding-right: 12px;
  /*color: var(--omv-colors-neutral-white, #ffffff);*/
}

.topbar__brandtext {
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

.topbar__breadcrumbs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
  font-size: 14px;
  line-height: 1;
  height: 28px;
  margin-left: 1rem; /* spacing from brand block */
  align-self: center;
  z-index: 0;
}

/* Ensure Vuetify toolbar content spans full height with no extra padding */
.topbar :deep(.v-toolbar__content) {
  height: 100% !important;
  min-height: 100% !important;
  padding-left: 0 !important;
  padding-right: 1rem !important;
  align-items: center;
}
</style>




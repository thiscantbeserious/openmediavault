<template>
  <div class="topmenus">
    <!-- Notifications -->
    <v-menu location="bottom" offset="8" :close-on-content-click="false" content-class="menu-with-arrow">
      <template #activator="{ props }">
        <v-btn icon aria-label="notifications" variant="text" v-bind="props">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable">
        <v-list-item title="No new notifications" prepend-icon="mdi-bell"
        />
      </v-list>
    </v-menu>

    <!-- Help -->
    <v-menu location="bottom" offset="8" :close-on-content-click="false" content-class="menu-with-arrow">
      <template #activator="{ props }">
        <v-btn icon aria-label="help" variant="text" v-bind="props">
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable">
        <v-list-item title="Documentation" prepend-icon="mdi-file-document-outline" />
        <v-list-item title="Forum" prepend-icon="mdi-forum-outline" />
        <v-list-item title="Homepage" prepend-icon="mdi-web" />
        <v-divider />
        <v-list-item title="About" prepend-icon="mdi-information-outline" />
      </v-list>
    </v-menu>

    <!-- Account -->
    <v-menu location="bottom" offset="8" :close-on-content-click="false" content-class="menu-with-arrow">
      <template #activator="{ props }">
        <v-btn icon aria-label="user" variant="text" v-bind="props">
          <v-icon>mdi-account-circle-outline</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable">
        <v-list-subheader>Logged in as doh</v-list-subheader>
        <v-list-item title="Change Password" prepend-icon="mdi-lock-outline" />
        <v-list-item title="Logout" prepend-icon="mdi-logout" />
        <v-divider />
        <v-list-item>
          <template #prepend><v-icon>mdi-weather-night</v-icon></template>
          <v-list-item-title>Dark mode</v-list-item-title>
          <template #append><v-switch hide-details density="compact" /></template>
        </v-list-item>
        <v-list-item>
          <template #prepend><v-icon>mdi-translate</v-icon></template>
          <v-list-item-title style="min-width: 100px">Language</v-list-item-title>
          <template #append>
            <v-select
              v-model="selectedLanguage"
              :items="languages"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              style="min-width: 160px"
            />
          </template>
        </v-list-item>
        <v-list-item title="Dashboard" prepend-icon="mdi-view-dashboard-outline" />
        <v-divider />
        <v-list-item title="Reset UI to defaults" prepend-icon="mdi-restore" />
      </v-list>
    </v-menu>

    <!-- Power -->
    <v-menu location="bottom" offset="8" :close-on-content-click="false" content-class="menu-with-arrow">
      <template #activator="{ props }">
        <v-btn icon aria-label="power" variant="text" v-bind="props">
          <v-icon>mdi-power</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable">
        <v-list-item title="Reboot" prepend-icon="mdi-sync" />
        <v-list-item title="Standby" prepend-icon="mdi-pause" />
        <v-list-item title="Shutdown" prepend-icon="mdi-power" />
      </v-list>
    </v-menu>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';

type Language = { label: string; value: string };
const languages: Language[] = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
];
const selectedLanguage = ref<Language['value']>('en');
</script>

<style scoped>
.topmenus {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Menu surface tweaks and arrow tip (working variant) */
:deep(.menu-with-arrow > .v-overlay__content) {
  position: relative;
  overflow: visible;
  border-radius: 10px;
}
:deep(.menu-with-arrow > .v-overlay__content::before) {
  content: "";
  position: absolute;
  top: -6px; /* stick to icon */
  left: 16px; /* tweak per icon if desired */
  width: 12px;
  height: 12px;
  background: rgb(var(--v-theme-surface));
  transform: rotate(45deg);
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
</style>



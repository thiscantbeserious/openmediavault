<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="CPU">
          <div class="chart-placeholder" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="Load Average">
          <div class="gauge-placeholder" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="System Information">
          <v-list density="comfortable">
            <v-list-item title="Hostname" subtitle="omv-dev" />
            <v-list-item title="Kernel" subtitle="6.x (mock)" />
            <v-list-item title="Uptime" subtitle="1 day (mock)" />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="CPU Utilization">
          <div class="gauge-placeholder" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="Memory">
          <div class="donut-placeholder" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" title="Services">
          <v-chip class="ma-1" color="success" variant="flat">Docker</v-chip>
          <v-chip class="ma-1" color="success" variant="flat">SSH</v-chip>
          <v-chip class="ma-1" color="success" variant="flat">fail2ban</v-chip>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
</script>

<style scoped>
.chart-placeholder,
.gauge-placeholder,
.donut-placeholder {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.4),
    rgba(255, 255, 255, 0.4) 10px,
    rgba(0, 0, 0, 0.04) 10px,
    rgba(0, 0, 0, 0.04) 20px
  );
}

.v-card {
  border-radius: var(--omv-layout-borderRadius, 12px);
}

.v-card--variant-elevated {
  box-shadow: 0px 3px 42px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.05)), 0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 4px 30px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12))
}
</style>

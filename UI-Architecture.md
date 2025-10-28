# UI Architecture & Migration Plan

Last updated: 2025-03-14  
Status: Draft – actively evolving while we define the Vue/theming transition.

## 1. Current Frontend Architecture
- **Framework**: Angular 15 SPA under `deb/openmediavault/workbench/`; bootstrapped via `src/main.ts`.
- **Dynamic configuration**: YAML manifests compiled by `omv-mkworkbench` into JSON assets (`route-config.json`, `navigation-config.json`, `dashboard-widget-config.json`, `log-config.json`, `mkfs-config.json`). Angular services (e.g. `RouteConfigService`, `NavigationConfigService`) load these at runtime.
- **Pages & forms**: The “Intuition” component set renders forms, tables, tabs, etc. Config-driven pages map to Angular components (`FormPageComponent`, `DatatablePageComponent`, …) that orchestrate RPC requests through `RpcService`.
- **Theming**: SCSS design tokens compiled at build time with a light/dark toggle persisted in local storage (`PrefersColorSchemeService`).
- **Notifications & tasks**: Notifications are client-only toasts collected by `NotificationService`. Background tasks are polled via `TaskRunnerService`.

## 2. Target Vue-Based Architecture (Secondary Workspace)
We will scaffold a parallel Vue 3/Vite workspace (`deb/openmediavault/workbench-vue/`) to coexist with the legacy Angular app while we migrate view-by-view.

### 2.1 Workspace Bootstrap
- Tooling: Vite + Vue 3 + TypeScript + Pinia + Vue Router + Vitest.
- Build integration: Extend `debian/rules` to run `npm ci && npm run build` within `workbench-vue`, emitting a bundle to `/var/www/openmediavault/vue/`.
- Routing: Recreate config-driven routing by porting the logic of `RouteConfigService` into Vue composables (`useRouteConfigs`, `useRouteInjector`).
- Compatibility layer: Implement a Vue “Intuition runtime” capable of interpreting existing manifest configs so Angular pages can be migrated incrementally without breaking plugins.

### 2.2 Theming Engine
- New manifest directory `usr/share/openmediavault/workbench/theme.d/` for core + plugin theme descriptors.
- `omv-mkworkbench` enhancement: parse theme manifests, resolve inheritance, and emit `assets/theme-registry.json`.
- Vue theme loader: ingest the registry, apply CSS variables at runtime, support hot-swappable theme packages (`openmediavault-ui-theme-*`).
- User preference storage continues to use `WebGui` RPC + local storage to maintain parity with today’s toggle.

### 2.3 Plugin & Extensibility Story
- Keep YAML-driven route/navigation/dashboard injection to avoid breaking existing plugins.
- Provide a Vue plugin SDK (scaffolding templates + docs) so new UI packages can register routes, components, and themes.
- Ensure the Angular compatibility layer can consume plugin manifests until their UI code is ported.

### 2.4 Backend Enhancements (Planned)
- **Notification RPC**: extend `WebGui` service with `publishNotification`, `listNotifications`, `ackNotification` to persist/share notifications across plugins. Storage likely under `/var/lib/openmediavault/workbench/notifications.d/`.
- **Theme manifest delivery**: expose a `Theme` RPC for live reloads and validation feedback if needed.
- **Task/stream APIs**: evaluate WebSocket or SSE endpoints for richer UI interactions (future stretch goal).

## 3. Workstreams & Status

| Workstream | Scope | Owner | Status | Notes |
|------------|-------|-------|--------|-------|
| Vue workspace bootstrap | Create `workbench-vue`, Vite config, base router/store, packaging changes | Codex | In progress | Skeleton, dynamic config loaders, nav layout shell |
| Intuition compatibility layer | Port config-driven form/table renderer to Vue | Codex | Planned | Blocks migration start |
| Theme engine | Theme manifests + runtime loader + plugin contract | Codex | Planned | Requires `omv-mkworkbench` update |
| Notification RPC overhaul | Server RPC additions + Vue store consumption | Codex | Planned | Needs security review |
| Angular sunset strategy | Decide coexistence window, routing handover, removal plan | TBD | Pending | Coordinate with maintainers |

## 4. Immediate Next Actions
1. Implement Vue theme runtime (`useThemeEngine`) consuming the generated registry and applying CSS variables/assets.
2. Prototype the notification RPC contract and persistence model for maintainer review.
3. Design RPC client wrapper + shared services (theme loader bootstrap, navigation fetch reuse) for Vue workspace.

## 5. Open Questions
- Should we deliver the Vue SPA under a separate URL (`/workbench-vue`) during beta, or replace the existing entry point behind a feature flag?
- Do we require live reload of theme assets without rebuilding packages, and if so how will permissions be enforced?
- Can we introduce WebSocket infrastructure within the current packaging constraints, or must we rely on polling initially?

---

Document owner: Agent. Please update this file alongside any major UI architecture decisions.

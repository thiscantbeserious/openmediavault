# Vue Workbench Design Decisions

_Last updated: 2025-03-14_

This document captures the key technical choices for the new Vue-based Workbench so contributors understand **why** things are structured the way they are. It complements the planning notes in `AGENTS.md` but is written for humans rather than automation.

## Theme Architecture

### Manifest Source of Truth
- Theme manifests (`*.yaml`) live under `deb/openmediavault/usr/share/openmediavault/workbench/theme.d/`.
- Rationale: manifests must be packaged with the backend; the existing `omv-mkworkbench` CLI aggregates them into JSON assets during the Debian build. Keeping them with the PHP/Salt tooling ensures they ship inside the `.deb` files and remain backward-compatible with Angular.

### Registry Generation
- `omv-mkworkbench theme` reads the YAML manifests, resolves inheritance, flattens token namespaces, and writes `theme-registry.json` to `/var/www/openmediavault/assets/theme-registry.json`.
- We warn (via `--verbose-missing-assets`) if relative asset paths referenced by a manifest do not exist, but the packaging step is still responsible for installing the actual files under `/var/www/openmediavault/assets/themes/<id>/`.

### Vue Runtime
- `src/composables/useThemeEngine.ts` loads `theme-registry.json`, applies CSS variables (`--omv-…`) for tokens and derived tokens, and injects fonts/icon CSS when defined.
- A Pinia store (`src/stores/themeStore.ts`) wraps the composable so the layout can bootstrap themes without duplicating logic. The default layout (`src/layouts/WorkbenchLayout.vue`) calls `themeStore.ensureLoaded()` on mount so the default theme is active before slot content renders.

### Token Naming
- Tokens mirror the existing Angular SCSS variables (colors, typography, layout). This allows a gradual migration: SCSS continues to define the canonical values, manifests reflect them, and the Vue runtime consumes the registry at runtime. As we port features, we will replace direct SCSS usage with CSS variables supplied by the theme engine.

## Navigation Integration
- Navigation, routes, and other descriptors remain backend-driven. Composables (`useNavigationConfigs`, `useRouteConfigs`) load the JSON assets created by `omv-mkworkbench`, allowing existing YAML descriptors to work unchanged.
- Pinia stores (`navigationStore.ts`, `themeStore.ts`) cache these configs so components only deal with reactive state.

## Testing Strategy
- Vue layer: Vitest + `@vue/test-utils`, colocated tests under `src/**/__tests__`, snapshots where they add value.
- Backend tooling: Python unit tests live under `deb/openmediavault/usr/share/openmediavault/unittests/python/` (e.g., the theme registry test).

## Why Not…
- **Put manifests inside `workbench-vue/`?** They must be present during packaging so `omv-mkworkbench` can bundle them into `/var/www/.../assets/theme-registry.json`. Vue only consumes the registry output, not the raw manifests.
- **Adopt Vuetify/another UI kit?** Replacing the entire UI library would be a large rewrite and would break descriptor compatibility. A slim CSS-variable engine keeps the migration incremental and plugin-friendly.

## Next Steps
- Expand the default manifest with additional tokens as components migrate.
- Add a user-facing theme selector once persistence flows are ready.
- Continue porting Intuition components, using the shared stores/composables and theme engine.

Contributors should extend this document as new design decisions are made.

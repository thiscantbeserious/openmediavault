# Vue Workbench Guide

Reference doc for contributors working inside `deb/openmediavault/workbench-vue/`.

## Tech Stack
- **Framework**: Vue 3 (Composition API, TypeScript)
- **Tooling**: Vite + @vitejs/plugin-vue, Pinia v3 for state, Vue Router (hash mode), Vitest + @vue/test-utils for unit/snapshot tests, Cypress/Playwright (planned) for e2e.
- **Styling**: CSS variables + PostCSS (future theming engine); interim uses SASS-less scoped CSS.
- **API Integration**: Fetch-based RPC client mirroring Angular `RpcService`, with typed contracts generated from existing YAML/JSON manifests (planned).
- **Packaging**: Debian `debian/rules` builds this workspace via `npm ci && npm run build`; output served from `/var/www/openmediavault/vue/`.

## Current Status
- Workspace scaffolding complete (Vite/Pinia/Vitest baseline, placeholder view).
- Config data loaders (`useRouteConfigs`, `useNavigationConfigs`) implemented with comprehensive unit tests.
- Router integrates dynamic routes via `configRoutesReady` promise; navigation store + sidebar layout render manifests in the UI shell.
- Snapshot harness in place for placeholder, navigation sidebar, and layout components.

## Immediate Tasks
1. Define theme-engine contract (runtime API + manifest expectations) before implementation.
2. Prototype RPC client wrapper mirroring Angular `RpcService` to unblock data-driven components.
3. Extend layout to include header/notification stubs and document interaction patterns.

## Testing Strategy
- Default to **test-driven development**: author or update unit/snapshot tests before modifying production code.
- Use Vitest snapshots (`expect(html).toMatchSnapshot()`) as visual confirmation for components; regenerate intentionally when UI changes.
- Exemption: the future theme engine must handle live updates from backend/plugins. Focus there on behavioral tests (e.g., theme switching flow) rather than brittle snapshots so runtime overrides stay flexible.

## Near-Term Milestones
- Intuition compatibility layer to render existing manifest-driven pages in Vue.
- Theme engine loader consuming `theme-registry.json`.
- Global layout shell replicating navigation/notification/task bars.
- RPC notification store consuming future WebGui RPC endpoints.

## Notes
- Keep this document updated as tooling decisions evolve.
- Any backend changes impacting the Vue workspace should be cross-linked in `/UI-Architecture.md`.
- When resuming a session, scan this file first to pick up in-flight tasks.

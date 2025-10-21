# Theme Engine Design Draft

Status: Draft (2025-03-14)  
Owner: Codex (Vue workspace)

## Goals
- Allow the Workbench UI to switch themes at runtime without rebuilding assets.
- Provide a documented manifest contract so core and plugin packages can contribute themes.
- Keep parity with existing Angular SCSS tokens while moving to runtime CSS variables.
- Support progressive enhancement: default theme bundled with core package, additional themes via `openmediavault-ui-theme-*` plugins.

## Theme Manifest Schema (proposed `theme.d/*.yaml`)
```yaml
version: "1.0"
type: theme
data:
  id: "omv-default"
  label: "Default"
  description: "OpenMediaVault default look & feel"
  inherits: null        # optional, reference to another theme ID
  tokens:
    colors:
      surfacePrimary: "#0c1c2c"
      surfacePrimaryMuted: "rgba(12, 28, 44, 0.65)"
      accent: "#ffc107"
      accentHover: "#ffb300"
      textPrimary: "#f4f6fa"
    typography:
      fontFamilyBase: "Inter, system-ui, sans-serif"
      fontFamilyHeading: "Inter, system-ui, sans-serif"
      fontSizeBase: "14px"
      fontWeightHeading: 600
    radius:
      card: "8px"
    icons:
      primary: "mdi:server"
      secondary: "mdi:folder"
  derivedTokens:
    colors:
      surfaceBorder: "color-mix(in srgb, var(--omv-colors-surfacePrimary) 85%, white)"
      accentActive: "color-mix(in srgb, var(--omv-colors-accent) 80%, black)"
  assets:
    logo: "/assets/themes/omv-default/logo.svg"
    favicon: "/assets/themes/omv-default/favicon.svg"
    fonts:
      - family: "Inter"
        weight: 400
        style: "normal"
        src: "/assets/themes/omv-default/fonts/inter-400.woff2"
      - family: "Inter"
        weight: 600
        style: "normal"
        src: "/assets/themes/omv-default/fonts/inter-600.woff2"
    iconSprite: "/assets/themes/omv-default/icons.svg"
    iconFontCss: "/assets/themes/omv-default/icons.css"
  metadata:
    author: "openmediavault"
    version: "1.0.0"
    tags: ["light", "default"]
```

### Derived JSON (`theme-registry.json`)
`omv-mkworkbench --theme` will:
- Validate YAML against JSON schema (including assets/fonts/icons sections).
- Resolve inheritance (`inherits`) by deep-merging tokens/assets/derived tokens.
- Emit `theme-registry.json` (layout shown below) and log optional warnings for missing relative assets (use `--verbose-missing-assets`). Packaged themes must still provide the actual font/icon files in the referenced location.
```json
{
  "themes": [
    {
      "id": "omv-default",
      "label": "Default",
      "tokens": {
        "colors.surfacePrimary": "#0c1c2c",
        "colors.surfacePrimaryMuted": "rgba(12, 28, 44, 0.65)",
        "colors.accent": "#ffc107",
        "colors.accentHover": "#ffb300",
        "typography.fontFamilyBase": "Inter, system-ui, sans-serif",
        "radius.card": "8px",
        "icons.primary": "mdi:server"
      },
      "derivedTokens": {
        "colors.surfaceBorder": "color-mix(in srgb, var(--omv-colors-surfacePrimary) 85%, white)",
        "colors.accentActive": "color-mix(in srgb, var(--omv-colors-accent) 80%, black)"
      },
      "assets": {
        "logo": "/assets/themes/omv-default/logo.svg",
        "fonts": [
          {
            "family": "Inter",
            "weight": 400,
            "style": "normal",
            "src": "/assets/themes/omv-default/fonts/inter-400.woff2"
          }
        ],
        "iconSprite": "/assets/themes/omv-default/icons.svg"
      },
      "metadata": {
        "version": "1.0.0",
        "author": "openmediavault"
      }
    }
  ],
  "defaultThemeId": "omv-default"
}
```

## Backend Integration Points
- Extend `omv-mkworkbench` CLI with `theme` command and include in `all` (builds registry + copies assets).
- Ship `theme-registry.json` to `/var/www/openmediavault/assets/theme-registry.json`. Actual assets (fonts, logos, sprites) must be included in the corresponding Debian package at the paths referenced by the manifest.
- Provide `Theme` RPC service (or extend `WebGui`) with methods:
  - `Theme.getAvailable`: returns registry + derived token metadata.
  - `Theme.setActive`: persists user/system preference (mirrors local storage approach) and returns resolved token set.
  - `Theme.preview`: optional temporary override for current session.
- Plugin install hook: copy theme YAML + assets into `usr/share/openmediavault/workbench/theme.d` and `.../theme-assets/<id>`.

## Vue Runtime API
- `useThemeEngine` composable
  - `state.activeThemeId` (`ref<string>`, persisted via RPC/local storage)
  - `state.tokens` (`Computed<Record<string, string>>`)
  - `loadThemes(): Promise<void>` fetches registry.
  - `applyTheme(id: string, options?: { persist?: boolean }): Promise<void>`
  - `registerAssets(theme: ThemeEntry)`: injects `<link>` / `<style>` for fonts/icons/logos.
  - Emits `themechange` event via mitt/EventEmitter for cross-component reactions.
- Runtime applies CSS variables by iterating tokens + derived tokens:
```ts
const applyTokens = (tokens: Record<string, string>) => {
  Object.entries(tokens).forEach(([token, value]) => {
    document.documentElement.style.setProperty(`--omv-${token}`, value);
  });
};
```
- Inject fonts/icons when present:
```ts
if (theme.assets?.fonts) {
  injectFontFaces(theme.assets.fonts);
}
if (theme.assets?.iconFontCss) {
  injectStylesheet(theme.assets.iconFontCss);
}
```

## Testing Strategy
- Unit tests for registry loader (mock `theme-registry.json`, ensure tokens/assets parsed correctly).
- Snapshot/DOM tests verifying CSS variables and injected `<style>/<link>` tags after `applyTheme`.
- API contract tests for manifest parser (`omv-mkworkbench`) using sample YAML fixtures.
- Mocked RPC tests to ensure persistence flows (user preferences stored via `WebGui`).

## Open Items
- Provide optional CLI helper to compute derived color tokens (e.g., lighten/darken) for theme authors.
- Define fallback when assets missing (ignore individual entries, warn via log?).
- Align with backend maintainers on RPC namespace (`Theme` vs `WebGui` extensions).
- Decide whether to support component overrides via `entryComponent` now or later.

## Next Steps
1. Create JSON schema for theme YAML and implement `omv-mkworkbench --theme` with asset copying + font CSS generation.
2. Scaffold `useThemeEngine` composable in Vue workspace with mocked registry + asset injection tests.
3. Update `AGENTS.md` / `UI-Architecture.md` once schema and runtime prototypes are review-ready.

# Repository Guidelines

## Project Structure & Module Organization
- Track the evolving UI rewrite strategy in [`UI-Architecture.md`](UI-Architecture.md).
- Packaging lives under `deb/`; the core NAS package is `deb/openmediavault`.
- PHP engine modules reside in `deb/openmediavault/usr/share/openmediavault/engined`.
- Python helpers live under `deb/openmediavault/usr/lib/python3/dist-packages/openmediavault`.
- Workbench descriptors sit in `deb/openmediavault/usr/share/openmediavault/workbench`.
- Plugin packages follow `deb/openmediavault-*`; extend services there and use `pbuilder/` or `vagrant/` only for full Debian builds.

## Build, Test, and Development Commands
- `make -C deb install` installs host build dependencies (fakeroot, debhelper, npm, lint tools).
- `make -C deb binary` runs `fakeroot debian/rules binary` for every package and emits `.deb` artifacts.
- `fakeroot debian/rules clean` (run inside a package directory) resets artifacts before rebuilding.
- `./buildenvadm.sh start` spins up a Podman builder with the repo mounted at `/srv/openmediavault`.

## Coding Style & Naming Conventions
- PHP under `engined/` follows the guideline linked from `CONTRIBUTING.md`: brace-on-same-line, tabs, snake_case config keys.
- Python code stays PEP 8 (4 spaces, lowercase_with_underscores); run `isort` and `autopep8`.
- Workbench YAML files keep the `omv-*.yaml` pattern with kebab-case filenames and camelCase property identifiers.

## UI Modification Workflow
- Workbench views are declarative YAML: components in `workbench/component.d`, dashboards in `dashboard.d`, logs in `log.d`, navigation entries in `navigation.d`, and routes in `route.d`.
- Add or update a page by pairing a component YAML with a route entry; expose it via `navigation.d` if it needs a sidebar link or dashboard tile.
- Reuse existing descriptors (`omv-storage-filesystem-generic-create-form-page.yaml` is a good template) and update binding identifiers to match backend RPC signatures.
- After editing YAML, rebuild the package (`make -C deb/openmediavault binary`) or deploy the file onto a dev install and refresh the Workbench to verify the change.

## Testing Guidelines
- Core unit tests are PHP-based; run `make -C deb/openmediavault/usr/share/openmediavault/unittests/php test`.
- Target a single file with `phpunit test_openmediavault_config_database.php`.
- Expand the suite whenever backend logic or schemas change to keep packaging CI green.

## Commit & Pull Request Guidelines
- Use imperative subjects (for example, `Fix resizing issue of Dashboard chart widgets`) and include `Signed-off-by:` plus any `Fixes: https://github.com/openmediavault/openmediavault/issues/<ID>`.
- Keep PRs to one commit, document the change, list tests, and attach UI screenshots or CLI output when relevant.
- Draft PRs are welcome during development; rebase before requesting review.

## Security & Configuration Tips
- Follow `SECURITY.md` for vulnerability handling and keep secrets out of tracked configs.
- Config templates under `deb/openmediavault/etc` deploy to user systems—verify permissions and default to least privilege.

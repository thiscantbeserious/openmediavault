import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import getpass
import pytest

pytest.importorskip("click")


def get_repo_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "deb").is_dir():
            return parent
    raise RuntimeError("Repository root not found")


def test_mkworkbench_theme_command_generates_registry():
    if (
        subprocess.run(
            [sys.executable, "-c", "import click"], capture_output=True, text=True
        ).returncode
        != 0
    ):
        pytest.skip("click module required for omv-mkworkbench script")

    repo_root = get_repo_root()
    script_path = repo_root / "deb/openmediavault/usr/sbin/omv-mkworkbench"

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        theme_dir = tmp_path / "theme.d"
        theme_dir.mkdir()

        (theme_dir / "default.yaml").write_text(
            "\n".join(
                [
                    'version: "1.0"',
                    "type: theme",
                    "data:",
                    "  id: omv-default",
                    "  label: Default",
                    "  default: true",
                    "  tokens:",
                    "    colors:",
                    '      surfacePrimary: "#111111"',
                    '      textPrimary: "#ffffff"',
                    "    typography:",
                    '      fontFamilyBase: "Inter, sans-serif"',
                    "  derivedTokens:",
                    "    colors:",
                    '      surfaceBorder: "var(--omv-colors-surfacePrimary)"',
                    "  assets:",
                    "    fonts:",
                    '      - family: "Inter"',
                    "        weight: 400",
                    '        style: "normal"',
                    '        src: "/assets/themes/omv-default/fonts/inter-400.woff2"',
                ]
            )
            + "\n",
            encoding="utf-8",
        )

        (theme_dir / "dark.yaml").write_text(
            "\n".join(
                [
                    'version: "1.0"',
                    "type: theme",
                    "data:",
                    "  id: omv-dark",
                    "  label: Dark",
                    "  inherits: omv-default",
                    "  tokens:",
                    "    colors:",
                    '      surfacePrimary: "#000000"',
                    '      accent: "#ff00ff"',
                    "  assets:",
                    '    logo: "/assets/themes/omv-dark/logo.svg"',
                ]
            )
            + "\n",
            encoding="utf-8",
        )

        registry_file = tmp_path / "theme-registry.json"

        env = os.environ.copy()
        env["OMV_WORKBENCH_THEME_CONFIG_DIR"] = str(theme_dir)
        env["OMV_WORKBENCH_THEME_REGISTRY_FILE"] = str(registry_file)
        env["OMV_WEBGUI_FILE_OWNERGROUP_NAME"] = getpass.getuser()
        existing_pythonpath = env.get("PYTHONPATH", "")
        new_paths = [
            str(repo_root / "deb/openmediavault/usr/lib/python3/dist-packages")
        ]
        if existing_pythonpath:
            new_paths.append(existing_pythonpath)
        env["PYTHONPATH"] = os.pathsep.join(new_paths)

        result = subprocess.run(
            [str(script_path), "theme"],
            env=env,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 and "ModuleNotFoundError" in result.stderr:
            pytest.skip("click module required for omv-mkworkbench script")
        assert result.returncode == 0, result.stderr

        registry = json.loads(registry_file.read_text(encoding="utf-8"))
        assert registry["defaultThemeId"] == "omv-default"
        assert len(registry["themes"]) == 2

        dark_entry = next(
            item for item in registry["themes"] if item["id"] == "omv-dark"
        )
        default_entry = next(
            item for item in registry["themes"] if item["id"] == "omv-default"
        )

        assert dark_entry["tokens"]["colors.textPrimary"] == "#ffffff"
        assert dark_entry["tokens"]["colors.accent"] == "#ff00ff"
        assert (
            default_entry["derivedTokens"]["colors.surfaceBorder"]
            == "var(--omv-colors-surfacePrimary)"
        )
        assert default_entry["assets"]["fonts"][0]["family"] == "Inter"

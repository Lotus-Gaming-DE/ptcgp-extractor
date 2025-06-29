"""Fetch card and set data using the Node.js exporter."""

from __future__ import annotations

import argparse
import subprocess
from typing import List

try:  # support running as a script or module
    from .run_export import load_env
except ImportError:  # pragma: no cover - fallback for CLI usage
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parent))
    from run_export import load_env
from scripts.run_export import load_env


def main(argv: List[str] | None = None) -> None:
    """Run the Node.js export script."""
    parser = argparse.ArgumentParser(
        description="Fetch cards and sets and store them in data/export/",
    )
    parser.parse_args(argv)

    load_env()
    subprocess.run(["node", "dist/export.js"], check=True)


if __name__ == "__main__":  # pragma: no cover - CLI entry
    main()

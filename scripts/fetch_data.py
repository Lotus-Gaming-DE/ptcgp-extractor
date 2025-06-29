"""Fetch card and set data using the Node.js exporter."""

from __future__ import annotations

import argparse
import subprocess
from typing import List

try:  # support running as a script or module
    from . import run_export
except ImportError:  # pragma: no cover - fallback for CLI usage
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parent))
    import run_export


def main(argv: List[str] | None = None) -> None:
    """Run the Node.js export script."""
    parser = argparse.ArgumentParser(
        description="Fetch cards and sets and store them in data/export/",
    )
    parser.parse_args(argv)

    run_export.load_env()
    subprocess.run(["node", "dist/export.js"], check=True)


if __name__ == "__main__":  # pragma: no cover - CLI entry
    main()

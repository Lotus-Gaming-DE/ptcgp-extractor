"""Run the Node.js export script with environment variables."""

import argparse
import os
import subprocess
from typing import List


def load_env(path: str = ".env") -> None:
    """Load environment variables from *path* if the file exists."""
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, value = line.split("=", 1)
                    if key and value:
                        os.environ.setdefault(key, value)


def main(argv: List[str] | None = None) -> None:
    """Entry point for the export helper."""
    parser = argparse.ArgumentParser(
        description="Run the export script with optional .env variables.",
    )
    parser.add_argument(
        "args", nargs=argparse.REMAINDER, help="Arguments passed to export.js"
    )
    parsed = parser.parse_args(argv)

    load_env()
    cmd = ["node", "dist/export.js"] + parsed.args
    subprocess.run(cmd, check=True)


if __name__ == "__main__":  # pragma: no cover - CLI entry
    main()

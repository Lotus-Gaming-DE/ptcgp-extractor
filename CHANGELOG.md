# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Added validation for the `CONCURRENCY` environment variable; values must be positive integers.
- `mapLimit` now throws an error when the concurrency limit is zero or negative.
- `writeData` writes files atomically via temporary files.
- Logger outputs now include timestamps.
- GitHub workflow runs linting and collects test coverage.
- Documentation updated to describe new behavior and environment variable rules.
- Logs are now written to `logs/app-<date>.log` with daily rotation and seven-day retention.
- New environment variable `LOG_DIR` configures the log directory.
- Removed runtime dependency on `ts-node`.
- Moved tests to `tests/` and updated tooling paths.
- Added `winston` for structured logging and `winston-daily-rotate-file` for log rotation.
- CI workflow uploads logs as an artifact and cleans the `logs/` directory.

- Allow running on Node.js 20 or newer.
- Added Python-based linting hooks (Black, Flake8, Ruff) and `pip-audit`
  via Pre-commit.
- Updated documentation and tests.
- Improved path validation and error handling in export script.
- Export script now throws errors instead of exiting directly.
- Node version check throws an error; CLI logs once and exits with code 1.
- Added concurrency limit for loading files and split library code into `src/lib.ts`.
- Added security note in README.
- Concurrency values above 100 are now capped.
- CLI supports `--concurrency` and `--out` flags.
- Logger respects `LOG_LEVEL` environment variable.
- Path validation rejects control characters in `TCGDEX_REPO`.
- Updated dev dependencies and added separate CI workflow for lint and tests.
- Introduced logger utility and replaced direct console output.
- Added tests for write failures and sample export.
- Repo directory path is now validated on startup and must lie within the project.
- New `CONCURRENCY` env variable allows adjusting parallel file loading.
- Extended TypeScript interfaces and improved documentation of JSON format.
- Temporary files are cleaned up on write failures.
- Repository path validation rejects symbolic links outside the project.
- Development dependencies updated (e.g., @types/node).
- Updated @types/node to version 24.0.4.
- TypeScript config now includes `"lib": ["es2020"]` for newer APIs.
- Added tests for CLI argument parsing.
- Logger now outputs structured JSON.
- `DEBUG` environment variable logs excerpts of exported files.
- Pre-commit hooks enforce formatting and linting.
- CI runs `npm audit --production` and pre-commit checks.
- `.nvmrc` added to pin Node version locally.
- README now links to `docs/json-format.md` and weist auf `.env.example` hin.
- CI lädt Testabdeckung als Artefakt hoch und führt `npx snyk test` aus.
- Added Python tooling (Black, Flake8, Ruff) to pre-commit configuration.
- Dependabot prüft nun npm-Abhängigkeiten und GitHub-Actions-Workflows;
  zugehörige Pull Requests laufen durch die CI.
- Dependabot überwacht jetzt zusätzlich die Python-Abhängigkeiten täglich;
  entsprechende Pull Requests durchlaufen die komplette CI mit Tests,
  Linting und `pip-audit`.
- CI caches npm and pre-commit directories and uploads Railway logs as artifact.
- Added `LOG_ROTATION_INTERVAL` and `LOG_MAX_SIZE` environment variables with
  matching documentation and `.env.example` entries.
- Introduced `scripts/run-export.sh` convenience script for running the export
  with environment variables.
- Updated dev dependencies and removed unused `ts-node`.

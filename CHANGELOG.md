# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Allow running on Node.js 20 or newer.
- Updated documentation and tests.
- Improved path validation and error handling in export script.
- Export script now throws errors instead of exiting directly.
- Node version check throws an error; CLI logs once and exits with code 1.
- Added concurrency limit for loading files and split library code into `src/lib.ts`.
- Added security note in README.
- Introduced logger utility and replaced direct console output.
- Added tests for write failures and sample export.
- Repo directory path is now validated on startup and must lie within the project.
- New `CONCURRENCY` env variable allows adjusting parallel file loading.

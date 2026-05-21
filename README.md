# SourceDash

Project handover scanner. Generate a practical report on what is present, what is missing, and what should be fixed first before a repo is easy to maintain.

`sourcedash` scans a local project path or a GitHub repository URL and writes timestamped Markdown and JSON reports to a local history store. It is built for the first maintenance question on an unfamiliar repo: what shape is this project actually in?

## What It Does

- scans a local path or GitHub repository URL
- checks for `package.json`, scripts, dependency counts, and whether the project is a CLI
- checks `README.md` for install/setup, usage, environment, and license sections
- detects missing project files such as `.env.example`, `Dockerfile`, Docker Compose, and GitHub Actions workflows
- detects large committed files
- calculates a config-driven readiness score with warnings and recommendations
- stores every scan as a separate snapshot in `~/.sourcedash/scans`

## Requirements

- Node 22+
- npm

## Install

```bash
git clone https://github.com/psandis/sourcedash.git
cd sourcedash
npm install
```

## Quick Start

```bash
npm run dev -- scan .
npm run dev -- scan ../myproject
npm run dev -- scan https://github.com/psandis/dietclaw
```

## CLI

All commands are currently run with `npm run dev -- <command>`.

### Scan a local project

```bash
npm run dev -- scan .
```

```
Scanning ....

Scan complete.
Score: 70/100

Warnings:
  ! No README file found.
  ! .env.example is missing.

Report written to /Users/you/.sourcedash/scans/local/sourcedash/2026-05-21T18-36-51
```

### Scan a GitHub repository

```bash
npm run dev -- scan https://github.com/psandis/dietclaw
```

```
Cloning https://github.com/psandis/dietclaw...
Clone complete. Scanning...

Scan complete.
Score: 97/100

Warnings:
  ! 1 large file(s) found in the repository.

Report written to /Users/you/.sourcedash/scans/psandis/dietclaw/2026-05-21T17-26-59
```

Notes:

- GitHub repositories are cloned into a temporary folder inside the scan output directory
- the temporary clone is removed automatically after the scan
- each scan gets a new timestamped folder, nothing is overwritten

## Configuration

All scan behavior lives in `data/defaults.jsonc` — a JSONC file with inline comments explaining every option. No code changes needed to:

- choose which output formats to write (`md`, `json`)
- change the large file threshold
- change how many large files to include in the report
- change ignore patterns
- change scoring deductions

Current scoring deductions:

- missing README: `20`
- README missing install/setup section: `8`
- missing test script: `8`
- missing build script: `8`
- missing `.env.example`: `10`
- large files: `3` points each, capped at `15`

CLI projects are not penalized for missing `.env.example`.

## Storage

All reports are stored locally in `~/.sourcedash/scans`.

```text
~/.sourcedash/
  scans/
    psandis/
      dietclaw/
        2025-05-21T17-26-59/
          report.md
          report.json
    local/
      sourcedash/
        2025-05-21T18-36-51/
          report.md
          report.json
```

This keeps scan history over time and avoids overwriting previous results.

## File Structure

```text
sourcedash/
├── src/
│   ├── cli.ts                     # CLI entry point
│   ├── core/
│   │   ├── config.ts              # config loading
│   │   ├── store.ts               # report storage path resolution
│   │   └── types.ts               # shared scan result types
│   ├── reports/
│   │   └── markdownReport.ts      # markdown report generator
│   └── scanners/
│       ├── fileScanner.ts         # file presence and large file checks
│       ├── packageScanner.ts      # package.json analysis
│       ├── projectScanner.ts      # scoring and scan orchestration
│       └── readmeScanner.ts       # README section checks
├── data/
│   └── defaults.jsonc             # config-driven scan and scoring rules
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
git clone https://github.com/psandis/sourcedash.git
cd sourcedash
npm install
npm run build
npm run dev -- scan .
```

## Related

- 🦀 [Dietclaw](https://github.com/psandis/dietclaw) — Codebase health monitor
- 🦀 [Dustclaw](https://github.com/psandis/dustclaw) — Find out what is eating your disk space
- 🦀 [Driftclaw](https://github.com/psandis/driftclaw) — Deployment drift detection across environments
- 🦀 [Feedclaw](https://github.com/psandis/feedclaw) — RSS/Atom feed reader and AI digest builder
- 🦀 [Mymailclaw](https://github.com/psandis/mymailclaw) — Email scanner, categorizer, and cleaner
- 🦀 [Psclawmcp](https://github.com/psandis/psclawmcp) — MCP server for the OpenClaw CLI ecosystem
- 🦀 [Speak2text](https://github.com/psandis/speak2text) — Transcribe audio and video files using OpenAI Whisper
- 🦀 [Stackscope](https://github.com/psandis/stackscope) — Architecture discovery CLI
- 🦀 [Text2speak](https://github.com/psandis/text2speak) — Convert text files to audio using OpenAI TTS
- 🦀 [Wiremonitor](https://github.com/psandis/wiremonitor) — Network traffic web dashboard for wirewatch
- 🦀 [Wirewatch](https://github.com/psandis/wirewatch) — Network traffic monitor with AI-assisted anomaly detection
- 🦀 [OpenClaw](https://github.com/openclaw/openclaw) — The open claw ecosystem

## License

See [MIT](LICENSE)

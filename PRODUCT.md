# SourceDash — Project Plan and Architecture

## 1. Project Summary

**SourceDash** is a local-first codebase inspection tool for developers, consultants, and technical leads.

The first version is not a SaaS product and not primarily a dashboard. The core idea is:

```text
scan repository → analyze project readiness → generate practical report → optionally explore in GUI later
```

SourceDash helps answer:

> If I take over this codebase, what do I need to understand first, what is missing, and what should be fixed before this project is easy to maintain?

The initial product is a **TypeScript + Node.js CLI tool** that scans a local project folder and generates:

```text
.sourcedash/report.md
.sourcedash/report.json
```

A local GUI can be added later, but the first real value must come from the report and analysis.

---

## 2. Why This Project Exists

The original idea started from discussing whether to build an OpenClaw Console / MOCC-style dashboard around existing CLI tools.

That idea was challenged because a plain dashboard around CLI tools would not be valuable enough if it only did this:

```text
run tool → show JSON
```

The stronger idea became:

```text
local-first project / repository inspection
```

The problem is real for:

- consultants taking over a client project
- developers joining an existing codebase
- freelancers reviewing a project before quoting work
- technical leads checking project readiness
- maintainers wanting a fast overview of repo quality
- developers preparing GitHub portfolio projects

The tool should not only inspect files. It should produce a useful **brief/report** that explains the project condition in plain terms.

---

## 3. Positioning

### Short positioning

```text
SourceDash is a local-first codebase inspection, reporting, and dashboard tool for developers and consultants.
```

### More practical positioning

```text
SourceDash scans a software project and generates a practical local report about repository structure, setup readiness, dependencies, documentation, bloat, and maintainability signals.
```

### Not this

```text
Just a GUI wrapper for CLI tools.
```

### But this

```text
A local-first project inspection engine with CLI reports first and optional GUI later.
```

---

## 4. Product Type

SourceDash v0.1 is:

```text
TypeScript + Node.js CLI project
```

It is **not yet**:

```text
React app
Vue app
SaaS
hosted dashboard
full OpenClaw console
AI agent product
```

A GUI can be added later using React/Vite or Next.js.

---

## 5. Core User Flow

### Basic CLI usage

```bash
sourcedash scan .
```

This scans the current repository and writes:

```text
.sourcedash/report.md
.sourcedash/report.json
```

### Future usage

```bash
sourcedash report
sourcedash doctor
sourcedash history
sourcedash start
```

Where:

- `scan` analyzes the project
- `report` opens or prints the last report
- `doctor` gives prioritized fixes
- `history` compares previous scans
- `start` opens optional local GUI

---

## 6. MVP Scope

The MVP must stay small and useful.

### MVP features

SourceDash v0.1 should check:

1. Project metadata
2. README quality
3. `package.json` scripts and dependencies
4. `.env.example`
5. Docker / Docker Compose files
6. GitHub Actions workflow presence
7. Large files
8. Build/cache folders
9. Basic project readiness score
10. Markdown and JSON report generation

### MVP output

```text
.sourcedash/report.md
.sourcedash/report.json
```

### MVP must avoid

Do not start with:

- SaaS
- authentication
- cloud storage
- complex dashboard
- plugin marketplace
- AI features
- multi-user support
- OpenClaw integration
- SQLite history

Those can come later.

---

## 7. Architecture Overview

### v0.1 Architecture

```text
SourceDash CLI
    |
    |-- scanners
    |     |-- packageScanner
    |     |-- readmeScanner
    |     |-- fileScanner
    |     |-- projectScanner
    |
    |-- scoring
    |     |-- basic readiness score
    |
    |-- reports
    |     |-- markdown report
    |     |-- json report
    |
    |-- output
          |-- .sourcedash/report.md
          |-- .sourcedash/report.json
```

### Technology stack

```text
Language: TypeScript
Runtime: Node.js
CLI framework: commander
Terminal output: chalk
File scanning: fast-glob
File utilities: fs-extra
Git support later: simple-git
Package manager: npm
Module system: ESM / NodeNext
```

### Current module decision

Use:

```json
"type": "module"
```

and TypeScript config:

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext"
}
```

This allows modern ESM-style imports.

---

## 8. Suggested Project Structure

```text
sourcedash/
  src/
    cli.ts
    core/
      types.ts
    scanners/
      projectScanner.ts
      packageScanner.ts
      readmeScanner.ts
      fileScanner.ts
    reports/
      markdownReport.ts
  package.json
  tsconfig.json
  README.md
  LICENSE
```

Future structure:

```text
sourcedash/
  src/
    cli.ts
    core/
      types.ts
      scoring.ts
    scanners/
      projectScanner.ts
      packageScanner.ts
      readmeScanner.ts
      fileScanner.ts
      gitScanner.ts
      frameworkScanner.ts
      ciScanner.ts
    reports/
      markdownReport.ts
      htmlReport.ts
      jsonReport.ts
    gui/
      server.ts
      app/
```

---

## 9. Data Model

### ProjectScanResult

The first report can use a simple object:

```ts
export type ProjectScanResult = {
  scannedAt: string;
  path: string;
  packageInfo: PackageInfo;
  readmeInfo: ReadmeInfo;
  fileInfo: FileInfo;
  score: number;
  warnings: string[];
  recommendations: string[];
};
```

### PackageInfo

```ts
export type PackageInfo = {
  exists: boolean;
  name?: string;
  version?: string;
  scripts: string[];
  dependenciesCount: number;
  devDependenciesCount: number;
};
```

### ReadmeInfo

```ts
export type ReadmeInfo = {
  exists: boolean;
  hasInstallSection: boolean;
  hasUsageSection: boolean;
  hasEnvSection: boolean;
  hasLicenseSection: boolean;
};
```

### FileInfo

```ts
export type FileInfo = {
  hasEnvExample: boolean;
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  hasGitHubActions: boolean;
  largeFiles: Array<{
    path: string;
    sizeMb: number;
  }>;
};
```

---

## 10. Scoring Idea

The score is not meant to be scientific in v0.1. It is a practical readiness indicator.

Start from:

```text
100 points
```

Subtract points for missing or weak signals:

```text
README missing: -20
README lacks install/setup section: -8
.env.example missing: -10
No test script: -8
No build script: -8
Large files found: -3 each, max -15
```

The report should always explain why the score changed.

Example:

```text
Score: 72/100

Warnings:
- .env.example is missing.
- No test script found.
- README does not explain local setup.
- 3 large files found.

Top actions:
1. Add .env.example.
2. Add local setup instructions.
3. Add or document testing approach.
4. Review large files.
```

---

## 11. Report Philosophy

The report is the product.

The report should be:

- practical
- readable
- useful without GUI
- suitable for consultants
- suitable for project takeover
- suitable for GitHub portfolio improvement

It should avoid vague output like:

```text
Project health is bad.
```

It should instead say:

```text
The project is missing local setup documentation and does not include an .env.example file, which makes onboarding harder.
```

---

## 12. Example Report Output

```markdown
# SourceDash Project Report

Generated: 2026-05-20T20:00:00.000Z

Project path:

```text
/Users/petri/projects/example-app
```

## Score

72/100

## Package

- package.json exists: yes
- name: example-app
- version: 0.1.0
- scripts: dev, build, start
- dependencies: 18
- devDependencies: 12

## README

- README exists: yes
- install/setup section: no
- usage/run section: yes
- environment section: no
- license section: no

## Project Files

- .env.example: no
- Dockerfile: yes
- Docker Compose: no
- GitHub Actions: yes

## Large Files

- public/demo-video.mov (18.2 MB)

## Warnings

- README does not seem to include installation instructions.
- .env.example is missing.
- No test script found in package.json.
- 1 large file found.

## Recommendations

1. Add an install/setup section to README.
2. Add .env.example so the project can be configured locally.
3. Add a test script or document the testing approach.
4. Review large files and remove generated artifacts from the repository.
```

---

## 13. Development Plan

### Milestone 0 — Project setup

Goal: make the TypeScript CLI project run.

Tasks:

- create `sourcedash` folder
- initialize npm
- add TypeScript
- add commander/chalk/fast-glob/fs-extra/simple-git
- set `"type": "module"`
- configure `tsconfig.json`
- create `src/cli.ts`
- test `npm run dev`

Success criteria:

```bash
npm run dev
```

prints:

```text
SourceDash works
```

---

### Milestone 1 — First scan command

Goal: run:

```bash
npm run dev -- scan .
```

Tasks:

- implement CLI command
- validate target path
- call project scanner
- write `.sourcedash/report.json`
- write `.sourcedash/report.md`

Success criteria:

```text
.sourcedash/report.md exists
.sourcedash/report.json exists
```

---

### Milestone 2 — Basic scanners

Goal: detect project basics.

Tasks:

- implement `packageScanner`
- implement `readmeScanner`
- implement `fileScanner`
- implement basic score
- implement warnings and recommendations

Success criteria:

Report includes:

- package info
- scripts
- dependency counts
- README checks
- `.env.example` check
- Docker checks
- GitHub Actions check
- large files

---

### Milestone 3 — Better report quality

Goal: make the Markdown report actually useful.

Tasks:

- improve wording
- add summary section
- add “good signals”
- add “warnings”
- add “top actions”
- add “project readiness” section

Success criteria:

A developer can read the report and know what to fix first.

---

### Milestone 4 — Git scanner

Goal: add Git context.

Tasks:

- branch name
- dirty working tree status
- last commit date
- remote URL
- commit count maybe
- untracked files count

Possible library:

```text
simple-git
```

Report should include:

```text
Git branch
Working tree clean/dirty
Last commit
Remote URL
```

---

### Milestone 5 — Framework detection

Goal: identify stack quickly.

Detect:

- Next.js
- React
- Vue
- Node.js
- Express
- Spring Boot
- Laravel
- Python/FastAPI
- Dockerized project

Output:

```text
Detected stack: Next.js + TypeScript
```

---

### Milestone 6 — HTML report

Goal: generate a shareable local HTML report.

Output:

```text
.sourcedash/report.html
```

This can come before full GUI.

---

### Milestone 7 — Optional local GUI

Goal: run:

```bash
sourcedash start
```

and open:

```text
http://localhost:3333
```

GUI stack options:

```text
React + Vite
or
Next.js
```

The GUI should read `.sourcedash/report.json` and display:

- overview
- score
- warnings
- recommendations
- files
- dependencies
- README readiness
- Git status

---

### Milestone 8 — History

Goal: compare scans over time.

Possible storage:

```text
SQLite
```

Track:

- score over time
- dependency count over time
- large file count over time
- warnings over time
- last scan date

---

## 14. CLI Commands

### v0.1

```bash
sourcedash scan .
```

### Later

```bash
sourcedash report
sourcedash doctor
sourcedash history
sourcedash start
```

### Possible future flags

```bash
sourcedash scan . --json
sourcedash scan . --output ./audit
sourcedash scan . --no-large-files
sourcedash scan . --format markdown
sourcedash scan . --format html
```

---

## 15. Open Source / Commercial Direction

Recommended direction:

```text
Open source first
MIT license
CLI + report as core
commercial potential later
```

### Why open source first?

Because this is strongest as:

- portfolio project
- developer tool
- consultant utility
- proof of architecture thinking
- possible OpenClaw-related ecosystem component

### Commercial potential later

Possible paid/pro features later:

- PDF reports
- GitHub organization scan
- scheduled scans
- team dashboard
- hosted version
- client-ready audit reports
- project takeover reports
- CI integration
- Slack/Teams alerts

But not in MVP.

---

## 16. Relationship to OpenClaw

SourceDash can stay independent from OpenClaw at first.

Later, it may integrate OpenClaw tools:

```text
dustclaw → disk/bloat scanning
dietclaw → dependency/codebase bloat
driftclaw → environment version drift
wirewatch → network signal
stackscope → architecture discovery
```

But the first version should not depend on them.

Good direction:

```text
SourceDash core works standalone.
OpenClaw integrations can be added later.
```

---

## 17. Naming Discussion

Many names were considered:

- MOCC
- MOCCOps
- MocDeck
- Mocco
- Moclawia
- RepoPulse
- RepoLens
- RepoVitals
- ClawVitals
- ClawLens
- OpenDeck
- RepoSource
- SourceLens / SourceLense
- SourceDash

### Current chosen working name

```text
SourceDash
```

### Reason

It keeps the GUI/dashboard option open, while still allowing CLI/report-first development.

### Name caveat

The product must not become “just a dashboard.”

The positioning should remain:

```text
Local-first codebase inspection, reports, and dashboard.
```

Not:

```text
Dashboard for source code.
```

---

## 18. Critical Assessment

This is a good project if it stays focused.

### Strong as

```text
open source tool
portfolio project
consultant utility
developer workflow tool
project takeover helper
GitHub repo quality checker
```

### Weak as

```text
immediate SaaS
generic dashboard
another health score tool
GUI wrapper around CLI output
```

### Main risk

The biggest risk is building too much UI before the core report is useful.

### Rule

If the Markdown report is not useful by itself, the project is not ready for GUI.

---

## 19. Recommended First Implementation

Build in this order:

```text
1. TypeScript CLI skeleton
2. scan command
3. JSON output
4. Markdown output
5. package.json scanner
6. README scanner
7. file scanner
8. scoring
9. warnings and recommendations
10. Git scanner
11. framework detection
12. HTML report
13. local GUI
```

---

## 20. Immediate Next Steps in VS Code

Run:

```bash
mkdir sourcedash
cd sourcedash
code .
npm init -y
npm install commander chalk fast-glob fs-extra simple-git
npm install -D typescript tsx @types/node @types/fs-extra
npx tsc --init
```

Use:

```json
"type": "module"
```

Create folders:

```bash
mkdir -p src/core src/scanners src/reports
touch src/cli.ts
touch src/core/types.ts
touch src/scanners/projectScanner.ts
touch src/scanners/packageScanner.ts
touch src/scanners/readmeScanner.ts
touch src/scanners/fileScanner.ts
touch src/reports/markdownReport.ts
```

First success target:

```bash
npm run dev -- scan .
```

Expected output:

```text
.sourcedash/report.md
.sourcedash/report.json
```

---

## 21. One Sentence Final Definition

```text
SourceDash is a local-first TypeScript/Node.js tool that scans a software project and generates practical reports and optional dashboard views to help developers and consultants understand, take over, and improve codebases faster.
```

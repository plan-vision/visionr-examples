# VisionR Examples Agent Guide

This repository contains runnable VisionR example projects and optional
prompt-only starter directories. This file is only the repository-level
customization layer for examples. Do not copy the full project-agent template
here.

## Required Base Instructions

Before changing any example project, resolve the VisionR engine root:

```console
vrs dir
```

Then read and follow the shared project agent guide from the engine:

```text
<engine-root-dir>/src/doc/project/project-agent-guide.md
```

Also read the engine repository guide when working from a source checkout:

```text
<engine-root-dir>/AGENTS.md
```

In the standard local source layout these are usually:

```text
C:\git\visionr-engine\src\doc\project\project-agent-guide.md
C:\git\visionr-engine\AGENTS.md
```

Use `vrs dir` when available instead of assuming the hardcoded path.

Nested example projects may add their own `AGENTS.md` for project-specific
overrides. Those files should also extend the engine template instead of copying
it.

## Examples Repository Defaults

The repository root is not a VisionR application project. Work from an example
project directory that contains `visionr.json`, such as:

```console
cd helloworld
vrs compile
vrs import
vrs start -devel
```

Current example areas:

| Path | Role |
| --- | --- |
| `helloworld` | runnable project for model/forms/server/API basics, public and restricted pages, and service/export examples |
| `helloworld/portable` | minimal portable/runtime configuration exported from `helloworld` |
| `infradash` | runnable multi-schema infrastructure dashboard with relations, initial data, i18n, generated data, docs, and a main page |
| `students-courses` | runnable student/course management project with nested departments, dashboards, calendars, i18n, seed data, and source-backed icons |

Use project npm scripts when they exist and match the task, for example
`npm run build`, `npm run import`, `npm run start`, or `npm run update`.

## Directory Structure

Runnable projects normally contain:

| Path | Role |
| --- | --- |
| `visionr.json` | project runtime/build configuration |
| `package.json` | npm scripts and project metadata |
| `src/model` | model API modules, schemas, i18n, initial data, and generated imports |
| `src/forms` | form templates and pages |
| `src/srv` | server-side JavaScript loaders, APIs, and supporting scripts |
| `src/service` | project web service examples when present |
| `doc` | project-specific documentation when present |
| `target`, `data`, `work`, `log`, `upload` | generated/runtime state; do not edit by hand |

Prompt-only starters are intentionally different. A directory with a
`PROMPT.txt` but no `visionr.json` is not a runnable VisionR project yet. Treat
it as an optional empty project request: the user can enter that directory,
paste the contents of `PROMPT.txt` to the agent, and ask the agent to build the
project there. A runnable project may retain its original `PROMPT.txt` as
generation provenance; the presence of that file alone does not make it a
prompt-only starter when `visionr.json` is also present.

## Example Work Rules

- Keep examples small, runnable, and source-backed.
- If a directory has `PROMPT.txt` but no `visionr.json`, do not run compile or
  import there until a VisionR project has been generated.
- When building from a prompt-only starter, create the normal project structure
  in that same directory, then verify it like any other generated example.
- Prefer the model API under `src/model` for new schemas, i18n, initial data,
  server APIs, and generated form defaults.
- Add or update form pages only when the example goal includes a visible UI.
- Verify meaningful changes with the narrowest useful command, usually
  `vrs compile`, `vrs import`, and a project task through `vr run <task>`.
- Do not edit generated/runtime folders by hand: `target`, `data`, `work`,
  `log`, or `upload`.
- Do not run release/upload scripts unless the user explicitly asks for release
  work.
- Do not commit unless the user explicitly asks for a commit.

## Repository Release Scripts

Root `package.json` scripts are for packaging and publishing examples, not for
normal project development:

```console
npm run build:generated
npm run build:release
npm run release
```

## Local Example Customization

When a task is specific to an example, follow that example's existing structure
first. If the example conflicts with the shared engine template, prefer the
engine template for new work and keep compatibility notes in the changed files
or final response.

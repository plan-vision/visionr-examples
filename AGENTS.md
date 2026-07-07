# VisionR Examples Agent Guide

This repository contains runnable VisionR example projects. This file is only
the repository-level customization layer for examples. Do not copy the full
project-agent template here.

## Required Base Instructions

Before changing any example project, resolve the VisionR engine root:

```console
vrs dir
```

Then read and follow the shared project-agent template from the engine:

```text
<engine-root-dir>/src/doc/project/agents-template.md
```

Also read the engine repository guide when working from a source checkout:

```text
<engine-root-dir>/AGENTS.md
```

In the standard local source layout these are usually:

```text
C:\git\visionr-engine\src\doc\project\agents-template.md
C:\git\visionr-engine\AGENTS.md
```

Use `vrs dir` when available instead of assuming the hardcoded path.

Nested example projects may add their own `AGENTS.md` for project-specific
overrides. Those files should also extend the engine template instead of copying
it.

## Examples Repository Defaults

The repository root is not a VisionR application project. Work from the example
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
| `helloworld` | minimal runnable project for model/forms/server/API basics |
| `infradash` | multi-schema project with relations, initial data, i18n, and pages |
| `students-courses` | prompt/reference material for generated student/course examples |

Use project npm scripts when they exist and match the task, for example
`npm run build`, `npm run import`, `npm run start`, or `npm run update`.

## Example Work Rules

- Keep examples small, runnable, and source-backed.
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

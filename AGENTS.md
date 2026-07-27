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

This repository is a collection of separate VisionR projects. The repository
root is not itself a VisionR application and is not the place to run project
compile, import, development-server, or agent-runner commands.

Choose exactly one example directory containing `visionr.json` and use it as
the working directory for the whole project operation:

```console
cd helloworld
npm run devel
```

Do not treat sibling examples as modules of one application. Each runnable
example has its own `visionr.json`, npm scripts, database, generated state,
logs, uploads, server lifecycle, and project-local agent-runner state. Before
running any npm, `vrs`, or `vr run` command, confirm the current directory and
read that project's `package.json` plus any nested `AGENTS.md`.

Current example areas:

| Path | Role |
| --- | --- |
| `helloworld` | runnable project for model/forms/server/API basics, public and restricted pages, and service/export examples |
| `helloworld/portable` | minimal portable/runtime configuration exported from `helloworld` |
| `infradash` | runnable multi-schema infrastructure dashboard with relations, initial data, i18n, generated data, docs, and a main page |
| `students-courses` | runnable student/course management project with nested departments, dashboards, calendars, i18n, seed data, and source-backed icons |

For normal work on examples, development is the priority. Prefer the selected
project's development scripts and live server over production builds or release
packaging.

## Development Workflow

Run these commands from the selected example project, never from the repository
root.

For manual live development:

```console
npm run devel
```

This starts that project in development mode and normally remains attached to
the terminal. Keep it running while editing backend JavaScript and Forms
sources that development mode reloads. Use `npm run start` only when its
project-specific extra options are wanted; inspect `package.json` because
`start` and `devel` need not be identical.

For a project-local agent-managed live server:

```console
vrs agent status
vrs agent start
```

The local agent runner owns one server for the current project. It is not the
AI agent and it is not repository-wide. Use it when the development session
needs persistent server lifecycle, logs, or backend evaluation. Do not also
start `npm run devel` for the same project.

Apply model/schema changes through the current project's development update
script:

```console
npm run update:devel
```

The exact implementation differs by example. Always inspect the script rather
than replacing it with an assumed command. For example,
`students-courses` uses the model schema-development compile/import workflow,
while older examples currently use their own development compile/import
wrapper.

Some projects may provide:

```console
npm run reset:devel
```

This is not a routine refresh. It can drop or replace the local project
database before rebuilding the development schema. Only use it when the script
exists and the user explicitly wants a disposable development reset after
being told what data will be lost. At present, do not assume this script exists
outside `students-courses`.

### Switching Between Example Projects

Project commands and agent-runner commands resolve their project from the
current directory. When moving to a sibling example, stop the current
project-owned server before changing directories:

```console
# Run in the old project directory
vrs agent status
vrs agent stop

cd ..\students-courses

# Run in the new project directory
vrs agent status
vrs agent start
```

If the old project was started manually with `npm run devel`, stop that
foreground process in its terminal before switching. Do not issue
`vrs agent stop` from the new project and expect it to stop the old project:
agent state is project-local. Do not use `vrs kill all` for ordinary switching.

After switching, re-read the new project's `package.json`, nested
`AGENTS.md`, `visionr.json`, and agent status. Never reuse assumptions about
ports, scripts, schema-development mode, database state, or running processes
from the previous example.

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
- Prefer live development and the project's `npm run update:devel` workflow.
  Verify meaningful changes with the narrowest useful project task through
  `vr run <task>` or the running local agent before broad stable
  compile/import checks.
- Do not edit generated/runtime folders by hand: `target`, `data`, `work`,
  `log`, or `upload`.
- Do not run release/upload scripts unless the user explicitly asks for release
  work.
- Do not commit unless the user explicitly asks for a commit.

## Production And Release Work

Production builds and releases are exceptional repository-maintenance tasks,
not the default way to develop or verify examples. Root `package.json` scripts
package or publish the example collection and must not be used as a substitute
for working inside one example:

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

# VisionR Examples

This repository contains small VisionR example projects plus prompt-only
starters for generating new examples with an agent.

The repository root is used for catalog, release, and documentation files. It
is not itself a VisionR application. To build or run an example, enter a child
directory that contains `visionr.json`.

## Layout

| Path | Type | Description |
| --- | --- | --- |
| `helloworld` | runnable project | Minimal demo for model, forms, public/restricted pages, server-side code, REST service configuration, and system export basics. |
| `helloworld/portable` | runnable project | Small portable configuration connected to the `helloworld` export workflow. |
| `infradash` | runnable project | Infrastructure dashboard with multiple schemas, relations, i18n, initial data, generated incident data, docs, and a main UI page. |
| `students-courses` | runnable project | Student/course management demo with nested departments, a six-month calendar dataset, dashboards, full English/German i18n, and source-backed department icons. Its original `PROMPT.txt` is retained as generation provenance. |
| `project-catalog.json` | catalog metadata | Release catalog entries for published runnable examples. |

Runnable project directories usually contain:

| Path | Purpose |
| --- | --- |
| `visionr.json` | VisionR project configuration. |
| `package.json` | Project scripts such as build, import, start, update, and release. |
| `src/model` | Model API source: modules, schemas, i18n, initial data, and generated import helpers. |
| `src/forms` | Form pages and templates. |
| `src/srv` | Server-side JavaScript loaders and helper code. |
| `target`, `data`, `work`, `log`, `upload` | Generated/runtime state. Do not edit these by hand. |

## Runnable Projects

### helloworld

`helloworld` is the smallest full example project. It uses the `demo` module
and includes a greeting schema, model i18n, public and main form pages,
server-side loader code, REST service configuration, and a portable system
export definition.

Typical commands:

```console
cd helloworld
npm run build
npm run import
npm run start
```

### helloworld/portable

`helloworld/portable` is a compact portable runtime project. It keeps only the
minimal configuration needed for the portable/node runtime path and has its own
`visionr.json` and `package.json`.

Typical commands:

```console
cd helloworld/portable
npm run start
```

### infradash

`infradash` is a richer example for an infrastructure dashboard. It defines
schemas such as colocations, racks, servers, services, components, and
incidents. It includes i18n files, initial data, generated incident import
helpers, project docs under `doc`, and a `common-main` page under
`src/forms/pages/main`.

Typical commands:

```console
cd infradash
npm run build
npm run import
npm run start
```

### students-courses

`students-courses` demonstrates a larger generated project using the `courses`
module. It includes students, courses, statuses, nested departments, hierarchy
navigation, dashboards, calendars, source-backed record icons, English/German
i18n, expanded sample data, and a `verify-project` task.

Typical commands:

```console
cd students-courses
npm run build
npm run import
vr run verify-project
npm run start
```

## Prompt-Only Starters

A directory with `PROMPT.txt` and no `visionr.json` is an optional empty
project starter. It is not buildable yet.

The intended workflow for such a starter is:

```console
cd <prompt-only-directory>
# paste PROMPT.txt to the agent and ask it to build the project here
```

The agent should then create the normal VisionR project structure in that
directory, add source files, and verify the result with build/import/task
commands. The runnable `students-courses` project retains its original
`PROMPT.txt` as an example of the request that produced it.

## Root Scripts

Root `package.json` scripts are for packaging and publishing examples, not for
normal local development:

```console
npm run build:generated
npm run build:release
npm run release
```

Use child project scripts for normal project work.

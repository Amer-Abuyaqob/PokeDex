# PokeDex CLI (TypeScript)

> 🚧 **Under Construction** – This project is actively being developed. Some features are complete, while others are still in progress. See the [Implementation Status](#implementation-status) section for details.

Interactive terminal Pokedex CLI in TypeScript - a REPL that fetches Pokemon data from [PokeAPI](https://pokeapi.co/) with in-memory caching. Built as part of the Boot.dev course [Build a Pokedex in TypeScript](https://www.boot.dev/courses/build-pokedex-cli-typescript).

---

## 📑 Table of Contents

- [Implementation Status](#implementation-status)
- [1. Project Goals](#1--project-goals)
- [2. Required Components](#2--required-components)
  - [2.1 Chapter 1 - REPL](#21-chapter-1---repl)
  - [2.2 Chapter 2 - Cache](#22-chapter-2---cache)
  - [2.3 Chapter 3 - Pokedex Commands](#23-chapter-3---pokedex-commands)
- [3. Completed Modules](#3--completed-modules)
  - [3.1 Project Scaffold](#31-project-scaffold)
  - [3.2 REPL Module (Chapter 1)](#32-repl-module-chapter-1)
- [4. Pending Modules](#4--pending-modules)
- [5. Build & Run Instructions](#5--build--run-instructions)
  - [5.1 Prerequisites](#51-prerequisites)
  - [5.2 Install and Run](#52-install-and-run)
- [6. Architecture](#6--architecture)
- [7. Definition of Done for MVP](#7--definition-of-done-for-mvp)
- [8. Next Steps](#8--next-steps)
- [9. Authors](#9--authors)

---

## 📊 Implementation Status

| Component        | Status   | Description                                                       |
| ---------------- | -------- | ----------------------------------------------------------------- |
| Project scaffold | Complete | TypeScript setup, package.json, tsconfig                          |
| REPL             | Complete | Interactive read-eval-print loop with `help` and `exit` commands  |
| Cache            | Pending  | In-memory PokeAPI response cache                                  |
| Pokedex CLI      | Partial  | `help`, `exit` done; map, mapb, explore, catch, inspect, pokedex pending |

---

## 1. 🎯 Project Goals

1. Accept user commands in a terminal REPL.
2. Fetch Pokemon-related data from PokeAPI over HTTP/JSON.
3. Cache API responses in memory to reduce redundant network calls.
4. Support map exploration, catching, inspecting, and listing caught Pokemon.

---

## 2. 🧩 Required Components

### 2.1 Chapter 1 - REPL

- [x] Implement an interactive REPL in TypeScript.
- [x] Read user input, evaluate it (as a command), and print the result.
- [x] Loop until the user exits.

### 2.2 Chapter 2 - Cache

- [ ] Implement an in-memory cache for PokeAPI responses.
- [ ] Use it to avoid redundant network requests (e.g. cache by URL or request key).
- [ ] Consider TTL or eviction if specified in the course.

### 2.3 Chapter 3 - Pokedex Commands

- [ ] Combine REPL and cache into a full Pokedex CLI.
- [ ] Wire commands to PokeAPI and the cache.

**Planned commands:**

| Command  | Description                          |
| -------- | ------------------------------------ |
| `help`   | Show available commands              |
| `exit`   | Exit the application                 |
| `map`    | Show next page of locations          |
| `mapb`   | Show previous page of locations      |
| `explore`| Explore a location for Pokemon       |
| `catch`  | Attempt to catch a Pokemon           |
| `inspect`| Inspect a caught Pokemon             |
| `pokedex`| List all caught Pokemon              |

---

## 3. ✅ Completed Modules

### 3.1 Project Scaffold

**Status**: Complete.

**Files**:

- `package.json` - Package config, npm scripts (build, start, dev)
- `tsconfig.json` - TypeScript configuration
- `src/main.ts` - Entry point

**Features**:

- TypeScript compilation setup
- ESM module support
- npm scripts: `build`, `start`, `dev`
- Node.js 18+ compatibility

### 3.2 REPL Module (Chapter 1)

**Status**: Complete.

**Files**:

- `src/repl.ts` - Core REPL logic (cleanInput, executeCommand, startREPL)
- `src/state.ts` - State type, CLICommand type, initState, command registry
- `src/command_help.ts` - `help` command
- `src/command_exit.ts` - `exit` command

**Features**:

- Interactive readline loop with `Pokedex > ` prompt
- Input normalization (trim, lowercase, split by whitespace)
- Command routing and unknown-command handling
- Dynamic help listing from the command registry
- Graceful exit with readline cleanup

**Example Usage**:

```bash
npm install
npm run build
npm start
```

Then type `help` or `exit` in the REPL. Or use `npm run dev` to build and run in one step.

---

## 4. ⏳ Pending Modules

### 4.1 Cache Module

- [ ] In-memory cache keyed by URL or request key.
- [ ] Cache hit/miss logic to avoid repeated PokeAPI calls.
- [ ] TTL or eviction (if applicable per course spec).

### 4.2 Pokedex Module

- [ ] Remaining commands (`map`, `mapb`, `explore`, `catch`, `inspect`, `pokedex`) — `help` and `exit` are done.
- [ ] Integration with PokeAPI and cache.
- [ ] In-memory storage for caught Pokemon.

---

## 5. 🛠️ Build & Run Instructions

### 5.1 Prerequisites

- **Node.js** (18+ or 20+)
- **npm**

### 5.2 Install and Run

```bash
npm install
```

Build and run:

```bash
npm run build
npm start
```

Or use `npm run dev` to build and run in one step.

---

## 6. 🏗️ Architecture

High-level data flow:

```mermaid
flowchart LR
  User[User input] --> REPL[REPL]
  REPL --> Commands[Commands]
  Commands --> Cache[Cache]
  Cache -->|miss| PokeAPI[PokeAPI]
  Cache -->|hit| Commands
  PokeAPI --> Cache
  Commands --> REPL
  REPL --> User
```

For detailed architecture, see [PROJECT_DESC.md](PROJECT_DESC.md).

---

## 7. ✅ Definition of Done for MVP

| Requirement                          | Status    |
| ------------------------------------ | --------- |
| [x] Project scaffold and build setup | Complete  |
| [x] REPL implemented                 | Complete  |
| [ ] In-memory cache for PokeAPI      | Pending   |
| [x] `help` command                   | Complete  |
| [x] `exit` command                   | Complete  |
| [ ] `map` / `mapb` commands          | Pending   |
| [ ] `explore` command                | Pending   |
| [ ] `catch` command                  | Pending   |
| [ ] `inspect` command                | Pending   |
| [ ] `pokedex` command                | Pending   |

---

## 8. 🗓️ Next Steps

### Immediate Priority

1. [x] **REPL (Chapter 1)** - Implement interactive read-eval-print loop. ✅ Done
2. [ ] **Cache (Chapter 2)** - Implement in-memory PokeAPI response cache.
3. [ ] **Pokedex (Chapter 3)** - Implement remaining CLI commands and wire to PokeAPI.

### Reference

- Course: [Build a Pokedex in TypeScript](https://www.boot.dev/courses/build-pokedex-cli-typescript)
- Architecture and requirements: [PROJECT_DESC.md](PROJECT_DESC.md)

---

## 9. 👥 Authors

- **Amer Abuyaqob**

---

**License**: ISC

**Last Updated**: REPL (Chapter 1) is complete with `help` and `exit` commands. Cache and remaining Pokedex commands are pending.

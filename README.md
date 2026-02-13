# PokeDex CLI (TypeScript)

A small **Pokedex CLI** in TypeScript — interactive terminal app that fetches Pokémon data from [PokeAPI](https://pokeapi.co/) with in-memory caching. Built as part of the Boot.dev course.

## What it is

- **REPL** in the terminal: you type commands, the app fetches and shows Pokémon-related data.
- Uses **PokeAPI** over HTTP/JSON.
- **In-memory cache** to avoid repeating the same API calls.

## Prerequisites

- **Node.js** (18+ or 20+)
- **npm**

## Install and run

```bash
npm install
```

Build and run:

```bash
npm run build
npm start
```

Or use `npm run dev` to build and run in one step.

## Course

Based on **[Build a Pokedex in TypeScript](https://www.boot.dev/courses/build-pokedex-cli-typescript)** on Boot.dev.

## More detail

See **[PROJECT_DESC.md](PROJECT_DESC.md)** for architecture, requirements, and workspace layout.

## License

ISC

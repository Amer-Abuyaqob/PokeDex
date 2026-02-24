import { commandPokeDex } from "./pokedex.js";
import type { ShallowPokemon } from "../lib/pokeapi.js";
import type { State } from "../state.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PIKACHU: ShallowPokemon = {
  name: "pikachu",
  base_experience: 112,
  height: 4,
  weight: 60,
  stats: [
    { base_stat: 35, effort: 0, stat: { name: "hp", url: "" } },
    { base_stat: 55, effort: 0, stat: { name: "attack", url: "" } },
  ],
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
};

const MOCK_CHARMANDER: ShallowPokemon = {
  name: "charmander",
  base_experience: 62,
  height: 6,
  weight: 85,
  stats: [{ base_stat: 39, effort: 0, stat: { name: "hp", url: "" } }],
  types: [{ slot: 1, type: { name: "fire", url: "" } }],
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockState(pokeDex: Record<string, ShallowPokemon> = {}): State {
  return {
    args: [],
    commands: {},
    pokeDex: { ...pokeDex },
    readline: {} as State["readline"],
    pokeapi: {} as State["pokeapi"],
    nextLocationsURL: null,
    prevLocationsURL: null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("commandPokeDex", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("empty pokeDex prints empty message", async () => {
    const state = createMockState();

    await commandPokeDex(state);

    expect(logSpy).toHaveBeenCalledWith("Your Pokedex is empty.\n");
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  test("single Pokemon in pokeDex lists it", async () => {
    const state = createMockState({ pikachu: MOCK_PIKACHU });

    await commandPokeDex(state);

    expect(logSpy).toHaveBeenCalledWith("Your Pokedex:");
    expect(logSpy).toHaveBeenCalledWith(" - pikachu");
    expect(logSpy).toHaveBeenCalledWith("");
    expect(logSpy).toHaveBeenCalledTimes(3);
  });

  test("multiple Pokemon in pokeDex lists all", async () => {
    const state = createMockState({
      pikachu: MOCK_PIKACHU,
      charmander: MOCK_CHARMANDER,
    });

    await commandPokeDex(state);

    expect(logSpy).toHaveBeenCalledWith("Your Pokedex:");
    expect(logSpy).toHaveBeenCalledWith(" - pikachu");
    expect(logSpy).toHaveBeenCalledWith(" - charmander");
    expect(logSpy).toHaveBeenCalledWith("");
    expect(logSpy).toHaveBeenCalledTimes(4);
  });

  test("names appear in object key order", async () => {
    const state = createMockState({
      charmander: MOCK_CHARMANDER,
      pikachu: MOCK_PIKACHU,
    });

    await commandPokeDex(state);

    const logCalls = logSpy.mock.calls.flat();
    const bulletIndex1 = logCalls.indexOf(" - charmander");
    const bulletIndex2 = logCalls.indexOf(" - pikachu");
    expect(bulletIndex1).toBeLessThan(bulletIndex2);
  });
});

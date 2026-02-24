import { commandCatch } from "./catch.js";
import type { ShallowPokemon } from "../lib/pokeapi.js";
import { initState } from "../state.js";
import type { State } from "../state.js";
import { PokeAPI } from "../lib/pokeapi.js";
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

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestState(): State {
  const state = initState();
  const mockFetchPokemon = vi.fn();
  state.pokeapi = { fetchPokemon: mockFetchPokemon } as unknown as PokeAPI;
  return state;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("commandCatch", () => {
  let state: State;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    state = createTestState();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    vi.restoreAllMocks();
    state.readline.close();
  });

  test("missing args prints error", async () => {
    state.args = [];

    await commandCatch(state);

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: catch requires a pokemon name\n",
    );
  });

  test("success (caught) adds to pokeDex", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    state.args = ["pikachu"];
    (state.pokeapi.fetchPokemon as ReturnType<typeof vi.fn>).mockResolvedValue(
      MOCK_PIKACHU,
    );

    await commandCatch(state);

    expect(logSpy).toHaveBeenCalledWith("Throwing a Pokeball at pikachu...");
    expect(logSpy).toHaveBeenCalledWith("pikachu was caught!");
    expect(logSpy).toHaveBeenCalledWith(
      "You may now inspect it with the inspect command.\n",
    );
    expect(state.pokeDex["pikachu"]).toEqual(MOCK_PIKACHU);
  });

  test("escape does not add to pokeDex", async () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    state.args = ["pikachu"];
    (state.pokeapi.fetchPokemon as ReturnType<typeof vi.fn>).mockResolvedValue(
      MOCK_PIKACHU,
    );

    await commandCatch(state);

    expect(logSpy).toHaveBeenCalledWith("Throwing a Pokeball at pikachu...");
    expect(logSpy).toHaveBeenCalledWith("pikachu escaped!\n");
    expect(state.pokeDex["pikachu"]).toBeUndefined();
  });

  test("fetch rejects with 404 logs error", async () => {
    state.args = ["fake-pokemon"];
    (state.pokeapi.fetchPokemon as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("PokeAPI error: 404 Not Found"),
    );

    await commandCatch(state);

    expect(errorSpy).toHaveBeenCalledWith(
      "Error:",
      expect.stringContaining("404"),
    );
  });

  test("non-Error reject logs error", async () => {
    state.args = ["pikachu"];
    (state.pokeapi.fetchPokemon as ReturnType<typeof vi.fn>).mockRejectedValue(
      "string error",
    );

    await commandCatch(state);

    expect(errorSpy).toHaveBeenCalledWith("Error:", "string error\n");
  });
});

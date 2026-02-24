import { commandInspect } from "./command_inspect.js";
import type { ShallowPokemon } from "./pokeapi.js";
import { initState } from "./state.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_POKEMON: ShallowPokemon = {
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
// Tests
// ---------------------------------------------------------------------------

describe("commandInspect", () => {
  function createState(
    args: string[],
    pokeDex: Record<string, ShallowPokemon> = {},
  ) {
    const state = initState();
    state.args = args;
    state.pokeDex = { ...pokeDex };
    return state;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("no args prints error and returns early", async () => {
    const state = createState([]);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await commandInspect(state);

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: inspect requires a pokemon name\n",
    );
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("pokemon not in pokeDex prints not-caught message", async () => {
    const state = createState(["bulbasaur"]);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await commandInspect(state);

    expect(logSpy).toHaveBeenCalledWith("you have not caught that pokemon\n");
    expect(logSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
    state.readline.close();
  });

  test("pokemon in pokeDex prints full details", async () => {
    const state = createState(["pikachu"], { pikachu: MOCK_POKEMON });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await commandInspect(state);

    expect(logSpy).toHaveBeenCalledWith("Name: pikachu");
    expect(logSpy).toHaveBeenCalledWith("Height: 4");
    expect(logSpy).toHaveBeenCalledWith("Weight: 60");
    expect(logSpy).toHaveBeenCalledWith("Stats:");
    expect(logSpy).toHaveBeenCalledWith("  -hp: 35");
    expect(logSpy).toHaveBeenCalledWith("  -attack: 55");
    expect(logSpy).toHaveBeenCalledWith("Types:");
    expect(logSpy).toHaveBeenCalledWith("  - electric");
    expect(logSpy).toHaveBeenCalledWith("");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("lookup is case-sensitive (pokeDex keys)", async () => {
    const state = createState(["Pikachu"], { pikachu: MOCK_POKEMON });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await commandInspect(state);

    // "Pikachu" !== "pikachu" so not found
    expect(logSpy).toHaveBeenCalledWith("you have not caught that pokemon\n");

    logSpy.mockRestore();
    state.readline.close();
  });
});

import { cleanInput, runCommand } from "./repl.js";
import { initState } from "./state.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data for PokeAPI responses
// ---------------------------------------------------------------------------

const MOCK_LOCATIONS_PAGE1 = {
  count: 100,
  next: "https://pokeapi.co/api/v2/location-area?offset=20&limit=20",
  previous: null,
  results: [
    {
      name: "canalave-city-area",
      url: "https://pokeapi.co/api/v2/location-area/1/",
    },
    {
      name: "eterna-city-area",
      url: "https://pokeapi.co/api/v2/location-area/2/",
    },
    ...Array.from({ length: 18 }, (_, i) => ({
      name: `location-${i + 3}`,
      url: `https://pokeapi.co/api/v2/location-area/${i + 3}/`,
    })),
  ],
};

const MOCK_LOCATIONS_PAGE2 = {
  count: 100,
  next: null,
  previous: "https://pokeapi.co/api/v2/location-area?offset=0&limit=20",
  results: Array.from({ length: 20 }, (_, i) => ({
    name: `location-page2-${i}`,
    url: `https://pokeapi.co/api/v2/location-area/${i + 21}/`,
  })),
};

const MOCK_LOCATION_OREBURGH = {
  name: "oreburgh-mine-b1f",
  url: "https://pokeapi.co/api/v2/location-area/1/",
  pokemon_encounters: [
    {
      pokemon: { name: "zubat", url: "https://pokeapi.co/api/v2/pokemon/41/" },
    },
    {
      pokemon: {
        name: "geodude",
        url: "https://pokeapi.co/api/v2/pokemon/74/",
      },
    },
  ],
};

const MOCK_LOCATION_EMPTY = {
  name: "location-with-empty-encounters",
  url: "https://pokeapi.co/api/v2/location-area/999/",
  pokemon_encounters: [],
};

const MOCK_POKEMON_PIKACHU = {
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

function createMockFetch() {
  return vi.fn((url: string | URL) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    // List endpoint: location-area?offset=20 -> page 2
    if (urlStr.includes("location-area?") && urlStr.includes("offset=20")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_LOCATIONS_PAGE2),
      });
    }
    // List endpoint: location-area?offset=0 or default -> page 1
    if (
      urlStr.includes("location-area?offset=") ||
      urlStr.includes("location-area?offset=0")
    ) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_LOCATIONS_PAGE1),
      });
    }
    if (urlStr.includes("location-area/oreburgh-mine-b1f")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_LOCATION_OREBURGH),
      });
    }
    if (urlStr.includes("location-area/location-with-empty-encounters")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_LOCATION_EMPTY),
      });
    }
    if (urlStr.includes("location-area/")) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
    }
    if (urlStr.includes("pokemon/pikachu")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_POKEMON_PIKACHU),
      });
    }
    if (urlStr.includes("pokemon/")) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
    }
    return Promise.resolve({ ok: false, status: 404, statusText: "Not Found" });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("cleanInput", () => {
  describe.each([
    { input: "  hello  world  ", expected: ["hello", "world"] },
    {
      input: "Charmander Bulbasaur PIKACHU",
      expected: ["charmander", "bulbasaur", "pikachu"],
    },
    { input: "", expected: [] },
    { input: "   ", expected: [] },
    { input: "help    foo", expected: ["help", "foo"] },
  ])("cleanInput($input)", ({ input, expected }) => {
    test(`returns ${JSON.stringify(expected)}`, () => {
      const actual = cleanInput(input);
      expect(actual).toHaveLength(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expect(actual[i]).toBe(expected[i]);
      }
    });
  });
});

describe("runCommand - REPL logic", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("empty input produces no console output", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "");
    await runCommand(state, "   ");

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
    state.readline.close();
  });

  test("unknown command prints error message", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "asdf");

    expect(logSpy).toHaveBeenCalledWith(
      'Unknown command: "asdf". Type "help" for a list of commands.\n',
    );

    logSpy.mockRestore();
    state.readline.close();
  });
});

describe("help", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("help prints welcome and all commands", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "help");

    expect(logSpy).toHaveBeenCalledWith("Welcome to the Pokedex!");
    expect(logSpy).toHaveBeenCalledWith("Usage:\n");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("help: Displays a help message"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("exit: Exits the pokedex"),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("map:"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("mapb:"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("explore:"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("catch:"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("inspect:"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("pokedex:"));

    logSpy.mockRestore();
    state.readline.close();
  });

  test("help with extra args ignores extra args", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "help foo bar");

    expect(logSpy).toHaveBeenCalledWith("Welcome to the Pokedex!");

    logSpy.mockRestore();
    state.readline.close();
  });
});

describe("exit", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  });

  test("exit calls readline.close and process.exit(0)", async () => {
    const state = initState();
    const closeSpy = vi.spyOn(state.readline, "close");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "exit");

    expect(closeSpy).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
    expect(logSpy).toHaveBeenCalledWith("Closing the Pokedex... Goodbye!");
  });
});

describe("map and mapb", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("mapb before map prints first page message", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "mapb");

    expect(logSpy).toHaveBeenCalledWith("You're on the first page\n");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("map prints location names", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "map");

    expect(logSpy).toHaveBeenCalledWith("canalave-city-area");
    expect(logSpy).toHaveBeenCalledWith("eterna-city-area");
    expect(logSpy).toHaveBeenCalledWith("location-5");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("map with extra args ignores extra args", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "map foo bar");

    expect(logSpy).toHaveBeenCalledWith("canalave-city-area");
    expect(logSpy).toHaveBeenCalledWith("eterna-city-area");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("map twice advances to page 2", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "map");
    logSpy.mockClear();
    await runCommand(state, "map");

    expect(logSpy).toHaveBeenCalledWith("location-page2-0");
    expect(logSpy).toHaveBeenCalledWith("location-page2-19");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("map then mapb returns previous page", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "map");
    logSpy.mockClear();
    await runCommand(state, "map");
    logSpy.mockClear();
    await runCommand(state, "mapb");

    expect(logSpy).toHaveBeenCalledWith("canalave-city-area");
    expect(logSpy).toHaveBeenCalledWith("eterna-city-area");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("mapb with extra args ignores extra args", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "mapb x y");

    expect(logSpy).toHaveBeenCalledWith("You're on the first page\n");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("map on last page wraps to first page", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "map");
    await runCommand(state, "map");
    logSpy.mockClear();
    await runCommand(state, "map");

    expect(logSpy).toHaveBeenCalledWith("canalave-city-area");
    expect(logSpy).toHaveBeenCalledWith("eterna-city-area");

    logSpy.mockRestore();
    state.readline.close();
  });
});

describe("explore", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("explore without args prints error", async () => {
    const state = initState();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "explore");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: explore requires a location name\n",
    );

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("explore fake-location returns 404 error", async () => {
    const state = initState();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "explore fake-location");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error:",
      expect.stringContaining("404"),
    );

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("explore oreburgh-mine-b1f lists Pokemon", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "explore oreburgh-mine-b1f");

    expect(logSpy).toHaveBeenCalledWith("Exploring oreburgh-mine-b1f...");
    expect(logSpy).toHaveBeenCalledWith("Found Pokemon:");
    expect(logSpy).toHaveBeenCalledWith("zubat");
    expect(logSpy).toHaveBeenCalledWith("geodude");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("explore location-with-empty-encounters prints no Pokemon", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "explore location-with-empty-encounters");

    expect(logSpy).toHaveBeenCalledWith(
      "Exploring location-with-empty-encounters...",
    );
    expect(logSpy).toHaveBeenCalledWith(
      "No Pokemon were found in location-area: location-with-empty-encounters",
    );

    logSpy.mockRestore();
    state.readline.close();
  });

  test("explore with extra args ignores extra args", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "explore oreburgh-mine-b1f extra args");

    expect(logSpy).toHaveBeenCalledWith("Exploring oreburgh-mine-b1f...");
    expect(logSpy).toHaveBeenCalledWith("Found Pokemon:");

    logSpy.mockRestore();
    state.readline.close();
  });
});

describe("catch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("catch without args prints error", async () => {
    const state = initState();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "catch");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: catch requires a pokemon name\n",
    );

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("catch fake-pokemon returns 404 error", async () => {
    const state = initState();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "catch fake-pokemon");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error:",
      expect.stringContaining("404"),
    );

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("catch pikachu with Math.random=0 adds to pokeDex", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "catch pikachu");

    expect(logSpy).toHaveBeenCalledWith("Throwing a Pokeball at pikachu...");
    expect(logSpy).toHaveBeenCalledWith("pikachu was caught!");
    expect(logSpy).toHaveBeenCalledWith(
      "You may now inspect it with the inspect command.\n",
    );
    expect(state.pokeDex["pikachu"]).toEqual(MOCK_POKEMON_PIKACHU);

    logSpy.mockRestore();
    vi.restoreAllMocks();
    state.readline.close();
  });

  test("catch pikachu with Math.random=1 results in escape", async () => {
    vi.spyOn(Math, "random").mockReturnValue(1);

    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "catch pikachu");

    expect(logSpy).toHaveBeenCalledWith("Throwing a Pokeball at pikachu...");
    expect(logSpy).toHaveBeenCalledWith("pikachu escaped!\n");
    expect(state.pokeDex["pikachu"]).toBeUndefined();

    logSpy.mockRestore();
    vi.restoreAllMocks();
    state.readline.close();
  });
});

describe("inspect", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("inspect without args prints error", async () => {
    const state = initState();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await runCommand(state, "inspect");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: inspect requires a pokemon name\n",
    );

    errorSpy.mockRestore();
    state.readline.close();
  });

  test("inspect bulbasaur when not caught prints message", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "inspect bulbasaur");

    expect(logSpy).toHaveBeenCalledWith("you have not caught that pokemon\n");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("inspect pikachu when caught shows details", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = initState();
    await runCommand(state, "catch pikachu");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "inspect pikachu");

    expect(logSpy).toHaveBeenCalledWith("Name: pikachu");
    expect(logSpy).toHaveBeenCalledWith("Height: 4");
    expect(logSpy).toHaveBeenCalledWith("Weight: 60");
    expect(logSpy).toHaveBeenCalledWith("Stats:");
    expect(logSpy).toHaveBeenCalledWith("Types:");

    logSpy.mockRestore();
    vi.restoreAllMocks();
    state.readline.close();
  });
});

describe("pokedex", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createMockFetch());
  });

  test("pokedex when empty prints empty message", async () => {
    const state = initState();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "pokedex");

    expect(logSpy).toHaveBeenCalledWith("Your Pokedex is empty.\n");

    logSpy.mockRestore();
    state.readline.close();
  });

  test("pokedex after catching lists Pokemon", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = initState();
    await runCommand(state, "catch pikachu");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCommand(state, "pokedex");

    expect(logSpy).toHaveBeenCalledWith("Your Pokedex:");
    expect(logSpy).toHaveBeenCalledWith(" - pikachu");

    logSpy.mockRestore();
    vi.restoreAllMocks();
    state.readline.close();
  });
});

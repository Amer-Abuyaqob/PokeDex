import { commandExplore } from "./explore.js";
import type { State } from "../state.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_LOCATION_WITH_POKEMON = {
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
  pokemon_encounters: [] as const,
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockState(
  args: string[],
  fetchLocationImpl: State["pokeapi"]["fetchLocation"],
): State {
  return {
    args,
    commands: {},
    pokeDex: {},
    readline: {} as State["readline"],
    pokeapi: { fetchLocation: fetchLocationImpl } as State["pokeapi"],
    nextLocationsURL: null,
    prevLocationsURL: null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("commandExplore", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("missing location name prints error and returns", async () => {
    const state = createMockState([], vi.fn());

    await commandExplore(state);

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: explore requires a location name\n",
    );
    expect(logSpy).not.toHaveBeenCalled();
  });

  test("success with Pokemon prints header and list", async () => {
    const fetchLocation = vi.fn().mockResolvedValue(MOCK_LOCATION_WITH_POKEMON);
    const state = createMockState(["oreburgh-mine-b1f"], fetchLocation);

    await commandExplore(state);

    expect(fetchLocation).toHaveBeenCalledWith("oreburgh-mine-b1f");
    expect(logSpy).toHaveBeenCalledWith("Exploring oreburgh-mine-b1f...");
    expect(logSpy).toHaveBeenCalledWith("Found Pokemon:");
    expect(logSpy).toHaveBeenCalledWith("zubat");
    expect(logSpy).toHaveBeenCalledWith("geodude");
    expect(logSpy).toHaveBeenCalledWith("");
  });

  test("success with empty encounters prints no-Pokemon message", async () => {
    const fetchLocation = vi.fn().mockResolvedValue(MOCK_LOCATION_EMPTY);
    const state = createMockState(
      ["location-with-empty-encounters"],
      fetchLocation,
    );

    await commandExplore(state);

    expect(logSpy).toHaveBeenCalledWith(
      "Exploring location-with-empty-encounters...",
    );
    expect(logSpy).toHaveBeenCalledWith(
      "No Pokemon were found in location-area: location-with-empty-encounters",
    );
    expect(logSpy).toHaveBeenCalledWith("");
  });

  test("success with undefined pokemon_encounters prints no-Pokemon message", async () => {
    const fetchLocation = vi.fn().mockResolvedValue({
      name: "no-encounters-field",
      url: "https://pokeapi.co/api/v2/location-area/1/",
      // pokemon_encounters omitted
    });
    const state = createMockState(["no-encounters-field"], fetchLocation);

    await commandExplore(state);

    expect(logSpy).toHaveBeenCalledWith("Exploring no-encounters-field...");
    expect(logSpy).toHaveBeenCalledWith(
      "No Pokemon were found in location-area: no-encounters-field",
    );
  });

  test("fetchLocation throws Error prints error message", async () => {
    const fetchLocation = vi.fn().mockRejectedValue(new Error("404 Not Found"));
    const state = createMockState(["fake-location"], fetchLocation);

    await commandExplore(state);

    expect(errorSpy).toHaveBeenCalledWith("Error:", "404 Not Found\n");
  });

  test("fetchLocation throws non-Error prints stringified value", async () => {
    const fetchLocation = vi.fn().mockRejectedValue("network failure");
    const state = createMockState(["bad-location"], fetchLocation);

    await commandExplore(state);

    expect(errorSpy).toHaveBeenCalledWith("Error:", "network failure\n");
  });

  test("extra args are ignored (uses first arg only)", async () => {
    const fetchLocation = vi.fn().mockResolvedValue(MOCK_LOCATION_WITH_POKEMON);
    const state = createMockState(
      ["oreburgh-mine-b1f", "extra", "args"],
      fetchLocation,
    );

    await commandExplore(state);

    expect(fetchLocation).toHaveBeenCalledWith("oreburgh-mine-b1f");
    expect(logSpy).toHaveBeenCalledWith("Exploring oreburgh-mine-b1f...");
  });
});

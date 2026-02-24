import { commandMapb } from "./command_mapb.js";
import type { ShallowLocations } from "./pokeapi.js";
import type { State } from "./state.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_LOCATIONS_PAGE2: ShallowLocations = {
  count: 200,
  next: "https://pokeapi.co/api/v2/location-area?offset=40&limit=20",
  previous: "https://pokeapi.co/api/v2/location-area?offset=0&limit=20",
  results: [
    {
      name: "canalave-city-area",
      url: "https://pokeapi.co/api/v2/location-area/1/",
    },
    {
      name: "eterna-city-area",
      url: "https://pokeapi.co/api/v2/location-area/2/",
    },
  ],
};

const MOCK_LOCATIONS_FIRST_PAGE: ShallowLocations = {
  count: 200,
  next: "https://pokeapi.co/api/v2/location-area?offset=20&limit=20",
  previous: null,
  results: [
    { name: "location-1", url: "https://pokeapi.co/api/v2/location-area/1/" },
    { name: "location-2", url: "https://pokeapi.co/api/v2/location-area/2/" },
  ],
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockState(
  fetchLocationsImpl: State["pokeapi"]["fetchLocations"],
  nextLocationsURL: string | null = null,
  prevLocationsURL: string | null = null,
): State {
  return {
    args: [],
    commands: {},
    pokeDex: {},
    readline: {} as State["readline"],
    pokeapi: { fetchLocations: fetchLocationsImpl } as State["pokeapi"],
    nextLocationsURL,
    prevLocationsURL,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("commandMapb", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("when prevLocationsURL is null prints first page message and returns", async () => {
    const fetchLocations = vi.fn();
    const state = createMockState(fetchLocations, null, null);

    await commandMapb(state);

    expect(logSpy).toHaveBeenCalledWith("You're on the first page\n");
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(fetchLocations).not.toHaveBeenCalled();
  });

  test("when prevLocationsURL is empty string prints first page message and returns", async () => {
    const fetchLocations = vi.fn();
    const state = createMockState(fetchLocations, null, "");

    await commandMapb(state);

    expect(logSpy).toHaveBeenCalledWith("You're on the first page\n");
    expect(fetchLocations).not.toHaveBeenCalled();
  });

  test("fetches previous page when prevLocationsURL is set", async () => {
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_FIRST_PAGE);
    const state = createMockState(fetchLocations, "next-url", prevURL);

    await commandMapb(state);

    expect(fetchLocations).toHaveBeenCalledWith(prevURL);
    expect(logSpy).toHaveBeenCalledWith("location-1");
    expect(logSpy).toHaveBeenCalledWith("location-2");
    expect(logSpy).toHaveBeenCalledWith("");
  });

  test("updates nextLocationsURL and prevLocationsURL after fetch", async () => {
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_FIRST_PAGE);
    const state = createMockState(fetchLocations, "old-next", prevURL);

    await commandMapb(state);

    expect(state.nextLocationsURL).toBe(MOCK_LOCATIONS_FIRST_PAGE.next);
    expect(state.prevLocationsURL).toBe(MOCK_LOCATIONS_FIRST_PAGE.previous);
  });

  test("when on first page after backward fetch, prevLocationsURL becomes null", async () => {
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_FIRST_PAGE);
    const state = createMockState(fetchLocations, "next-url", prevURL);

    await commandMapb(state);

    expect(state.prevLocationsURL).toBeNull();
  });

  test("handles empty results", async () => {
    const emptyResults: ShallowLocations = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi.fn().mockResolvedValue(emptyResults);
    const state = createMockState(fetchLocations, null, prevURL);

    await commandMapb(state);

    expect(logSpy).toHaveBeenCalledWith("");
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  test("fetchLocations throws Error propagates (caller must catch)", async () => {
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi
      .fn()
      .mockRejectedValue(new Error("PokeAPI error: 503 Unavailable"));
    const state = createMockState(fetchLocations, null, prevURL);

    await expect(commandMapb(state)).rejects.toThrow(
      "PokeAPI error: 503 Unavailable",
    );
  });

  test("fetchLocations rejects with non-Error propagates", async () => {
    const prevURL = "https://pokeapi.co/api/v2/location-area?offset=0&limit=20";
    const fetchLocations = vi.fn().mockRejectedValue("network failure");
    const state = createMockState(fetchLocations, null, prevURL);

    await expect(commandMapb(state)).rejects.toBe("network failure");
  });
});

import { commandMap } from "./command_map.js";
import type { ShallowLocations } from "./pokeapi.js";
import type { State } from "./state.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_LOCATIONS_PAGE1: ShallowLocations = {
  count: 200,
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
    {
      name: "pastoria-city-area",
      url: "https://pokeapi.co/api/v2/location-area/3/",
    },
  ],
};

const MOCK_LOCATIONS_PAGE2: ShallowLocations = {
  count: 200,
  next: "https://pokeapi.co/api/v2/location-area?offset=40&limit=20",
  previous: "https://pokeapi.co/api/v2/location-area?offset=0&limit=20",
  results: [
    {
      name: "sunyshore-city-area",
      url: "https://pokeapi.co/api/v2/location-area/21/",
    },
    {
      name: "snowpoint-city-area",
      url: "https://pokeapi.co/api/v2/location-area/22/",
    },
  ],
};

const MOCK_LOCATIONS_LAST_PAGE: ShallowLocations = {
  count: 25,
  next: null,
  previous: "https://pokeapi.co/api/v2/location-area?offset=0&limit=20",
  results: [
    {
      name: "last-location",
      url: "https://pokeapi.co/api/v2/location-area/25/",
    },
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

describe("commandMap", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("fetches first page when nextLocationsURL is null", async () => {
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_PAGE1);
    const state = createMockState(fetchLocations, null, null);

    await commandMap(state);

    expect(fetchLocations).toHaveBeenCalledWith(undefined);
    expect(logSpy).toHaveBeenCalledWith("canalave-city-area");
    expect(logSpy).toHaveBeenCalledWith("eterna-city-area");
    expect(logSpy).toHaveBeenCalledWith("pastoria-city-area");
    expect(logSpy).toHaveBeenCalledWith("");
  });

  test("updates nextLocationsURL and prevLocationsURL after fetch", async () => {
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_PAGE1);
    const state = createMockState(fetchLocations, null, null);

    await commandMap(state);

    expect(state.nextLocationsURL).toBe(MOCK_LOCATIONS_PAGE1.next);
    expect(state.prevLocationsURL).toBe(MOCK_LOCATIONS_PAGE1.previous);
  });

  test("fetches with nextLocationsURL when set", async () => {
    const nextURL =
      "https://pokeapi.co/api/v2/location-area?offset=20&limit=20";
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_PAGE2);
    const state = createMockState(
      fetchLocations,
      nextURL,
      MOCK_LOCATIONS_PAGE1.previous ?? "previous",
    );

    await commandMap(state);

    expect(fetchLocations).toHaveBeenCalledWith(nextURL);
    expect(logSpy).toHaveBeenCalledWith("sunyshore-city-area");
    expect(logSpy).toHaveBeenCalledWith("snowpoint-city-area");
    expect(logSpy).toHaveBeenCalledWith("");
  });

  test("handles last page (next is null)", async () => {
    const fetchLocations = vi.fn().mockResolvedValue(MOCK_LOCATIONS_LAST_PAGE);
    const state = createMockState(fetchLocations);

    await commandMap(state);

    expect(state.nextLocationsURL).toBeNull();
    expect(state.prevLocationsURL).toBe(MOCK_LOCATIONS_LAST_PAGE.previous);
    expect(logSpy).toHaveBeenCalledWith("last-location");
  });

  test("handles empty results", async () => {
    const emptyResults: ShallowLocations = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
    const fetchLocations = vi.fn().mockResolvedValue(emptyResults);
    const state = createMockState(fetchLocations);

    await commandMap(state);

    expect(logSpy).toHaveBeenCalledWith("");
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  test("fetchLocations throws Error propagates (caller must catch)", async () => {
    const fetchLocations = vi
      .fn()
      .mockRejectedValue(new Error("PokeAPI error: 500 Server Error"));
    const state = createMockState(fetchLocations);

    await expect(commandMap(state)).rejects.toThrow(
      "PokeAPI error: 500 Server Error",
    );
  });

  test("fetchLocations rejects with non-Error propagates", async () => {
    const fetchLocations = vi.fn().mockRejectedValue("network failure");
    const state = createMockState(fetchLocations);

    await expect(commandMap(state)).rejects.toBe("network failure");
  });
});

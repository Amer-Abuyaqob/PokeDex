import type { State } from "./state.js";

/**
 * Prints up to 20 location-area names from the PokeAPI, with pagination support.
 *
 * Uses state.nextLocationsURL for the next page (or fetches the first page if null).
 * Updates state.nextLocationsURL and state.prevLocationsURL after fetching.
 *
 * @param state - Current state; uses state.pokeapi and pagination URLs
 * @returns void
 * @throws {Error} When the PokeAPI request fails (e.g. network error, non-OK response)
 * @example
 * commandMap({ args: [], commands: {}, readline: rl, pokeapi, nextLocationsURL: null, prevLocationsURL: null });
 * // Fetches first 20 location areas and prints their names
 */
export async function commandMap(state: State): Promise<void> {
  const data = await state.pokeapi.fetchLocations(
    state.nextLocationsURL ?? undefined,
  );

  for (const loc of data.results) {
    console.log(loc.name);
  }

  state.nextLocationsURL = data.next;
  state.prevLocationsURL = data.previous;
}
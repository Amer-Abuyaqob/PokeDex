import type { State } from "../state.js";

/**
 * Prints the previous 20 location-area names from the PokeAPI (pagination backward).
 *
 * Uses state.prevLocationsURL; does nothing if already on the first page.
 * Updates state.nextLocationsURL and state.prevLocationsURL after fetching.
 *
 * @param state - Current state; uses state.pokeapi and pagination URLs
 * @returns void
 * @throws {Error} When the PokeAPI request fails (e.g. network error, non-OK response)
 * @example
 * commandMapb({ args: [], commands: {}, readline: rl, pokeapi, nextLocationsURL: "...", prevLocationsURL: "..." });
 * // Fetches previous 20 location areas and prints their names
 */
export async function commandMapb(state: State): Promise<void> {
  if (!state.prevLocationsURL) {
    console.log("You're on the first page\n");
    return;
  }

  const data = await state.pokeapi.fetchLocations(state.prevLocationsURL);

  for (const loc of data.results) {
    console.log(loc.name);
  }
  console.log("");
  state.nextLocationsURL = data.next;
  state.prevLocationsURL = data.previous;
}

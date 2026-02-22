import type { ShallowEncounter } from "./pokeapi.js";
import type { State } from "./state.js";

/**
 * Extracts the location name from command args.
 *
 * @param args - Positional args from the user (e.g. ["oreburgh-mine-b1f"]).
 * @returns The first arg, or undefined when the user provided no args.
 */
function getLocationName(args: string[]): string | undefined {
  return args[0];
}

/**
 * Prints the explore result: "Exploring..." header plus Pokémon list or empty message.
 *
 * @param locationName - The location area being explored.
 * @param encounters - Pokémon encounters, or undefined/empty when none found.
 * @returns void
 */
function printExploreResult(
  locationName: string,
  encounters: ShallowEncounter[] | undefined,
): void {
  console.log(`Exploring ${locationName}...`);
  if (!encounters || encounters.length < 1) {
    console.log(`No Pokemon were found in location-area: ${locationName}`);
  } else {
    console.log("Found Pokemon:");
    for (const encounter of encounters) {
      console.log(encounter.pokemon.name);
    }
  }
  console.log("");
}

/**
 * Displays Pokémon that can be encountered at a given location area.
 *
 * Validates args, fetches location data, and prints the result. Handles missing
 * args and HTTP errors (e.g. 404) with user-facing error messages.
 *
 * @param state - Current state; uses state.args[0] and state.pokeapi.
 * @returns void
 * @example
 * // User types: explore oreburgh-mine-b1f
 * commandExplore({ args: ["oreburgh-mine-b1f"], pokeapi, ... });
 */
export async function commandExplore(state: State): Promise<void> {
  const locationName = getLocationName(state.args);
  if (locationName === undefined) {
    console.error("Error: explore requires a location name");
    return;
  }

  try {
    const data = await state.pokeapi.fetchLocation(locationName);
    printExploreResult(locationName, data.pokemon_encounters);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error:", message);
  }
}

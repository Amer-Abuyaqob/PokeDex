import type { ShallowPokemon } from "./pokeapi.js";
import type { State } from "./state.js";

/**
 * Extracts the Pokémon name from command args.
 *
 * @param args - Positional args from the user (e.g. ["pikachu"]).
 * @returns The first arg, or undefined when the user provided no args.
 */
function getPokemonName(args: string[]): string | undefined {
  return args[0];
}

/**
 * Determines whether a catch attempt succeeds based on base experience.
 *
 * Uses a random roll against a threshold; higher base experience yields
 * lower catch chance. Pure function (no I/O).
 *
 * @param baseExperience - Pokémon's base_experience from the API.
 * @returns True if the catch succeeds, false if the Pokémon escapes.
 */
function attemptCatch(baseExperience: number): boolean {
  const roll = Math.random() * baseExperience;
  return roll <= 50;
}

/**
 * Attempts to catch a Pokémon: logs the throw, rolls for success, and
 * prints the outcome. On success, adds the Pokémon to state.pokeDex.
 *
 * @param pokemon - The Pokémon to catch (name, base_experience).
 * @param state - Current state; uses state.pokeDex to store caught Pokémon.
 */
function catchPokemon(pokemon: ShallowPokemon, state: State): void {
  const { name, base_experience } = pokemon;
  console.log(`Throwing a Pokeball at ${name}...`);

  const caught = attemptCatch(base_experience);
  if (caught) {
    console.log(`${name} was caught!\n`);
    state.pokeDex[name] = pokemon;
  } else {
    console.log(`${name} escaped!\n`);
  }
}

/**
 * Attempts to catch a Pokémon by name.
 *
 * Validates args, fetches Pokémon data, and runs the catch mechanic.
 * Handles missing args and HTTP errors (e.g. 404) with user-facing messages.
 *
 * @param state - Current state; uses state.args[0] and state.pokeapi.
 * @returns void
 * @example
 * // User types: catch pikachu
 * commandCatch({ args: ["pikachu"], pokeapi, ... });
 */
export async function commandCatch(state: State): Promise<void> {
  const pokemonName = getPokemonName(state.args);
  if (pokemonName === undefined) {
    console.error("Error: catch requires a pokemon name");
    return;
  }

  try {
    const pokemon = await state.pokeapi.fetchPokemon(pokemonName);
    catchPokemon(pokemon, state);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error:", message);
  }
}

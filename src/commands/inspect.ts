import type { ShallowPokemon } from "../lib/pokeapi.js";
import type { State } from "../state.js";

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
 * Prints Pokémon info (name, height, weight, stats, types) to stdout.
 * When pokemon is undefined (not caught), prints "you have not caught that pokemon".
 *
 * @param pokemon - The Pokémon to display, or undefined when not in the Pokédex.
 * @returns void
 */
function printPokemonInfo(pokemon: ShallowPokemon | undefined): void {
  if (!pokemon) {
    console.log(`you have not caught that pokemon\n`);
    return;
  }
  console.log(`Name: ${pokemon.name}`);
  console.log(`Height: ${pokemon.height}`);
  console.log(`Weight: ${pokemon.weight}`);
  console.log("Stats:");
  for (const s of pokemon.stats) {
    console.log(`  -${s.stat.name}: ${s.base_stat}`);
  }
  console.log("Types:");
  for (const t of pokemon.types) {
    console.log(`  - ${t.type.name}`);
  }
  console.log("");
}

/**
 * Displays details for a Pokémon already in the Pokédex.
 *
 * Validates args and looks up the Pokémon in state.pokeDex. Fails when no args.
 * Delegates to printPokemonInfo for output (handles both found and not-caught).
 *
 * @param state - Current state; uses state.args[0] and state.pokeDex.
 * @returns void
 * @example
 * // User types: inspect pidgey
 * commandInspect({ args: ["pidgey"], pokeDex, ... });
 */
export async function commandInspect(state: State): Promise<void> {
  const pokemonName = getPokemonName(state.args);
  if (pokemonName === undefined) {
    console.error("Error: inspect requires a pokemon name\n");
    return;
  }
  const pokemon = state.pokeDex[pokemonName];
  printPokemonInfo(pokemon);
}

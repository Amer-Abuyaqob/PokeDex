import type { State } from "../state.js";

/**
 * Lists all Pokémon caught by the user.
 *
 * Handles the empty pokeDex case by printing a friendly message instead of
 * an empty list. When the pokeDex has entries, prints each Pokémon name
 * in a bullet list.
 *
 * @param state - Current state; uses state.pokeDex to list caught Pokémon.
 * @returns void
 * @example
 * // Empty pokeDex:
 * commandPokeDex({ pokeDex: {}, ... });
 * // → "Your Pokedex is empty."
 *
 * // Non-empty pokeDex:
 * commandPokeDex({ pokeDex: { pikachu: {...}, charmander: {...} }, ... });
 * // → Lists pikachu, charmander, etc.
 */
export async function commandPokeDex(state: State): Promise<void> {
  const caughtNames = Object.keys(state.pokeDex);

  if (caughtNames.length === 0) {
    console.log("Your Pokedex is empty.\n");
    return;
  }

  console.log("Your Pokedex:");
  for (const name of caughtNames) {
    console.log(` - ${name}`);
  }
  console.log("");
}

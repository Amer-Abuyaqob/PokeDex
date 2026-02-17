import type { State } from "./state.js";

/**
 * Displays a dynamic help message for all Pokedex commands.
 *
 * @param state - Current state; uses state.commands to list commands in help output
 * @returns void
 * @example
 * commandHelp({ args: [], commands: { help: { ... } }, readline: rl });
 * // Prints usage information for the Pokedex and the help command
 */
export function commandHelp(state: State): void {
  console.log("Welcome to the Pokedex!");
  console.log("Usage:\n");

  // Iterate over all registered commands and print their name and description
  for (const command of Object.values(state.commands)) {
    console.log(`${command.name}: ${command.description}`);
  }

  console.log("");
}

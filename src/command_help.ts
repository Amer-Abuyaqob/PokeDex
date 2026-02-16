import { CLICommand } from "./command.js";

/**
 * Displays a dynamic help message for all Pokedex commands.
 *
 * @param _args - Unused; help does not take any arguments
 * @param _commands - Map of available CLI commands to list in the help output
 * @returns void
 * @example
 * commandHelp([], {
 *   help: { name: "help", description: "Displays a help message", callback: commandHelp },
 * } as Record<string, CLICommand>);
 * // Prints usage information for the Pokedex and the help command
 */
export function commandHelp(
  _args: string[],
  _commands: Record<string, CLICommand>,
): void {
  console.log("Welcome to the Pokedex!");
  console.log("Usage:\n");

  // Iterate over all registered commands and print their name and description
  for (const command of Object.values(_commands)) {
    console.log(`${command.name}: ${command.description}`);
  }
}
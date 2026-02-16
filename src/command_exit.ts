import type { CLICommand } from "./command.js";

/**
 * Exits the Pokedex REPL gracefully.
 *
 * @param _args - Unused; exit does not take any arguments
 * @param _commands - Unused; included for a consistent callback signature
 * @returns void
 * @example
 * commandExit([], {} as Record<string, CLICommand>);
 * // Prints "Closing the Pokedex... Goodbye!" and exits
 */
export function commandExit(
  _args: string[],
  _commands: Record<string, CLICommand>,
): void {
  console.log("Closing the Pokedex... Goodbye!");
  process.exit(0);
}

import { CLICommand } from "./command";

/**
 * Exits the Pokedex REPL gracefully.
 *
 * @returns void
 * @example
 * commandExit(); // Prints "Closing the Pokedex... Goodbye!" and exits
 */
export function commandExit(_commands: Record<string, CLICommand>): void {
  console.log("Closing the Pokedex... Goodbye!");
  process.exit(0);
}

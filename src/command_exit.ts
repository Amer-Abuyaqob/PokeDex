import type { State } from "./state.js";

/**
 * Exits the Pokedex REPL gracefully.
 *
 * Closes the readline interface before exiting so the process shuts down cleanly.
 *
 * @param state - State; uses state.readline to close the interface
 * @returns void
 * @example
 * commandExit({ args: [], commands: {}, readline: rl });
 * // Closes readline, prints "Closing the Pokedex... Goodbye!" and exits
 */
export function commandExit(state: State): void {
  state.readline.close();
  console.log("Closing the Pokedex... Goodbye!");
  process.exit(0);
}

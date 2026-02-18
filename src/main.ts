import { startREPL } from "./repl.js";
import { initState } from "./state.js";

/**
 * Entry point: starts the Pokedex REPL.
 *
 * @returns void
 */
function main(): void {
  const state = initState();
  startREPL(state);
}

main();

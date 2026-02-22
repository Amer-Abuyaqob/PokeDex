import {
  createInterface,
  type Interface as ReadlineInterface,
} from "node:readline";
import { stdin, stdout } from "node:process";
import { commandHelp } from "./command_help.js";
import { commandExit } from "./command_exit.js";
import { PokeAPI } from "./pokeapi.js";
import { commandExplore } from "./command_explore.js";
import { commandMap } from "./command_map.js";
import { commandMapb } from "./command_mapb.js";

/**
 * Snapshot of REPL context passed into each command when it runs.
 *
 * Provides handlers with: the command registry (e.g. for "help"), the readline
 * interface for cleanup (e.g. "exit" closes it), the PokeAPI client for
 * fetching data, and pagination URLs for location-area browsing (map/mapb).
 */
export type State = {
  /** Positional arguments that follow the command name. */
  args: string[];
  /** Map of all available CLI commands (e.g. for "help" to list them). */
  commands: Record<string, CLICommand>;
  /** Readline interface so commands can close it (e.g. exit). */
  readline: ReadlineInterface;
  /** PokeAPI client for fetching Pokémon data. */
  pokeapi: PokeAPI;
  /** URL for the next page of location areas, or null if on the last page. */
  nextLocationsURL: string | null;
  /** URL for the previous page of location areas, or null if on the first page. */
  prevLocationsURL: string | null;
};

/**
 * Describes a single REPL command available in the Pokedex CLI.
 *
 * Each command is responsible only for its own behavior; parsing and lookup
 * are handled by the REPL layer.
 */
export type CLICommand = {
  /** The primary word the user types to invoke this command (e.g. "exit"). */
  name: string;
  /** Short human-readable description shown in help output. */
  description: string;
  /**
   * Executes this command with the current REPL state.
   *
   * @param state - Full state (args, commands, readline, pokeapi, pagination URLs)
   * @returns Promise resolving when the command finishes
   */
  callback: (state: State) => Promise<void>;
};

/**
 * Builds and returns the set of available Pokedex CLI commands.
 *
 * @returns Map of command name to command definition
 * @example
 * const commands = getCommands();
 * commands.exit.callback({ args: [], commands, readline: rl });
 */
function getCommands(): Record<string, CLICommand> {
  return {
    exit: {
      name: "exit",
      description: "Exits the pokedex",
      callback: commandExit,
    },

    help: {
      name: "help",
      description: "Displays a help message",
      callback: commandHelp,
    },

    map: {
      name: "map",
      description: "Displays 20 location-area names (paginated)",
      callback: commandMap,
    },

    mapb: {
      name: "mapb",
      description: "Displays the previous 20 location-area names (paginated)",
      callback: commandMapb,
    },

    explore: {
      name: "explore",
      description:
        "Displays Pokemon that can be encountered at a location area",
      callback: commandExplore,
    },

    // TODO: Add more commands (e.g. catch, inspect, pokedex).
  };
}

/**
 * Creates the initial REPL state for the Pokedex CLI.
 *
 * Sets up the readline interface, command registry, PokeAPI client, and
 * pagination state. Returns a State object with empty args and null
 * pagination URLs ready to be populated per command.
 *
 * @returns Initial State with readline, commands, pokeapi, and empty pagination
 * @example
 * const state = initState();
 * state.readline.prompt(); // Starts the REPL prompt
 */
export function initState(): State {
  const args: string[] = [];
  const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > ",
  });
  const commands = getCommands();
  const pokeapi = new PokeAPI();
  const nextLocationsURL = null;
  const prevLocationsURL = null;
  return {
    args,
    commands,
    readline,
    pokeapi,
    nextLocationsURL,
    prevLocationsURL,
  };
}

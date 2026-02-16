import type { CLICommand } from "./command.js";
import { commandExit } from "./command_exit.js";
import { commandHelp } from "./command_help.js";

/**
 * Builds and returns the set of available Pokedex CLI commands.
 *
 * @returns A map of command name to command definition
 * @example
 * const commands = getCommands();
 * commands.exit.callback([], commands);
 */
export function getCommands(): Record<string, CLICommand> {
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
    
    // TODO: Add more commands (e.g. help, map, explore, catch, inspect, pokedex).

  };
}

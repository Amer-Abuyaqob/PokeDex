import { CLICommand } from "./command";
import { commandExit } from "./command_exit";

/**
 * Builds and returns the set of available Pokedex CLI commands.
 *
 * @returns A map of command name to command definition
 * @example
 * const commands = getCommands();
 * commands.exit.callback(commands);
 */
export function getCommands(): Record<string, CLICommand> {
  return {
    exit: {
      name: "exit",
      description: "Exits the pokedex",
      callback: commandExit,
    },
    // can add more commands here
  };
}

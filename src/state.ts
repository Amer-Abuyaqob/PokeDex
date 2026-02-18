import {
  createInterface,
  type Interface as ReadlineInterface,
} from "node:readline";
import { stdin, stdout } from "node:process";
import { commandHelp } from "./command_help.js";
import { commandExit } from "./command_exit.js";

/**
 * Snapshot of REPL context passed into each command when it runs.
 *
 * Gives handlers the command registry (e.g. for "help") and the readline
 * interface so they can clean up (e.g. "exit" closes the interface).
 */
export type State = {
  /** Positional arguments that follow the command name. */
  args: string[];
  /** Map of all available CLI commands (e.g. for "help" to list them). */
  commands: Record<string, CLICommand>;
  /** Readline interface so commands can close it (e.g. exit). */
  readline: ReadlineInterface;
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
   * @param state - Current state (args, command registry, readline interface)
   * @returns void
   */
  callback: (state: State) => void;
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

    // TODO: Add more commands (e.g. help, map, explore, catch, inspect, pokedex).
  };
}

export function initState(): State {
  const args: string[] = [];
  const readline = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > ",
  });
  const commands = getCommands();

  return {
    args,
    commands,
    readline,
  };
}

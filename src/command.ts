/**
 * Describes a single REPL command available in the Pokedex CLI.
 *
 * Each command is responsible only for its own behavior, while parsing and
 * lookup are handled by the REPL layer.
 */
export type CLICommand = {
  /** The primary word the user types to invoke this command (e.g. "exit"). */
  name: string;
  /** Short human‑readable description shown in help output. */
  description: string;
  /**
   * Executes this command.
   *
   * @param args - Positional arguments that follow the command name
   * @param commands - Map of all available commands, for commands like "help"
   * @returns void
   */
  callback: (args: string[], commands: Record<string, CLICommand>) => void;
};

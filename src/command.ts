/**
 * Describes a single REPL command available in the Pokedex CLI.
 */
export type CLICommand = {
  name: string;
  description: string;
  callback: (commands: Record<string, CLICommand>) => void;
};

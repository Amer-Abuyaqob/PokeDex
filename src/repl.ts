import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { getCommands } from "./commands.js";
import type { CLICommand } from "./command.js";

/**
 * Splits the user's input into words (by whitespace), lowercases it, and trims
 * leading/trailing whitespace.
 *
 * @param input - Raw user input string
 * @returns Array of lowercase words, e.g. "hello world" → ["hello", "world"]
 *
 * @example
 * cleanInput("hello world") // ["hello", "world"]
 * cleanInput("Charmander Bulbasaur PIKACHU") // ["charmander", "bulbasaur", "pikachu"]
 */
export function cleanInput(input: string): string[] {
  input = input.trim().toLowerCase();
  // Empty string split by \s+ in JS yields [""], not []. Return [] so isEmptyInput works.
  if (input === "") return [];
  // \s+ splits on one-or-more whitespace (avoids empty strings from multiple spaces)
  return input.split(/\s+/);
}

/**
 * Extracts the command name and its arguments from the user's tokens.
 *
 * @param tokens - Non-empty array of lowercase words from the user's input
 * @returns Object containing the command name and its positional arguments
 */
function extractCommand(tokens: string[]): { name: string; args: string[] } {
  const [name, ...args] = tokens;
  return { name, args };
}

/**
 * Looks up a command definition by name.
 *
 * @param name - Command name (first token from user input)
 * @param commands - Map of all available commands
 * @returns The matching command or undefined if not found
 */
function findCommand(
  name: string,
  commands: Record<string, CLICommand>,
): CLICommand | undefined {
  return commands[name];
}

/**
 * Executes a single command given parsed tokens (e.g. ["exit"] or
 * ["catch", "pikachu"]).
 *
 * Responsibilities:
 * 1. Extract the command name and arguments.
 * 2. Resolve the command from the registry.
 * 3. Execute the command or report an error if unknown.
 *
 * @param tokens - Non-empty array of lowercase words from the user's input
 * @returns void
 */
function executeCommand(tokens: string[]): void {
  const { name, args } = extractCommand(tokens);
  const commands = getCommands();
  const command = findCommand(name, commands);

  if (!command) {
    console.log(`Unknown command: "${name}". Type "help" for a list of commands.`);
    return;
  }

  command.callback(args, commands);
}

/**
 * Returns whether the parsed input should be treated as "no command" (blank line).
 *
 * @param tokens - Array of words from the user's input (may be empty)
 * @returns True if there are no tokens (blank or whitespace-only input)
 */
function isEmptyInput(tokens: string[]): boolean {
  return tokens.length < 1;
}

/**
 * Starts the Read-Eval-Print Loop (REPL) for the Pokedex CLI.
 *
 * Creates a readline interface that reads from stdin and writes to stdout,
 * showing the "Pokedex > " prompt. Each time the user submits a line (Enter),
 * the input is cleaned, validated, and processed; then the prompt is shown again.
 *
 * @returns void
 *
 * @example
 * // Typically called from main entry point:
 * startREPL();
 */
export function startREPL(): void {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: "Pokedex > ",
  });

  rl.prompt();

  rl.on("line", (input: string) => {
    const tokens = cleanInput(input);

    if (!isEmptyInput(tokens)) {
      executeCommand(tokens);
    }

    rl.prompt();
  });
}

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

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
 * Executes a single command given parsed tokens (e.g. ["get", "pikachu"]).
 * Single responsibility: take tokens and perform the corresponding action.
 *
 * @param tokens - Non-empty array of lowercase words from the user's input
 * @returns void
 */
function executeCommand(tokens: string[]): void {
  // HACK: For now, echo the first word; later dispatch to real commands (get, exit, etc.).
  console.log(`Your command was: ${tokens[0]}`);
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

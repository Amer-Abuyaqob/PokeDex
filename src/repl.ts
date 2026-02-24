import type { CLICommand, State } from "./state.js";

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
 * 2. Set state.args for the current invocation.
 * 3. Resolve the command from the registry.
 * 4. Execute the command with the shared state (mutations persist across calls).
 * 5. Log an error if the command throws.
 *
 * @param state - Shared REPL state; mutated (args set) and passed to the command callback
 * @param tokens - Non-empty array of lowercase words from the user's input
 * @returns Promise resolving when the command finishes (or rejects are caught)
 */
async function executeCommand(state: State, tokens: string[]): Promise<void> {
  const { name, args } = extractCommand(tokens);
  state.args = args;
  const command = findCommand(name, state.commands);

  if (!command) {
    console.log(
      `Unknown command: "${name}". Type "help" for a list of commands.\n`,
    );
    return;
  }

  try {
    await command.callback(state);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error:", message + "\n");
  }
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
 * Parses input, checks for empty input, and executes the command if non-empty.
 * Used for testing the REPL without spawning the interactive loop.
 *
 * @param state - Shared REPL state passed to the command callback
 * @param input - Raw user input string (e.g. "help" or "catch pikachu")
 * @returns Promise resolving when the command finishes
 */
export async function runCommand(state: State, input: string): Promise<void> {
  const tokens = cleanInput(input);
  if (isEmptyInput(tokens)) return;
  await executeCommand(state, tokens);
}

/**
 * Starts the Read-Eval-Print Loop (REPL) for the Pokedex CLI.
 *
 * Starts the interactive prompt and routes each input line to a command handler.
 * Runs until the user exits (e.g. via the exit command).
 *
 * @param state - Initial REPL state created by initState
 * @returns void
 *
 * @example
 * // Typically called from main entry point:
 * const state = initState();
 * startREPL(state); // REPL runs until user types "exit"
 */
export function startREPL(state: State): void {
  const { readline } = state;
  readline.prompt();

  readline.on("line", async (input: string) => {
    const tokens = cleanInput(input);

    if (!isEmptyInput(tokens)) {
      await executeCommand(state, tokens);
    }

    readline.prompt();
  });
}

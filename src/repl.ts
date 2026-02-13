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
  // TODO: error handling for input (empty string)
  input = input.trim().toLowerCase();
  return input.split(" ");
}

/**
 * Represents a single entry in the Pokémon cache.
 *
 * @template T - The type of the cached value (e.g., Pokémon, list of Pokémon).
 */
type CacheEntry<T> = {
  /** Unix timestamp (ms) when the entry was cached. */
  cachedAt: number;
  /** The cached data. */
  value: T;
};
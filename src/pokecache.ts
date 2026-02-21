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

/**
 * In-memory cache for Pokémon API responses.
 *
 * Reduces network requests by storing previously fetched data
 * and serving it from memory when available. Use {@link add} to store entries.
 */
export class Cache {
  /** Internal map of cache keys to their entries. */
  #cache = new Map<string, CacheEntry<any>>();

  /**
   * Stores a value in the cache under the given key.
   *
   * Overwrites any existing entry for the same key.
   *
   * @param key - Unique identifier for the cached value (e.g., Pokémon name or ID).
   * @param value - The data to cache.
   * @template T - Type of the value being stored.
   */
  add<T>(key: string, value: T): void {
    const cachedAt = Date.now();
    this.#cache.set(key, { cachedAt, value });
  }
}
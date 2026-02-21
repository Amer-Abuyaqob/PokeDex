/**
 * Represents a single entry in the Pokémon cache.
 *
 * @template T - The type of the cached value (e.g., Pokémon, list of Pokémon).
 */
type CacheEntry<T> = {
  /** Unix timestamp (ms) when the entry was created. */
  createdAt: number;
  /** The cached data. */
  value: T;
};

/**
 * In-memory cache for Pokémon API responses.
 *
 * Reduces network requests by storing previously fetched data
 * and serving it from memory when available. Supports automatic reaping
 * of stale entries at a configurable interval. Use {@link add} to store
 * entries and {@link get} to retrieve them.
 */
export class Cache {
  /** Internal map of cache keys to their entries. */
  #cache = new Map<string, CacheEntry<any>>();

  /** ID of the active reap interval, or `undefined` when not running. */
  #reapIntervalId: NodeJS.Timeout | undefined = undefined;

  /** Reap interval in milliseconds. */
  readonly #interval: number;

  /**
   * Creates a cache with the given reap interval.
   *
   * @param interval - How often (in ms) to run the reap process. Must be positive.
   */
  constructor(interval: number) {
    if (interval <= 0) {
      throw new RangeError("Reap interval must be a positive number");
    }
    this.#interval = interval;
  }


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
    const createdAt = Date.now();
    this.#cache.set(key, { createdAt, value });
  }

  /**
   * Retrieves a value from the cache by key.
   *
   * @param key - The cache key to look up.
   * @returns The cached value, or `undefined` if the key is not found.
   * @template T - Expected type of the cached value (for type-safe retrieval).
   */
  get<T>(key: string): T | undefined {
    return this.#cache.get(key)?.value;
  }

  /**
   * Determines whether a cache entry has exceeded its TTL.
   *
   * @param entry - The cache entry to check.
   * @returns `true` if the entry is older than the reap interval.
   */
  #isOld(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.createdAt > this.#interval;
  }

  /**
   * Removes all stale entries from the cache.
   *
   * Called periodically by the reap scheduler. Entries are considered stale
   * when their age exceeds the configured interval.
   */
  #reap(): void {
    for (const [key, entry] of this.#cache) {
      if (this.#isOld(entry)) {
        this.#cache.delete(key);
      }
    }
  }

  /**
   * Starts the periodic reap loop that removes stale cache entries.
   *
   * Idempotent: does nothing if the loop is already running.
   */
  #startReapLoop(): void {
    if (this.#reapIntervalId !== undefined) return;

    this.#reapIntervalId = setInterval(() => this.#reap(), this.#interval);
  }
}

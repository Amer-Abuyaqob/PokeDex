import { Cache } from "./pokecache.js";

/**
 * Client for the PokeAPI (https://pokeapi.co/).
 *
 * Handles HTTP requests for Pokémon-related data such as locations and location areas.
 * Caches successful responses in memory to reduce redundant network requests.
 */
export class PokeAPI {
  /** Base URL for all PokeAPI v2 endpoints. */
  private static readonly baseURL = "https://pokeapi.co/api/v2";

  /** Default page size when fetching paginated location-area results. */
  private static readonly DEFAULT_PAGE_SIZE = 20;

  /** Cache TTL in milliseconds (5 minutes). Entries are reaped after this age. */
  private static readonly CACHE_TTL_MS = 300_000;

  /** Shared in-memory cache for API responses. */
  private static cache = new Cache(PokeAPI.CACHE_TTL_MS);

  /** Creates a PokeAPI client instance. */
  constructor() {}

  /**
   * Stores a successful API response in the cache.
   *
   * @param url - Cache key (the request URL).
   * @param data - The response data to cache.
   * @returns void
   * @template T - Type of the cached data.
   */
  static #addToCache<T>(url: string, data: T): void {
    PokeAPI.cache.add<T>(url, data);
  }

  /**
   * Validates locationName. Input comes from cleanInput (no trimming needed;
   * cleanInput never returns empty strings).
   *
   * Caller scenarios: correct name (success), incorrect name (API 404), or
   * no args (undefined when user types e.g. "explore" with nothing after).
   *
   * @param locationName - The location area name (or undefined when no args).
   * @returns The validated location name.
   * @throws {Error} When locationName is not a string (e.g. undefined, no args).
   */
  static #validateLocationName(locationName: unknown): string {
    if (typeof locationName !== "string") {
      throw new Error("fetchLocation: locationName must be a string");
    }
    return locationName;
  }

  /**
   * Looks up a cached response by URL.
   *
   * @param url - Cache key (the request URL).
   * @returns The cached data, or undefined on miss.
   * @template T - Expected type of the cached data.
   */
  static #getFromCache<T>(url: string): T | undefined {
    return PokeAPI.cache.get<T>(url);
  }

  /**
   * Fetches JSON from a URL, using cache when available.
   *
   * On cache miss: fetches, validates the response, parses JSON, stores in cache.
   *
   * @param url - The URL to fetch.
   * @returns The parsed response data.
   * @template T - Expected shape of the JSON response.
   * @throws {Error} When the HTTP response is not OK.
   */
  static async #fetchWithCache<T>(url: string): Promise<T> {
    const cached = PokeAPI.#getFromCache<T>(url);
    if (cached) return cached;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as T;
    PokeAPI.#addToCache<T>(url, data);
    return data;
  }

  /**
   * Fetches a paginated list of location areas from the PokeAPI.
   *
   * Successful responses are cached by URL; repeated requests for the same URL
   * return the cached result until the entry expires (see {@link CACHE_TTL_MS}).
   *
   * @param pageURL - Optional full URL for a specific page (e.g. `next` or `previous` from a prior response).
   *                  If omitted, fetches the first page.
   * @returns Paginated location areas (count, next/previous URLs, and results array).
   * @throws {Error} When the HTTP response is not OK (e.g. 404, 500).
   * @example
   * const api = new PokeAPI();
   * const first = await api.fetchLocations();
   * const next = await api.fetchLocations(first.next ?? undefined);
   */
  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url =
      pageURL ??
      `${PokeAPI.baseURL}/location-area?offset=0&limit=${PokeAPI.DEFAULT_PAGE_SIZE}`;

    return PokeAPI.#fetchWithCache<ShallowLocations>(url);
  }

  /**
   * Fetches details for a single location area by name.
   *
   * @param locationName - The location area name (e.g. "canalave-city-area").
   * @returns The location area details.
   * @throws {Error} When locationName is not a string (e.g. no args provided).
   * @throws {Error} When the location is not found or the request fails.
   * @example
   * const api = new PokeAPI();
   * const loc = await api.fetchLocation("oreburgh-mine-b1f");
   */
  async fetchLocation(locationName: string): Promise<ShallowLocation> {
    const validated = PokeAPI.#validateLocationName(locationName);
    const url = `${PokeAPI.baseURL}/location-area/${validated}`;
    return PokeAPI.#fetchWithCache<ShallowLocation>(url);
  }
}

/**
 * Location-area shape from PokeAPI. List items have name and url; detail
 * responses add pokemon_encounters.
 *
 * @property name - Location area name (e.g. "oreburgh-mine-b1f").
 * @property url - PokeAPI URL for this location area.
 * @property pokemon_encounters - Present only in detail responses; list items omit it.
 */
export type ShallowLocation = {
  name: string;
  url: string;
  pokemon_encounters?: ShallowPokemon[];
};

/**
 * Paginated response for the location-area list endpoint.
 *
 * @property count - Total number of location areas across all pages.
 * @property next - URL for the next page, or `null` if this is the last page.
 * @property previous - URL for the previous page, or `null` if this is the first page.
 * @property results - Array of location area entries for the current page.
 */
export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ShallowLocation[];
};

/**
 * Pokémon encounter shape from location-area detail (nested under pokemon).
 *
 * @property pokemon - The Pokémon reference with name and URL.
 * @property pokemon.name - Pokémon name (e.g. "pikachu").
 * @property pokemon.url - PokeAPI URL for full Pokémon details.
 */
export type ShallowPokemon = {
  pokemon: {
    name: string;
    url: string;
  };
};

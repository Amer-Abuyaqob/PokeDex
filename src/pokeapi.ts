/**
 * Client for the PokeAPI (https://pokeapi.co/).
 *
 * Handles HTTP requests for Pokémon-related data such as locations and location areas.
 */
export class PokeAPI {
  /** Base URL for all PokeAPI v2 endpoints. */
  private static readonly baseURL = "https://pokeapi.co/api/v2";

  /** Default page size when fetching paginated location-area results. */
  private static readonly DEFAULT_PAGE_SIZE = 20;

  constructor() {}

  /**
   * Fetches a paginated list of location areas from the PokeAPI.
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

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as ShallowLocations;
    return data;
  }

  /**
   * Fetches details for a single location area by name.
   *
   * @param locationName - The location area name (e.g. "canalave-city-area").
   * @returns The location area details.
   * @throws {Error} When the location is not found or the request fails.
   */
  async fetchLocation(locationName: string): Promise<ShallowLocation> {
    // TODO: to be implemented
    throw new Error("Not implemented");
  }
}

/** Minimal location/item shape returned in list endpoints (name + URL). */
export type ShallowLocation = {
  name: string;
  url: string;
};

/** Paginated response for location-area list endpoint. */
export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ShallowLocation[];
};

const ENDPOINT = 'http://localhost:3000/graphql';
const TTL_MS = 30_000;

export type GqlResult = { data: unknown; errors: string[] };

export type CacheEntry = GqlResult & {
  loading: boolean;
  /** When the last clean response landed. Null means the entry is never fresh, e.g. it holds errors. */
  fetchedAt: number | null;
};

type InFlight = { controller: AbortController; promise: Promise<void> };

/** Serialises with sorted object keys, so `{a, b}` and `{b, a}` produce the same key. */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val: unknown) => {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) return val;
    const source = val as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .map((key) => [key, source[key]]),
    );
  });
}

export function cacheKey(query: string, variables: unknown): string {
  return `${query}\n${stableStringify(variables ?? {})}`;
}

/** Sends one GraphQL request. Every failure, including a dropped connection, comes back in `errors`. */
export async function sendRequest(
  query: string,
  variables: unknown,
  signal?: AbortSignal,
): Promise<GqlResult> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal,
    });
    if (!response.ok) {
      return { data: undefined, errors: [`Request failed with status ${response.status}`] };
    }
    const body = (await response.json()) as {
      data?: unknown;
      errors?: { message: string }[];
    };
    return {
      data: body.data ?? undefined,
      errors: (body.errors ?? []).map((error) => error.message),
    };
  } catch (error) {
    return {
      data: undefined,
      errors: [error instanceof Error ? error.message : 'Request failed'],
    };
  }
}

export function isFresh(entry: CacheEntry | undefined): boolean {
  return entry?.fetchedAt != null && Date.now() - entry.fetchedAt < TTL_MS;
}

export function createGqlStore() {
  const entries = new Map<string, CacheEntry>();
  const inFlight = new Map<string, InFlight>();
  const listeners = new Map<string, Set<() => void>>();
  /** Which cache keys have been read under each caller-supplied `queryKey`. */
  const keysByLabel = new Map<string, Set<string>>();
  /** The last query and variables loaded for each key, so `refresh` can repeat them. */
  const requests = new Map<string, { query: string; variables: unknown }>();

  const keysFor = (labelOrKey: string) => keysByLabel.get(labelOrKey) ?? new Set([labelOrKey]);

  function write(key: string, entry: CacheEntry | undefined) {
    if (entry) entries.set(key, entry);
    else entries.delete(key);
    listeners.get(key)?.forEach((listener) => listener());
  }

  return {
    get: (key: string) => entries.get(key),

    subscribe(key: string, listener: () => void) {
      const set = listeners.get(key) ?? new Set();
      listeners.set(key, set);
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },

    tag(label: string, key: string) {
      const keys = keysByLabel.get(label) ?? new Set();
      keysByLabel.set(label, keys);
      keys.add(key);
    },

    /** Starts a request for `key`, or joins the one already running. Skips cached results. */
    load(key: string, query: string, variables: unknown): Promise<void> {
      const running = inFlight.get(key);
      if (running) return running.promise;

      const controller = new AbortController();
      const previous = entries.get(key);
      requests.set(key, { query, variables });
      write(key, {
        data: previous?.data,
        // Kept until the response lands, so a warning or error doesn't vanish during a reload.
        errors: previous?.errors ?? [],
        loading: true,
        fetchedAt: previous?.fetchedAt ?? null,
      });

      const promise = sendRequest(query, variables, controller.signal).then(({ data, errors }) => {
        // A reset took this request out of the map, so its result no longer has anywhere to go.
        if (inFlight.get(key)?.controller !== controller) return;
        inFlight.delete(key);
        write(key, {
          // A failed revalidation keeps the last good data alongside the errors.
          data: data ?? previous?.data,
          errors,
          loading: false,
          fetchedAt: errors.length > 0 ? null : Date.now(),
        });
      });

      inFlight.set(key, { controller, promise });
      return promise;
    },

    /** Reads through the cache: does nothing if the entry is fresh or a request is already running. */
    ensure(key: string, query: string, variables: unknown): void {
      if (isFresh(entries.get(key))) return;
      void this.load(key, query, variables);
    },

    /** Accepts a `queryKey` label or a cache key. Clears the data for every hook reading those keys. */
    reset(labelOrKey: string) {
      // Tags outlive a reset, because hooks can still be mounted on those keys under this label.
      for (const key of keysFor(labelOrKey)) {
        const running = inFlight.get(key);
        inFlight.delete(key);
        running?.controller.abort();
        write(key, undefined);
      }
    },

    /**
     * Accepts a `queryKey` label or a cache key. Reloads every entry a hook is reading, keeping its data
     * on screen meanwhile, and marks the rest stale so they reload when next read. A request already
     * running is restarted, because it may have been sent before the change that made the data stale.
     */
    async refresh(labelOrKey: string): Promise<void> {
      const reloads = [...keysFor(labelOrKey)].map((key) => {
        const entry = entries.get(key);
        const request = requests.get(key);
        if (!entry || !request) return undefined;
        if (!listeners.get(key)?.size) {
          write(key, { ...entry, fetchedAt: null });
          return undefined;
        }
        const running = inFlight.get(key);
        inFlight.delete(key);
        running?.controller.abort();
        return this.load(key, request.query, request.variables);
      });
      await Promise.all(reloads);
    },

    /** The current entries for a `queryKey` label or a cache key. */
    entriesFor(labelOrKey: string): CacheEntry[] {
      return [...keysFor(labelOrKey)].flatMap((key) => entries.get(key) ?? []);
    },

    /**
     * Accepts a `queryKey` label or a cache key. Rewrites the data of every entry under it, for a change
     * the caller already knows the result of. Freshness is left as it is.
     */
    update(labelOrKey: string, updater: (data: unknown) => unknown) {
      for (const key of keysFor(labelOrKey)) {
        const entry = entries.get(key);
        if (entry?.data !== undefined) write(key, { ...entry, data: updater(entry.data) });
      }
    },

    /** Empties the store: aborts every request and removes all entries and labels. */
    clear() {
      for (const running of inFlight.values()) running.controller.abort();
      inFlight.clear();
      keysByLabel.clear();
      requests.clear();
      for (const key of [...entries.keys()]) write(key, undefined);
    },
  };
}

export type GqlStore = ReturnType<typeof createGqlStore>;

/** The module-level cache. Components reach it through `GqlProvider`. */
export const gqlStore = createGqlStore();

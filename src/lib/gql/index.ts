import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useGqlStore } from './context';
import { cacheKey, isFresh, sendRequest } from './store';
import type { UseMutationResult, UseQueryResult } from './types';

export { GqlProvider } from './GqlProvider';
export { useGqlStore } from './context';
export type { UseMutationResult, UseQueryResult } from './types';

export class GraphQLRequestError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join('; '));
    this.name = 'GraphQLRequestError';
    this.errors = errors;
  }
}

function resolveVariables<TVars>(configured: TVars | undefined, passed: TVars | undefined, replace: boolean) {
  return replace ? passed : ({ ...configured, ...passed } as TVars);
}

const NO_ERRORS: string[] = [];

export function useQuery<TData, TVars>(
  query: string,
  options: {
    variables?: TVars;
    fetchFirst?: boolean; // when true, fire on mount and on variable change
    queryKey?: string;    // stable handle for cancellation / invalidation
  },
): UseQueryResult<TData, TVars> {
  const { variables, fetchFirst = false, queryKey } = options;
  const store = useGqlStore();

  // Comparing this string, not the object, is what stops a fresh literal from looping.
  const configuredKey = cacheKey(query, variables);

  // `refetch` can point the hook at other variables. Tying that to the configured key
  // discards it as soon as the configured variables change, in the same render.
  const [refetched, setRefetched] = useState<{ from: string; key: string } | null>(null);
  const activeKey = refetched?.from === configuredKey ? refetched.key : configuredKey;

  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(activeKey, listener),
    [store, activeKey],
  );
  const entry = useSyncExternalStore(subscribe, () => store.get(activeKey));

  // The first request only starts in the effect below. This covers the renders before it,
  // so a hook with no data never briefly reports that it has finished loading.
  const [requestedKey, setRequestedKey] = useState<string | null>(null);
  const awaitingFirstRequest =
    fetchFirst && requestedKey !== configuredKey && !isFresh(store.get(configuredKey));

  useEffect(() => {
    if (queryKey) store.tag(queryKey, activeKey);
  }, [store, queryKey, activeKey]);

  useEffect(() => {
    if (!fetchFirst) return;
    store.ensure(configuredKey, query, variables);
    setRequestedKey(configuredKey);
    // `variables` is covered by configuredKey, which compares it by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, configuredKey, fetchFirst]);

  const refetch = useCallback(
    async (passed?: TVars, replace = false) => {
      const resolved = resolveVariables(variables, passed, replace);
      const key = cacheKey(query, resolved);
      if (queryKey) store.tag(queryKey, key);
      setRefetched({ from: configuredKey, key });
      await store.load(key, query, resolved);
    },
    // `variables` is covered by configuredKey, which compares it by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, configuredKey, queryKey],
  );

  const reset = useCallback(
    (key?: string) => store.reset(key ?? queryKey ?? activeKey),
    [store, queryKey, activeKey],
  );

  return {
    loading: (entry?.loading ?? false) || awaitingFirstRequest,
    errors: entry?.errors ?? NO_ERRORS,
    data: entry?.data as TData | undefined,
    refetch,
    reset,
  };
}

export function useMutation<TData, TVars>(
  query: string,
  options: { variables?: TVars; throwError?: boolean },
): UseMutationResult<TData, TVars> {
  const { variables, throwError = false } = options;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>(NO_ERRORS);
  const latestCall = useRef(0);

  const configuredKey = cacheKey(query, variables);

  const mutateData = useCallback(
    async (passed?: TVars, replace = false) => {
      const call = ++latestCall.current;
      setLoading(true);
      setErrors(NO_ERRORS);

      const result = await sendRequest(query, resolveVariables(variables, passed, replace));

      if (call === latestCall.current) {
        setLoading(false);
        setErrors(result.errors);
      }

      if (result.errors.length > 0 && throwError) throw new GraphQLRequestError(result.errors);
      return result.data as TData | undefined;
    },
    // `variables` is covered by configuredKey, which compares it by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configuredKey, throwError],
  );

  return { loading, errors, mutateData };
}

import { useSyncExternalStore } from 'react';

const PAGE_PARAM = 'page';
const FIRST_PAGE = 1;
// GraphQL's Int is 32-bit, so anything larger would be rejected by the API.
const MAX_PAGE = 2_147_483_647;

// The History API doesn't fire an event for pushState or replaceState, so writes notify these.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

function readPage(): number {
  const value = new URLSearchParams(window.location.search).get(PAGE_PARAM) ?? '';
  if (!/^[1-9]\d*$/.test(value)) return FIRST_PAGE;
  const page = Number(value);
  return page <= MAX_PAGE ? page : FIRST_PAGE;
}

export function usePageParam(): number {
  return useSyncExternalStore(subscribe, readPage);
}

/** Use `replace` for corrections the user didn't ask for, so Back doesn't return to the bad page. */
export function setPageParam(page: number, { replace = false }: { replace?: boolean } = {}) {
  const url = new URL(window.location.href);
  if (page === FIRST_PAGE) url.searchParams.delete(PAGE_PARAM);
  else url.searchParams.set(PAGE_PARAM, String(page));

  if (url.href === window.location.href) return;

  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  listeners.forEach((listener) => listener());
}

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppStore } from './useAppState.tsx';

// ============================================================================
// USE SYNCED QUERY HOOK
// Integrates URL query params with app state and API fetching
// ============================================================================

export function useSyncedQuery(key, fetchFn, options = {}) {
  const { debounceMs = 300, immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filters = useAppStore((state) => state.filters);
  const setFilters = useAppStore((state) => state.setFilters);
  const getFilter = useCallback(
    () => filters[key] || {},
    [filters, key]
  );

  // Debounced fetch
  const fetchRef = useRef(null);
  const debouncedFetch = useCallback(
    debounce((queryParams) => {
      setLoading(true);
      fetchFn(queryParams)
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          console.error(`Failed to fetch ${key}:`, err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, debounceMs),
    [fetchFn, key, debounceMs]
  );

  // Effect: when filter changes, schedule fetch
  useEffect(() => {
    if (immediate) {
      debouncedFetch(getFilter());
    }
  }, [getFilter, debouncedFetch, immediate]);

  // Manual refresh
  const refresh = useCallback(() => {
    debouncedFetch(getFilter());
  }, [debouncedFetch, getFilter]);

  // Update filter
  const updateFilter = useCallback(
    (updates) => {
      setFilters({ [key]: { ...getFilter(), ...updates } });
    },
    [key, getFilter, setFilters]
  );

  return {
    data,
    loading,
    error,
    refresh,
    updateFilter,
    filter: getFilter(),
  };
}

// ============================================================================
// USE DASHBOARD WIDGET DATA
// Specific hook for widget data fetching with caching
// ============================================================================

export function useWidgetData(widgetId, fetchFn, options = {}) {
  const { cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchedRef = useRef(null);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    if (
      lastFetchedRef.current &&
      now - lastFetchedRef.current < cacheTime &&
      data
    ) {
      // Use cached data if fresh
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      lastFetchedRef.current = Date.now();
    } catch (err) {
      setError(err);
      console.error(`Widget ${widgetId} fetch failed:`, err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, widgetId, cacheTime, data]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// UTILITY: Debounce
// ============================================================================

function debounce(fn, delay) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export { useSyncedQuery as default };

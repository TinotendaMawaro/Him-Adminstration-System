import React, { useEffect, useCallback, useState, useRef } from 'react';
import { StateHydrationProvider, useAppStore, storageService } from './useAppState.tsx';
import { DashboardProvider } from './useDashboard.jsx';

// ============================================================================
// GLOBAL STATE PROVIDER
// ============================================================================

export function GlobalStateProvider({ children }) {
  // Monitor storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'him-app-state') {
        console.info('🔄 Detected state change from another tab');
        // Could trigger a refresh if needed
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <StateHydrationProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </StateHydrationProvider>
  );
}

// ============================================================================
// CUSTOM HOOK: USE STATE WITH API SYNC
// ============================================================================

/**
 * Hook that syncs a piece of state with localStorage and optionally triggers API calls
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {object} options - Configuration options
 * @param {function} [options.onChange] - Callback when value changes
 * @param {function} [options.fetchFn] - Function to fetch data from API
 * @param {function} [options.validate] - Custom validation schema
 */
export function usePersistedState(key, defaultValue, options = {}) {
  const { onChange, fetchFn, validate } = options;
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = storageService.read(key);
    if (stored !== null) {
      try {
        let parsed = stored;
        if (validate) {
          parsed = validate.parse(stored);
        }
        setValue(parsed);
      } catch (error) {
        console.warn(`Failed to validate ${key}:`, error);
      }
    }
    setLoading(false);
  }, [key, validate]);

  // Persist on change (debounced)
  const debouncedSetValue = useDebounce(value, 300);
  useEffect(() => {
    if (!loading) {
      storageService.scheduleWrite(key, debouncedSetValue);
      onChange?.(debouncedSetValue);
    }
  }, [debouncedSetValue, key, loading, onChange]);

  // Fetch from API when value changes
  const fetchWithValue = useCallback(
    async (newValue) => {
      if (fetchFn) {
        try {
          await fetchFn(newValue);
        } catch (error) {
          console.error('API fetch failed:', error);
        }
      }
    },
    [fetchFn]
  );

  useEffect(() => {
    if (!loading && fetchFn) {
      fetchWithValue(value);
    }
  }, [value, loading, fetchWithValue]);

  return [value, setValue, loading];
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// KEY lazy load
// ============================================================================

const LazyLoadSection = ({ children, name }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: '100px' }}>
      {isVisible ? children : <div>Loading {name}...</div>}
    </div>
  );
};

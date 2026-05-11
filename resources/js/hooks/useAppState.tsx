import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { devtools } from 'zustand/middleware';
import { useState, useEffect } from 'react';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

// Widget layout schema
const WidgetSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number().min(1).max(12),
  h: z.number().min(1),
  minW: z.number().optional(),
  minH: z.number().optional(),
});

// Dashboard configuration schema
const DashboardConfigSchema = z.object({
  layout: z.array(WidgetSchema).default([]),
  lastUpdated: z.string().optional(),
});

// User preferences schema
const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  notifications: z.boolean().default(true),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dashboardView: z.enum(['grid', 'list', 'compact']).default('grid'),
  autoRefresh: z.boolean().default(true),
  refreshInterval: z.number().min(10).max(3600).default(60),
});

// App state schema
const AppStateSchema = z.object({
  dashboard: DashboardConfigSchema,
  preferences: UserPreferencesSchema,
  sidebarOpen: z.boolean().default(true),
  activeTab: z.string().default('dashboard'),
  filters: z.record(z.any()).default({}),
});

// Type definitions
type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
type UserPreferences = z.infer<typeof UserPreferencesSchema>;
type AppState = z.infer<typeof AppStateSchema>;

// ============================================================================
// STORE DEFINITION
// ============================================================================

const DEFAULT_DASHBOARD_CONFIG = {
  layout: [
    { id: 'stats', x: 0, y: 0, w: 3, h: 2 },
    { id: 'members', x: 3, y: 0, w: 4, h: 2 },
    { id: 'reports', x: 7, y: 0, w: 5, h: 2 },
    { id: 'activities', x: 0, y: 2, w: 6, h: 3 },
    { id: 'notifications', x: 6, y: 2, w: 6, h: 3 },
  ],
};

const DEFAULT_PREFERENCES = {
  theme: 'light',
  notifications: true,
  language: 'en',
  timezone: 'UTC',
  dashboardView: 'grid',
  autoRefresh: true,
  refreshInterval: 60,
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

// Debounce hook to limit writes
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// MAIN STORE
// ============================================================================

const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Dashboard state
        dashboard: {
          ...DEFAULT_DASHBOARD_CONFIG,
          lastUpdated: new Date().toISOString(),
        },

        // User preferences
        preferences: { ...DEFAULT_PREFERENCES },

        // UI state
        sidebarOpen: true,
        activeTab: 'dashboard',
        filters: {},

        // Actions
        setDashboardConfig: (config) => {
          const validated = DashboardConfigSchema.parse(config);
          set({ dashboard: { ...validated, lastUpdated: new Date().toISOString() } });
        },

        setPreference: (key, value) => {
          const validated = UserPreferencesSchema.parse({ [key]: value });
          set((state) => ({
            preferences: { ...state.preferences, ...validated },
          }));
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },

        setFilters: (filters) => {
          set((state) => ({ filters: { ...state.filters, ...filters } }));
        },

        resetDashboard: () => {
          set({
            dashboard: { ...DEFAULT_DASHBOARD_CONFIG, lastUpdated: new Date().toISOString() },
            preferences: { ...DEFAULT_PREFERENCES },
          });
        },

        // Hydration helper: merge without overwriting
        hydrate: (storedState) => {
          try {
            // Validate entire state
            const parsed = AppStateSchema.parse(storedState);

            // Merge with defaults to fill missing fields
            set({
              dashboard: {
                ...DEFAULT_DASHBOARD_CONFIG,
                ...parsed.dashboard,
              },
              preferences: {
                ...DEFAULT_PREFERENCES,
                ...parsed.preferences,
              },
              sidebarOpen: parsed.sidebarOpen,
              activeTab: parsed.activeTab,
              filters: { ...DEFAULT_DASHBOARD_CONFIG.layout.reduce((acc, w) => ({ ...acc, [w.id]: {} }), {}), ...parsed.filters },
            });
            return true;
          } catch (error) {
            console.warn('Failed to hydrate state from localStorage:', error);
            // Reset to defaults on corrupted data
            set({
              dashboard: { ...DEFAULT_DASHBOARD_CONFIG, lastUpdated: new Date().toISOString() },
              preferences: { ...DEFAULT_PREFERENCES },
              sidebarOpen: true,
              activeTab: 'dashboard',
              filters: {},
            });
            return false;
          }
        },
      }),
      {
        name: 'him-app-state',
        partialize: (state) => ({
          dashboard: state.dashboard,
          preferences: state.preferences,
          sidebarOpen: state.sidebarOpen,
          activeTab: state.activeTab,
          filters: state.filters,
        }),
        version: 1,
      }
    )
  )
);

// ============================================================================
// STORAGE SERVICE WITH DEBOUNCE
// ============================================================================

class StateStorageService {
  constructor() {
    this.writeQueue = new Map();
    this.isProcessing = false;
    this.debounceTime = 300; // ms
  }

  // Debounced write to localStorage
  scheduleWrite(key, value) {
    clearTimeout(this.writeQueue.get(key));
    this.writeQueue.set(key, setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        this.writeQueue.delete(key);
      } catch (error) {
        console.error('Failed to write to localStorage:', error);
        // Handle quota exceeded
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing old data');
          this.clearOldData();
        }
      }
    }, this.debounceTime));
  }

  clearOldData() {
    // Keep only essential keys
    const keep = ['him_token', 'him_user', 'him-app-state'];
    Object.keys(window.localStorage).forEach((key) => {
      if (!keep.includes(key)) {
        window.localStorage.removeItem(key);
      }
    });
  }

  // Read with error handling
  read(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to read ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  // Remove specific key
  remove(key) {
    window.localStorage.removeItem(key);
  }

  // Clear all app state
  clearAll() {
    try {
      window.localStorage.removeItem('him-app-state');
    } catch (error) {
      console.error('Failed to clear app state:', error);
    }
  }
}

export const storageService = new StateStorageService();

// ============================================================================
// HYDRATION PROVIDER
// ============================================================================

export function StateHydrationProvider({ children }) {
  const hydrate = useAppStore((state) => state.hydrate);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = storageService.read('him-app-state');
    if (stored) {
      const success = hydrate(stored);
      if (success) {
        console.info('✅ State hydrated from localStorage');
      }
    }
    setIsHydrated(true);
  }, []); // hydrate should be stable from the store

  // Prevent rendering until hydration complete
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// CUSTOM HOOKS FOR APP STATE
// ============================================================================

export function useDashboardConfig() {
  const { dashboard, setDashboardConfig } = useAppStore();
  const debouncedDashboard = useDebounce(dashboard, 500);

  // Persist on change
  useEffect(() => {
    storageService.scheduleWrite('him-app-state', {
      dashboard: debouncedDashboard,
    });
  }, [debouncedDashboard]);

  return { dashboard, setDashboardConfig };
}

export function useUserPreferences() {
  const { preferences, setPreference } = useAppStore();
  const debouncedPrefs = useDebounce(preferences, 500);

  // Persist on change
  useEffect(() => {
    storageService.scheduleWrite('him-app-state', {
      preferences: debouncedPrefs,
    });
  }, [debouncedPrefs]);

  return { preferences, setPreference };
}

export function useUIState() {
  const store = useAppStore();

  return {
    sidebarOpen: store.sidebarOpen,
    toggleSidebar: store.toggleSidebar,
    activeTab: store.activeTab,
    setActiveTab: store.setActiveTab,
    filters: store.filters,
    setFilters: store.setFilters,
  };
}

export function useDashboardReset() {
  const resetDashboard = useAppStore((state) => state.resetDashboard);

  const handleReset = () => {
    storageService.clearAll();
    resetDashboard();
  };

  return { resetDashboard: handleReset };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useAppStore };
export type { DashboardConfig, UserPreferences, AppState };

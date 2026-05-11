import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { storageService } from './useAppState';

// Default widget configurations per role
const DEFAULT_WIDGETS = {
  pastor: [
    { id: 'zone-summary', x: 0, y: 0, w: 4, h: 2 },
    { id: 'recent-members', x: 4, y: 0, w: 4, h: 2 },
    { id: 'upcoming-events', x: 8, y: 0, w: 4, h: 2 },
    { id: 'attendance-chart', x: 0, y: 2, w: 8, h: 4 },
    { id: 'quick-actions', x: 8, y: 2, w: 4, h: 4 },
  ],
  hod: [
    { id: 'dept-metrics', x: 0, y: 0, w: 6, h: 2 },
    { id: 'membership-stats', x: 6, y: 0, w: 6, h: 2 },
    { id: 'pending-reports', x: 0, y: 2, w: 6, h: 3 },
    { id: 'recent-activities', x: 6, y: 2, w: 6, h: 3 },
  ],
  member: [
    { id: 'my-events', x: 0, y: 0, w: 6, h: 2 },
    { id: 'homegroup-info', x: 6, y: 0, w: 6, h: 2 },
    { id: 'recent-payments', x: 0, y: 2, w: 12, h: 3 },
  ],
};

const WIDGET_MIN_SIZES = {
  'zone-summary': { minW: 3, minH: 2 },
  'attendance-chart': { minW: 4, minH: 3 },
  // Default fallback
  'default': { minW: 2, minH: 2 },
};

// ============================================================================
// DASHBOARD STORE
// ============================================================================

export const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // Current user role
      userRole: 'pastor', // Will be set by context

      // Layout state per dashboard
      layouts: {
        pastor: DEFAULT_WIDGETS.pastor,
        hod: DEFAULT_WIDGETS.hod,
        member: DEFAULT_WIDGETS.member,
      },

      // Widget visibility (user can hide/show)
      hiddenWidgets: {
        pastor: [],
        hod: [],
        member: [],
      },

      // Drag/layout change in progress
      isDragging: false,

      // Actions
      setUserRole: (role) => {
        set({ userRole: role });
      },

      updateLayout: (role, newLayout) => {
        set((state) => ({
          layouts: {
            ...state.layouts,
            [role]: newLayout,
          },
        }));

        // Debounced persistence
        const current = get();
        storageService.scheduleWrite('him-dashboard-layouts', {
          layouts: {
            ...current.layouts,
            [role]: newLayout,
          },
        });
      },

      toggleWidget: (role, widgetId) => {
        set((state) => ({
          hiddenWidgets: {
            ...state.hiddenWidgets,
            [role]: state.hiddenWidgets[role].includes(widgetId)
              ? state.hiddenWidgets[role].filter((id) => id !== widgetId)
              : [...state.hiddenWidgets[role], widgetId],
          },
        }));

        // Debounced persistence
        const current = get();
        storageService.scheduleWrite('him-dashboard-visibility', {
          hiddenWidgets: {
            ...current.hiddenWidgets,
            [role]: current.hiddenWidgets[role].includes(widgetId)
              ? current.hiddenWidgets[role].filter((id) => id !== widgetId)
              : [...current.hiddenWidgets[role], widgetId],
          },
        });
      },

      setDragging: (isDragging) => {
        set({ isDragging });
      },

      // Hydration for layouts
      hydrate: () => {
        const storedLayouts = storageService.read('him-dashboard-layouts');
        const storedVisibility = storageService.read('him-dashboard-visibility');

        if (storedLayouts?.layouts) {
          set((state) => ({
            layouts: {
              ...DEFAULT_WIDGETS,
              ...storedLayouts.layouts,
            },
          }));
        }

        if (storedVisibility?.hiddenWidgets) {
          set((state) => ({
            hiddenWidgets: {
              ...DEFAULT_WIDGETS,
              ...storedVisibility.hiddenWidgets,
            },
          }));
        }
      },

      // Reset to defaults
      resetLayouts: () => {
        storageService.clearAll();
        set({
          layouts: { ...DEFAULT_WIDGETS },
          hiddenWidgets: { pastor: [], hod: [], member: [] },
        });
      },

      // Get visible widgets for current role
      getVisibleWidgets: (role) => {
        const state = get();
        return state.layouts[role]?.filter(
          (widget) => !state.hiddenWidgets[role]?.includes(widget.id)
        ) || [];
      },

      // Get widget min sizes
      getWidgetMinSize: (widgetId) => {
        return WIDGET_MIN_SIZES[widgetId] || WIDGET_MIN_SIZES.default;
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// ============================================================================
// DASHBOARD CONTEXT PROVIDER
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

const DashboardContext = createContext(null);

export function DashboardProvider({ children, initialRole = 'pastor' }) {
  const [mounted, setMounted] = useState(false);
  const store = useDashboardStore();

  // Hydrate on mount
  useEffect(() => {
    store.hydrate();
    store.setUserRole(initialRole);
    setMounted(true);
  }, []); // store and initialRole should be stable

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={store}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

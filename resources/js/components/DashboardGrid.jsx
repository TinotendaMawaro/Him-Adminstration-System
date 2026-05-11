import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore, useDashboardStore, useDashboard } from '../hooks/useDashboard.jsx';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

// Mock widget components
const WidgetMap = {
  'zone-summary': ({ onRefresh }) => (
    <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Zone Summary</h3>
      <p className="text-sm text-gray-600">You are pastoring 5 zones this quarter.</p>
      <button
        onClick={onRefresh}
        className="mt-3 px-3 py-1 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600"
      >
        Refresh
      </button>
    </div>
  ),
  'stats': ({ data }) => (
    <div className="p-4 bg-gradient-to-br from-gold-50 to-yellow-50 rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-2xl font-bold text-gold-600">248</p>
          <p className="text-xs text-gray-500">Members</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gold-600">12</p>
          <p className="text-xs text-gray-500">Homegroups</p>
        </div>
      </div>
    </div>
  ),
  'members': ({ onViewMembers }) => (
    <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Members</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span>John Doe</span>
          <span className="text-emerald-600">Active</span>
        </li>
        <li className="flex justify-between">
          <span>Jane Smith</span>
          <span className="text-emerald-600">Active</span>
        </li>
      </ul>
      <button
        onClick={onViewMembers}
        className="mt-3 w-full px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
      >
        View All Members
      </button>
    </div>
  ),
  'default': ({ id }) => (
    <div className="p-4 bg-gray-50 rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 capitalize">{id.replace('-', ' ')}</h3>
      <p className="text-sm text-gray-600 mt-2">Widget content goes here</p>
    </div>
  ),
};

// ============================================================================
// WIDGET COMPONENT WITH DRAG HANDLE
// ============================================================================

const DashboardWidget = ({ widget, onRemove, onConfigure, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow"
      style={{ height: '100%' }}
    >
      {/* Widget Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold-400" />
          <h4 className="text-sm font-semibold text-gray-700 capitalize">
            {widget.id.replace('-', ' ')}
          </h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Toggle Expand"
          >
            {isExpanded ? '➖' : '➕'}
          </button>
          <button
            onClick={() => onRemove?.(widget.id)}
            className="p-1 hover:bg-red-100 text-red-500 rounded"
            title="Remove Widget"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className={`p-4 ${isExpanded ? 'h-[400px] overflow-auto' : 'h-full'}`}>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export function DashboardGrid({ onWidgetClick, onRefresh }) {
  const { userRole } = useDashboardStore();
  const layouts = useDashboardStore((state) => state.layouts);
  const updateLayout = useDashboardStore((state) => state.updateLayout);
  const toggleWidget = useDashboardStore((state) => state.toggleWidget);
  const hiddenWidgets = useDashboardStore((state) => state.hiddenWidgets);
  const getVisibleWidgets = useDashboardStore((state) => state.getVisibleWidgets);

  const currentLayout = layouts[userRole] || [];
  const visibleWidgets = getVisibleWidgets(userRole);

  // Handle layout change with debounce
  const handleLayoutChange = useCallback(
    (newLayout) => {
      updateLayout(userRole, newLayout);
    },
    [userRole, updateLayout]
  );

  // Load widget data (extract)
  const loadWidgetData = (widgetId) => {
    // Integration point: fetch data from API based on widgetId and user filters
    console.log(`Loading data for widget: ${widgetId}`);
    // Example: fetch(`/api/dashboard/widget/${widgetId}?role=${userRole}`)
  };

  // Initialize widget data on mount and when layout changes
  useEffect(() => {
    visibleWidgets.forEach((widget) => {
      loadWidgetData(widget.id);
    });
  }, [visibleWidgets]);

  return (
    <div className="p-6">
      {/* Widget Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">
          {userRole} Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWidget(userRole, 'zone-summary')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Toggle Zone Summary
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-gold-500 text-white hover:bg-gold-600 rounded-lg"
          >
            Refresh All
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <GridLayout
        className="grid-layout"
        layout={currentLayout}
        cols={12}
        rowHeight={80}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        preventCollision={false}
        isResizable={true}
        isDraggable={true}
      >
        {currentLayout.map((widget) => {
          const WidgetComponent = WidgetMap[widget.id] || WidgetMap.default;
          return (
            <div key={widget.id} className="widget-container">
              <DashboardWidget
                widget={widget}
                onRemove={(id) => toggleWidget(userRole, id)}
                onConfigure={(id) => onWidgetClick?.(id)}
              >
                <WidgetComponent
                  id={widget.id}
                  onRefresh={() => loadWidgetData(widget.id)}
                  onViewMembers={() => console.log('Navigate to members')}
                />
              </DashboardWidget>
            </div>
          );
        })}
      </GridLayout>

      {/* Widget Picker (sidebar) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Available Widgets</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(WidgetMap).map((widgetId) => {
            const isHidden = hiddenWidgets[userRole]?.includes(widgetId);
            return (
              <button
                key={widgetId}
                onClick={() => toggleWidget(userRole, widgetId)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  isHidden
                    ? 'bg-white text-gray-400 border-gray-200 hover:border-gold-300'
                    : 'bg-gold-50 text-gold-700 border-gold-200 hover:bg-gold-100'
                }`}
              >
                {widgetId.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardGrid;

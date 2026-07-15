# Smart Events Module — Technical Design Specification & UI/UX Framework

## Document Overview

| Field | Value |
|-------|-------|
| **Project** | Heartfelt International Ministries (HIM) Member Portal |
| **Module** | Smart Events Module |
| **Version** | 1.0 |
| **Status** | Draft — Technical Design Specification |
| **Tech Stack** | React 18, Tailwind CSS 3, @tanstack/react-query, axios, Laravel 10+ API |
| **Design Language** | Premium Dark Theme (#0A192F), Gold Accent (#dfb15b), Glass Morphism, Figtree Sans |

---

## Table of Contents

1. [Design System Foundations](#1-design-system-foundations)
2. [Dashboard & Header Analytics](#2-dashboard--header-analytics)
3. [Smart Filtering & Categorization](#3-smart-filtering--categorization)
4. [Featured Event Hero (High Priority)](#4-featured-event-hero-high-priority)
5. [Event Discovery & Timeline](#5-event-discovery--timeline)
6. [Personalization & Registration Management](#6-personalization--registration-management)
7. [Livestream Integration (Live Mode)](#7-livestream-integration-live-mode)
8. [Multi-View Calendar System](#8-multi-view-calendar-system)
9. [AI-Driven Intelligence & Notifications](#9-ai-driven-intelligence--notifications)
10. [Component Architecture & File Structure](#10-component-architecture--file-structure)
11. [API Contracts & Data Models](#11-api-contracts--data-models)
12. [State Management & Logic Flows](#12-state-management--logic-flows)
13. [Accessibility, Performance & Responsiveness](#13-accessibility-performance--responsiveness)
14. [Implementation Roadmap](#14-implementation-roadmap)


---

## 1. Design System Foundations

### 1.1 Color Palette & Tokens

The Smart Events Module adheres to the existing premium dark-theme design language of the HIM Member Portal.

**Primary Backgrounds**
- `bg-[#0A192F]` — Page root background (deep navy)
- `bg-[#112240]` — Card background (slightly lighter navy)
- `bg-white/5` — Glass morphism base layer
- `bg-white/10` — Elevated glass layer
- `bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D]` — Hero gradients

**Accent Colors**
- `#dfb15b` — Primary gold (premium, spiritual, celebratory)
- `#f59e0b` — Amber (hover states, highlights)
- `#0EA5E9` — Sky blue (trust, calm, information)
- `#22c55e` — Emerald (success, confirmed, active)
- `#ef4444` / `#e11d48` — Rose (errors, live indicators, cancellations)
- `#8b5cf6` — Violet (events tab identity, spiritual)

**Event-Specific Semantic Colors**
- `bg-[#d4af37]/10 text-[#d4af37]` — International / Featured event badge
- `bg-emerald-50 text-emerald-600` — Upcoming status
- `bg-rose-50 text-rose-600` — Live / Active status
- `bg-gray-100 text-gray-600` — Past / Completed status
- `bg-sky-50 text-sky-700` — Category badge (prayer, training, etc.)

**Text Hierarchy**
- `text-white` — Primary headings, hero text
- `text-gray-300` — Secondary text, subtitles
- `text-gray-400` — Tertiary text, metadata, timestamps
- `text-[#d4af37]` — Gold accent text, brand moments
- `text-[9px] text-gray-500` — Microcopy, labels, captions

### 1.2 Typography

| Role | Class | Notes |
|------|-------|-------|
| Hero / Page Title | `text-xl md:text-2xl font-bold text-white tracking-tight` | Used for section headers |
| Card Title | `text-lg font-bold text-white` | Event names, card headings |
| Body | `text-sm text-gray-300` | Descriptions, event details |
| Metadata | `text-[10px] text-gray-400` | Dates, venues, hosts |
| Label / Chip | `text-[10px] font-semibold uppercase tracking-wider` | Badges, category pills |
| Button | `text-xs font-semibold` | Primary and secondary actions |

**Font Family:** `fontFamily.sans = ['Figtree', ...defaultTheme.fontFamily.sans]` (defined in `tailwind.config.js`)

### 1.3 Spacing & Layout

- **Card padding:** `p-5 sm:p-6` (standard), `p-3` (compact timeline)
- **Grid gaps:** `gap-3` (tight), `gap-4` (standard), `gap-6` (loose)
- **Border radius:** `rounded-2xl` (cards), `rounded-xl` (buttons, inputs), `rounded-3xl` (hero banners), `rounded-full` (chips/badges)
- **Section spacing:** `space-y-4` (standard vertical rhythm)
- **Container:** `max-w-7xl mx-auto px-4` (page wrapper)

### 1.4 Glass Morphism & Elevation

The portal uses a consistent glass-morphism vocabulary. The Smart Events Module inherits and extends this.

**Core Card: `.lux-card`**
```css
.lux-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025));
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 22px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.4s ease,
              border-color 0.4s ease;
}
```

**Gradient Border (`.gradient-border`)**
```css
.gradient-border {
  position: relative;
  background: rgba(255,255,255,0.05);
  border-radius: 14px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 15px;
  background: linear-gradient(135deg, #dfb15b, #0ea5e9, #dfb15b);
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.gradient-border:hover::before { opacity: 0.3; }
```

**Card Hover (`.card-hover`)**
```css
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.3),
              0 0 0 1px rgba(212,175,55,0.2);
}
```

**Premium Card (`.premium-card`)** — Used for stats dashboard
```css
.premium-card {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025));
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 22px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 1.5 Animation Tokens

| Animation | Class | Duration | Use Case |
|-----------|-------|----------|----------|
| Fade In Up | `animate-[fade-in-up_0.5s_ease-out_forwards]` | 500ms | Card entrance |
| Fade In Scale | `animate-[fade-in-scale_0.3s_ease-out_forwards]` | 300ms | Modal entry |
| Gentle Pulse | `animate-gentle-pulse` | 2s infinite | Live indicator |
| Float | `animate-float` | 3s ease-in-out infinite | Decorative elements |
| Shimmer | `animate-shimmer` | 2s linear infinite | Loading skeletons |
| Luxury Rise | `lux-rise` | 600ms cubic-bezier | Staggered card reveals |
| Gradient Shift | `gradient-shift` | 4s ease infinite | Border glow animation |

### 1.6 Iconography System

All icons use the Heroicons `outline` style, rendered as inline SVGs with `strokeWidth={1.5}` (thin stroke) or `strokeWidth={2}` (medium stroke). Icons are defined as React components in `MembersPortal.jsx` under the `Icons` namespace.

**Events Module Required Icons:**
- `Calendar` — Event identity, date display
- `Clock` — Time, countdown
- `MapPin` — Venue, location
- `Users` — Attendance, demographics
- `Bell` — Notifications, reminders
- `Share` — Social sharing, QR
- `DocumentDownload` — Download ticket
- `Play` — Livestream, video
- `Heart` — Partnership, engagement
- `Star` — Featured, recommended
- `Check` — Confirmed, registered
- `XMark` — Cancel, close
- `ChevronDown` — Filter dropdowns
- `QRCode` — Digital ticket
- `PlayCircle` — Watch live
- `ShareNodes` — Share event
- `ArrowTopRightOnSquare` — External link (YouTube)
- `Ticket` — Registration pass
- `FingerPrint` — QR check-in
- `Sparkles` — AI recommendations

---

## 2. Dashboard & Header Analytics

### 2.1 Layout Structure

The Events tab lives within the main MembersPortal tab system (`activeTab === "events"`). It is a full-page replacement of the current basic EventsTab, sitting inside the existing `max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8` container.

```
Events Page Container
├── EventsHeaderAnalytics (Hero + Stats)
├── EventsFilterBar (Smart Filters)
├── FeaturedEventBanner (if featured event exists)
├── EventsTimeline (Upcoming + Past)
├── MyRegisteredEvents (Digital Wallet)
├── LiveEventModal / InlinePlayer (when event is live)
└── EventCalendarView (toggleable)
```

### 2.2 Hero Text & Scriptural Anchor

**Component:** `EventsHeaderAnalytics`

**Visual Design:**
- Full-width glass-morphism card with subtle gold gradient border
- Background: `bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D]`
- Decorative radial glows (gold top-right, sky-blue bottom-left) using `absolute` positioned `div`s with `blur-3xl`
- Padding: `p-6 md:p-8`

**Content Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  [Decorative Radial Glow: #dfb15b/10]                  │
│                                                         │
│  📅 Events: Stay connected with everything happening    │
│     across Heartfelt International Ministries.           │
│                                                         │
│  "My Times & Seasons."                                  │
│  — Scriptural anchor, italic, text-gray-400             │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ This     │ │ Next     │ │ This     │ │ My       │  │
│  │ Month    │ │ Event In │ │ Month    │ │ Events   │  │
│  │ View     │ │ ...      │ │ Total    │ │ Today:   │  │
│  │ [12]     │ │ [3d 14h] │ │ [12]     │ │ [2]      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Registered: 3  •  Attended: 8  •  Livestreams Today: 1│
└─────────────────────────────────────────────────────────┘
```

**Code Pattern:**
```jsx
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10">
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
  
  <div className="relative p-6 md:p-8 space-y-6">
    <div>
      <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-[0.2em] mb-1">Events Hub</p>
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
        📅 Events: Stay connected with everything happening across Heartfelt International Ministries.
      </h2>
      <p className="text-sm text-gray-400 italic mt-2 font-serif">
        "My Times & Seasons."
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="This Month" value="12" icon={<Icons.Calendar />} />
      <StatCard label="Next Event In" value="3d 14h" icon={<Icons.Clock />} />
      <StatCard label="Total This Month" value="12" icon={<Icons.Calendar />} />
      <StatCard label="Livestreams Today" value="1" icon={<Icons.PlayCircle />} link="https://youtube.com/@HIM" />
    </div>

    <div className="flex flex-wrap items-center gap-4 pt-2">
      <span className="text-xs text-gray-400">
        Registered: <span className="text-white font-semibold">3</span>
      </span>
      <span className="text-xs text-gray-400">
        Attended: <span className="text-white font-semibold">8</span>
      </span>
      <a href="https://youtube.com/@HIM" target="_blank" rel="noopener" className="text-xs text-[#d4af37] hover:text-amber-400 font-semibold flex items-center gap-1">
        Livestreams available today <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</div>
```

### 2.3 Dynamic Stats Dashboard

**Component:** `EventsHeaderStats`

**Stat Card Design:**
Each stat is a mini glass card with:
- Icon: `w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#d4af37]`
- Label: `text-[10px] text-gray-400 font-medium uppercase`
- Value: `text-lg font-bold text-white tabular-nums`
- Optional link action: `text-[#d4af37] text-[10px] hover:text-amber-400`

**Countdown Logic (Next Event In):**
- Calculate `starts_at` of next upcoming published event
- Format as `Xd Yh Zm` (days, hours, minutes)
- Auto-refresh every minute via `setInterval`
- If no upcoming event, display `"—"` or `"No upcoming events"`

**Real-time Counters:**
- **This Month View:** Filter events where `starts_at` is within current month. Display count.
- **Countdown to Next Major Event:** Identify next event with `is_featured = true` or `category = 'International'`. Show countdown.
- **Total Events Scheduled This Month:** Same as "This Month View" count.
- **Personal Metrics:**
  - Registered: `EventRegistration::where('user_id', auth()->id())->where('status', 'confirmed')->count()`
  - Attended: `EventRegistration::where('user_id', auth()->id())->where('attended', true)->count()`
  - Livestreams Today: Count events where `starts_at` is today AND `is_livestream = true` (or `type = 'online_event'` / `livestream_url` present)

### 2.4 Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `sm` (640px) | Stats grid 2 columns |
| `md` (768px) | Stats grid 4 columns, full hero text |
| `lg` (1024px) | Max width constrained at `max-w-7xl` |
| Mobile | Stack vertically, reduced padding `p-4` |

---

## 3. Smart Filtering & Categorization

### 3.1 Layout Structure

**Component:** `EventsFilterBar`

The filter bar is a horizontal, scrollable row of pill-shaped toggle buttons. It sits below the hero header and above the timeline.

```
EventsFilterBar
├── DemographicsFilterGroup
│   ├── Youth
│   ├── Women on Fire
│   ├── Men on Fire
│   ├── Marketplace Fellowship
│   ├── Children
│   ├── Singles
│   ├── Marriage
│   └── Pastors
└── CalendarViewToggle
    ├── List
    ├── Monthly
    ├── Weekly
    ├── Agenda
    └── Timeline
```

### 3.2 Visual Design

**Container:** `flex flex-wrap items-center gap-2 py-3`

**Filter Group Label:** `text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1` (hidden on mobile, shown on `md:`)

**Filter Pill (Inactive):**
```jsx
<button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/5 text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-gray-200 transition-all">
  Prayer
</button>
```

**Filter Pill (Active):**
```jsx
<button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/25 hover:bg-[#d4af37]/15 transition-all">
  Prayer
</button>
```

**Group Divider:** `w-px h-5 bg-white/10 mx-2 hidden md:block`

### 3.3 State Management

```jsx
const [filters, setFilters] = useState({
  scope: 'all', // all | international | regional | zone | homegroup | department
  demographics: [], // array of selected demographics
  eventType: [], // array of selected event types
  view: 'list', // list | monthly | weekly | agenda | timeline
});
```

**Multi-select Logic:**
- `demographics` and `eventType` support multi-select
- Clicking an active pill removes it from the array
- Clicking an inactive pill adds it to the array
- `scope` is single-select

**API Query Construction:**
```jsx
const queryParams = useMemo(() => {
  const params = new URLSearchParams();
  if (filters.scope !== 'all') params.append('scope', filters.scope);
  if (filters.demographics.length) params.append('demographics', filters.demographics.join(','));
  if (filters.eventType.length) params.append('event_type', filters.eventType.join(','));
  if (filters.view === 'upcoming') params.append('upcoming', 'true');
  return params.toString();
}, [filters]);
```

**React Query Key:**
```jsx
useQuery({
  queryKey: ['events', filters],
  queryFn: () => api.get(`/events?${queryParams}`).then(r => r.data.data),
})
```

### 3.4 Accessibility

- Filter pills use `aria-pressed="true/false"`
- Active pills have `aria-label` with context: `"Filter: Prayer (active)"`
- Keyboard navigation: pills in a `role="group"` with `aria-label="Event filters"`
- Mobile: horizontal scroll with `overflow-x-auto` and `scrollbar-hide`

---

## 4. Featured Event Hero (High Priority)

### 4.1 Visual Design

**Component:** `FeaturedEventBanner`

The featured banner is a high-impact, full-width hero section that appears at the top of the events timeline when a featured event exists.

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [Background: Event poster image with dark overlay gradient]       │
│                                                                   │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  🔥 FEATURED EVENT                                        │   │
│   │                                                           │   │
│   │  Catch The Fire Conference                                │   │
│   │  "Igniting a Generation"                                  │   │
│   │                                                           │   │
│   │  Hosts: Apostle Tavonga Vutabwashe & Pastor Chipo         │   │
│   │  Venue: International Outreach Centre, Harare             │   │
│   │                                                           │   │
│   │  ┌─────────────────────────────────────────────────────┐  │   │
│   │  │  Countdown Timer                                    │  │   │
│   │  │  14 Days | 06 Hours | 23 Minutes                    │  │   │
│   │  └─────────────────────────────────────────────────────┘  │   │
│   │                                                           │   │
│   │  [Register Now] [Add Reminder] [Share] [View Details]     │   │
│   │                                                           │   │
│   │  👥 2,847 people registered                              │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Event `banner_image` or `image` URL, with `bg-cover bg-center`
- Overlay: `bg-gradient-to-t from-[#0A192F] via-[#0A192F]/80 to-transparent` (ensures text readability)
- Border: `border border-white/10 rounded-3xl`
- Max height: `max-h-[400px] md:max-h-[500px]`
- Inner padding: `p-6 md:p-8`

### 4.2 Countdown Timer

**Component:** `EventCountdown`

**Logic:**
```jsx
function EventCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [targetDate]);
  
  if (timeLeft.total <= 0) {
    return <span className="text-emerald-400 font-bold">Event is happening now!</span>;
  }
  
  return (
    <div className="flex items-center gap-4">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
      ].map((unit, i) => (
        <div key={unit.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">{unit.label}</div>
          {i < 2 && <div className="text-[#d4af37] text-xl font-light mx-1">:</div>}
        </div>
      ))}
    </div>
  );
}
```

### 4.3 Social Proof

**Component:** `EventSocialProof`

Display registration count with animated counter:
```jsx
<div className="flex items-center gap-2 mt-4">
  <div className="flex -space-x-2">
    {[1,2,3].map(i => (
      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-amber-600 border-2 border-[#0A192F] flex items-center justify-center text-[8px] text-white font-bold">
        {String.fromCharCode(64 + i)}
      </div>
    ))}
  </div>
  <span className="text-xs text-gray-300">
    <span className="text-white font-semibold">{registrationCount.toLocaleString()}</span> people registered
  </span>
</div>
```

### 4.4 Action Buttons

| Button | Class | Icon |
|--------|-------|------|
| Register | `bg-gradient-to-r from-[#d4af37] to-amber-600 text-white shadow-lg shadow-[#d4af37]/20 hover:from-[#d4af37] hover:to-amber-500` | `Icons.Check` |
| Add Reminder | `bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10` | `Icons.Bell` |
| Share | `bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10` | `Icons.Share` |
| View Details | `bg-white/5 ring-1 ring-white/10 text-gray-200 hover:bg-white/10` | `Icons.ArrowTopRightOnSquare` |

### 4.5 API Integration

**Endpoint:** `GET /api/events/featured`
Returns the single highest-priority upcoming event with:
- `banner_image`
- `title`, `description`, `theme`
- `hosts` (JSON or relationship)
- `venue_name`, `venue_address`
- `starts_at`, `ends_at`
- `registration_count`
- `is_registered` (current user)
- `is_full`

---

## 5. Event Discovery & Timeline

### 5.1 Layout Architecture

**Component:** `EventsTimeline`

The timeline replaces the current basic list. It supports two sub-views:
1. **Chronological List** (default) — Vertical card stack
2. **Calendar Grid** (toggle) — Monthly/weekly calendar

```
EventsTimeline
├── TimelineHeader
│   ├── "Upcoming Events" title + count
│   └── SortToggle (Date: Newest First | Oldest First)
├── TimelineList
│   ├── TimelineGroup "Today"
│   │   ├── EventCard
│   │   └── EventCard
│   ├── TimelineGroup "Tomorrow"
│   │   └── EventCard
│   ├── TimelineGroup "This Week"
│   │   ├── EventCard
│   │   └── EventCard
│   └── TimelineGroup "Next Week"
│       └── EventCard
└── TimelinePagination / LoadMore
```

### 5.2 Event Card (Enhanced)

**Component:** `SmartEventCard`

**Visual Design (Horizontal Layout):**
```
┌────────────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                                     │
│  │          │  Category Badge: [International]                    │
│  │  Event   │  Event Title (bold, white)                          │
│  │  Poster  │  📅 Mon, Jan 15, 2026 • 9:00 AM                   │
│  │  Image   │  📍 IOC Harare                                      │
│  │  120x120 │  👤 Hosted by Pastor John                           │
│  │          │  Description text (line-clamp-2)                    │
│  └──────────┘                                                     │
│                                                                   │
│  Status: [Upcoming]                                               │
│                                                                   │
│  [Register] [Details] [Calendar] [Share] [Directions] [Watch]    │
└────────────────────────────────────────────────────────────────────┘
```

**Code Structure:**
```jsx
<div className="group relative lux-card lux-rise" style={{ animationDelay: "100ms" }}>
  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
    {/* Event Poster */}
    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-100/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      ) : (
        <Icons.Calendar className="w-8 h-8 text-sky-400" />
      )}
    </div>
    
    {/* Event Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium ${
            event.category === 'International' ? 'bg-[#d4af37]/10 text-[#d4af37]' :
            event.category === 'Prayer' ? 'bg-sky-50 text-sky-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {event.category || 'General'}
          </span>
          <h3 className="text-base font-bold text-white mt-2 truncate">{event.title}</h3>
        </div>
        <StatusBadge status={event.status} />
      </div>
      
      <div className="mt-3 space-y-1.5">
        <p className="flex items-center gap-2 text-xs text-gray-400">
          <Icons.Calendar className="w-3.5 h-3.5" />
          {formatEventDate(event.starts_at, event.ends_at)}
        </p>
        {event.venue_name && (
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <Icons.MapPin className="w-3.5 h-3.5" />
            {event.venue_name}
          </p>
        )}
        {event.host && (
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <Icons.User className="w-3.5 h-3.5" />
            {event.host}
          </p>
        )}
        {event.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  </div>
  
  {/* Actions Bar */}
  <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex flex-wrap items-center gap-2">
    {!event.is_past && event.registration_open && !isRegistered && (
      <button onClick={() => handleRegister(event.id)} className="lux-btn px-4 py-1.5 text-xs bg-gradient-to-r from-[#d4af37] to-amber-600 text-white">
        Register
      </button>
    )}
    {isRegistered && (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
        <Icons.Check className="w-3.5 h-3.5" /> Registered
      </span>
    )}
    <button className="text-[10px] text-[#d4af37] hover:text-amber-400 font-semibold px-2 py-1">Details</button>
    <button className="text-[10px] text-gray-400 hover:text-gray-200 font-semibold px-2 py-1 flex items-center gap-1">
      <Icons.Calendar className="w-3 h-3" /> Calendar
    </button>
    <button className="text-[10px] text-gray-400 hover:text-gray-200 font-semibold px-2 py-1 flex items-center gap-1">
      <Icons.Share className="w-3 h-3" /> Share
    </button>
    {event.venue_address && (
      <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venue_address)}`} target="_blank" rel="noopener" className="text-[10px] text-gray-400 hover:text-gray-200 font-semibold px-2 py-1 flex items-center gap-1">
        <Icons.MapPin className="w-3 h-3" /> Directions
      </a>
    )}
    {event.is_livestream && (
      <a href={event.livestream_url} target="_blank" rel="noopener" className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-gentle-pulse" /> Watch Live
      </a>
    )}
  </div>
</div>
```

### 5.3 Status Indicators

**Component:** `StatusBadge`

| Status | Class | Icon |
|--------|-------|------|
| Upcoming | `bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20` | `Icons.Clock` |
| Live | `bg-rose-50 text-rose-600 ring-1 ring-rose-500/20` + pulse | `w-2 h-2 rounded-full bg-rose-500 animate-gentle-pulse` |
| Completed | `bg-gray-100 text-gray-600 ring-1 ring-gray-500/20` | `Icons.Check` |
| Cancelled | `bg-red-50 text-red-600 ring-1 ring-red-500/20` | `Icons.XMark` |

### 5.4 Chronological Grouping

Events are grouped by relative time:
- **Today** — `starts_at` is today
- **Tomorrow** — `starts_at` is tomorrow
- **This Week** — `starts_at` is within current week (Sun-Sat)
- **Next Week** — `starts_at` is within next week
- **Later This Month** — remaining events in current month
- **Next Month** — events in following month

**Group Header Design:**
```jsx
<div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">Today</h3>
  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
</div>
```

---

## 6. Personalization & Registration Management

### 6.1 My Registered Events Section

**Component:** `MyRegisteredEvents`

This section acts as the user's digital wallet/ticket hub.

**Layout:**
```
MyRegistered Events
├── Empty State (if no registrations)
│   └── "You haven't registered for any events yet."
│       [Browse Events]
└── Registration Cards Grid
    └── RegistrationCard
        ├── Digital Ticket (QR Code)
        ├── Event Info
        ├── Attendance Status
        └── Actions
```

### 6.2 Digital Ticket Design

**Component:** `RegistrationTicket`

```
┌─────────────────────────────────────────┐
│  [QR Code — 120x120]                    │
│                                         │
│  Registration #: HIM-2026-001234        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Catch The Fire Conference        │  │
│  │  Jan 15, 2026 • 9:00 AM          │  │
│  │  IOC Harare                       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Status: [Confirmed]                    │
│  Attendance: [Not Checked In]           │
│                                         │
│  [Download PDF] [Download Image]        │
│  [Cancel Registration] [View Details]   │
└─────────────────────────────────────────┘
```

**QR Code Generation:**
- Use a lightweight library (e.g., `qrcode.react` or server-generated)
- QR encodes: `https://him.org/events/{eventId}/checkin?reg={registrationNumber}`
- Styled with gold accent border: `border-2 border-[#d4af37] rounded-2xl p-2`

**Ticket Card Styling:**
```jsx
<div className="lux-card p-5">
  <div className="flex flex-col sm:flex-row gap-5">
    <div className="flex flex-col items-center">
      <QRCodeSVG value={qrData} size={120} bgColor="#0A192F" fgColor="#dfb15b" />
      <p className="text-[9px] text-gray-500 mt-2 font-mono">HIM-2026-{registration.id}</p>
    </div>
    <div className="flex-1">
      <h4 className="text-base font-bold text-white">{event.title}</h4>
      <p className="text-xs text-gray-400 mt-1">{formatDate(event.starts_at)} • {event.venue_name}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="lux-chip bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Confirmed
        </span>
        <span className="lux-chip bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/25">
          {registration.attended ? 'Checked In' : 'Not Checked In'}
        </span>
      </div>
    </div>
  </div>
  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/5">
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.DocumentDownload className="w-3 h-3" /> PDF
    </button>
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.DocumentDownload className="w-3 h-3" /> Image
    </button>
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-rose-500/10 ring-1 ring-rose-500/25 text-rose-300 hover:bg-rose-500/15">
      Cancel Registration
    </button>
  </div>
</div>
```

### 6.3 Registration Workflow Modal

**Component:** `RegistrationModal`

```
┌────────────────────────────────────────────────────────────────────┐
│  Register for Event                                                │
│  ─────────────────────────────────────────────────────────────── │
│                                                                    │
│  Event: Catch The Fire Conference                                  │
│  Date: Jan 15, 2026 • 9:00 AM                                     │
│                                                                    │
│  Select Attendance Type:                                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  ○ Physical Attendance                                    │    │
│  │    International Outreach Centre, Harare                  │    │
│  │    2,500 capacity • 2,847 registered (FULL)              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  ○ Online Attendance                                      │    │
│  │    Livestream via YouTube                                 │    │
│  │    Link sent after registration                           │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  [Cancel]                                        [Confirm]        │
└────────────────────────────────────────────────────────────────────┘
```

**Form Logic:**
- `attendance_type`: `physical` | `online`
- If `physical`: show venue details, capacity indicator, overflow status
- If `online`: show livestream info, link delivery method
- On confirm: `POST /api/events/{id}/register` with `{ attendance_type: 'physical' }`
- On success: refetch events, update local state, show success toast

### 6.4 Check-In Logic

**QR Check-In Flow:**
1. User opens digital ticket (QR code)
2. Church staff scans QR at entrance
3. Scanner POSTs to `/api/events/{id}/checkin?reg={registrationNumber}`
4. API validates registration, marks `attended = true`, `checked_in_at = now()`
5. Frontend shows live update: "Checked In" badge

**User-Side Check-In:**
- User can manually check in if they have the QR scanned by another system
- `POST /api/events/{id}/checkin` with `registration_id`

---

## 7. Livestream Integration (Live Mode)

### 7.1 Live State Detection

**Logic:**
```jsx
const isEventLive = useMemo(() => {
  if (!event) return false;
  const now = new Date();
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  return now >= start && (!end || now <= end);
}, [event]);
```

**Auto-Detection:**
- Poll event status every 30 seconds during event window
- When `isEventLive` transitions from `false` to `true`, trigger inline player

### 7.2 Inline Livestream Player

**Component:** `InlineLivePlayer`

**Visual Design:**
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │              YouTube Embed Player                         │   │
│  │              (16:9 aspect ratio)                          │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │ 🔴 LIVE NOW                    👁 1,247 watching   │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Prayer Request] [Give] [Watch Later] [Share Stream]            │
│                                                                   │
└────────────────────────────────────────────────────────────────────┘
```

**Styling:**
```jsx
<div className="lux-card overflow-hidden">
  <div className="relative pt-[56.25%] bg-black">
    <iframe
      src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&live=1`}
      className="absolute inset-0 w-full h-full"
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
    {/* Live badge overlay */}
    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-gentle-pulse" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">Live Now</span>
    </div>
    {/* Viewer count overlay */}
    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
      <Icons.Users className="w-3.5 h-3.5 text-white" />
      <span className="text-xs font-bold text-white">{viewerCount}</span>
    </div>
  </div>
  
  {/* Engagement Tools */}
  <div className="p-4 flex flex-wrap items-center gap-2">
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.HandsPraying className="w-3 h-3" /> Prayer Request
    </button>
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.Heart className="w-3 h-3" /> Give
    </button>
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.Clock className="w-3 h-3" /> Watch Later
    </button>
    <button className="lux-btn px-3 py-1.5 text-[10px] bg-white/5 ring-1 ring-white/10 text-gray-200">
      <Icons.Share className="w-3 h-3" /> Share Stream
    </button>
  </div>
</div>
```

### 7.3 Engagement Tools

**Prayer Request Submission:**
- Inline form or drawer: `PrayerRequestForm`
- Fields: `name`, `prayer_request` (textarea)
- On submit: `POST /api/events/{id}/prayer-request`
- Success: toast notification, prayer count update

**Offering/Tithing Portal:**
- Button opens `PaymentModal` linked to existing partnership/giving flow
- Preselects event context: `event_id`, `amount`
- Uses existing payment infrastructure (Paystack/Stripe)

**Watch Later:**
- Saves event reference to user's "Watch Later" list
- `POST /api/events/{id}/watch-later`
- Stored in `UserPreference` or dedicated `WatchLater` model

**Stream Sharing:**
- Native Web Share API or clipboard copy
- Copy link: `https://him.org/events/{id}/live`
- Share text: "Join me watching [Event Name] live on HIM!"

### 7.4 Polling & State Management

```jsx
const [liveState, setLiveState] = useState({ isLive: false, viewerCount: 0 });

useEffect(() => {
  if (!event) return;
  
  const checkLive = async () => {
    const res = await api.get(`/events/${event.id}/live-status`);
    setLiveState({
      isLive: res.data.is_live,
      viewerCount: res.data.viewer_count,
    });
  };
  
  checkLive();
  const interval = setInterval(checkLive, 30000);
  return () => clearInterval(interval);
}, [event?.id]);
```

---

## 8. Multi-View Calendar System

### 8.1 View Toggle

**Component:** `CalendarViewToggle`

Located in the `EventsFilterBar`, the last group of controls switches between timeline and calendar views.

```
[List] [Monthly] [Weekly] [Agenda] [Timeline]
```

**Visual Design:**
- Segmented control style with `bg-white/5` background
- Active view: `bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/25`
- Inactive: `text-gray-400 hover:text-gray-200`
- Container: `flex items-center bg-white/5 rounded-xl p-1`

### 8.2 List View (Default)

**Description:** Vertical chronological card stack (described in Section 5). Groups events by Today, Tomorrow, This Week, etc.

### 8.3 Monthly View

**Component:** `CalendarMonth`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  ◀ January 2026 ▶                                   │
│                                                     │
│  Mon   Tue   Wed   Thu   Fri   Sat   Sun            │
│  ────   ────   ────   ────   ────   ────   ────     │
│        1      2      3      4      5      6          │
│   7      8      9     10     11     12     13         │
│  14     15  [16]  17     18     19     20             │
│  21     22     23     24     25     26     27         │
│  28     29     30     31                             │
│                                                     │
│  Legend:                                             │
│  ● Today's Events    ● My Registered Events         │
│  ● International Events   ● Zone Events             │
└─────────────────────────────────────────────────────┘
```

**Event Dot Indicators:**
- Single event: small dot `w-1.5 h-1.5 rounded-full`
- Multiple events: stacked dots or number badge
- Colors:
  - Today's events: `bg-[#d4af37]` (gold)
  - My registered: `bg-emerald-400` (emerald)
  - International: `bg-sky-400` (sky)
  - Zone: `bg-violet-400` (violet)

**Cell Interaction:**
- Click cell → opens `DayDrawer` or `DayPanel` showing events for that day
- Hover: cell highlights with `bg-white/5`

### 8.4 Weekly View

**Component:** `CalendarWeek`

Shows 7-day horizontal strip:
- Each day is a column (`flex-1`)
- Events rendered as small pills stacked vertically
- Time axis on left side (8:00 AM — 8:00 PM)
- Current time indicator: red horizontal line

### 8.5 Agenda View

**Component:** `CalendarAgenda`

Compact list grouped by date:
```
January 15, 2026
──────────────────────────────────────
[09:00]  Prayer Meeting      [Upcoming]
[14:00]  Youth Bible Study    [Upcoming]

January 16, 2026
──────────────────────────────────────
[18:00]  Evening Service      [Upcoming]
```

**Styling:**
- Time: `text-xs text-gray-500 font-mono w-16 flex-shrink-0`
- Event title: `text-sm font-semibold text-white`
- Status chip: inline, small

### 8.6 Timeline View

**Component:** `CalendarTimeline`

Horizontal scrollable timeline:
- Events positioned along a vertical time axis
- Duration shown as horizontal bars
- Zoom controls: 1h, 3h, 6h, 12h, 24h
- Current time indicator: red vertical line

### 8.7 Visual Highlighting

Events are color-coded across all calendar views:

| Event Type | Color | Class |
|------------|-------|-------|
| Today's Events | Gold | `bg-[#d4af37]` |
| My Registered Events | Emerald | `bg-emerald-400` |
| International Events | Sky Blue | `bg-sky-400` |
| Zone Events | Violet | `bg-violet-400` |
| Past Events | Gray | `bg-gray-500` |

### 8.8 Role-Based Access

**Member View (Consumption/Participation):**
- See: all published events in their scope
- Actions: Register, view details, add to calendar, share
- Cannot: create, edit, delete events
- Calendar: read-only, personal highlights (my registrations)

**Pastor View (Administrative/Management):**
- See: all events in managed zone(s) + own events
- Actions: Create, edit, delete, manage registrations, view attendance
- Calendar: management overlay showing registration counts, capacity, check-in status
- Additional controls:
  - Bulk actions (cancel, reschedule)
  - Registration export (CSV)
  - Attendance tracking
  - Event duplication

**Implementation:**
```jsx
const isPastor = user?.role === 'pastor' || user?.is_hod;

// Conditional rendering
{isPastor && (
  <button className="lux-btn ...">Create Event</button>
)}
{isPastor && (
  <button className="lux-btn ...">Manage Registrations</button>
)}
```

---

## 9. AI-Driven Intelligence & Notifications

### 9.1 Smart Recommendations Engine

**Component:** `AISuggestionsWidget`

**Logic Flow:**
```
User Profile Data
├── Previous Attendance (EventRegistration history)
├── User Interests (UserInterest model: ministry, sermon_category)
├── Zone / Department
├── Partnership Level
├── Leadership Role
├── Family Profile (spouse, children ages)
└── Demographics (age group, gender)

PersonalizationEngine::getEventRecommendations(user, limit)
├── Filter: published + upcoming + open
├── Boost: same zone as user
├── Boost: same category as user interests
├── Boost: same demographics as user
├── Boost: family-friendly if user has children
├── Exclude: already registered
├── Exclude: past events
└── Sort: relevance score (weighted)
```

**UI Display:**
```
┌─────────────────────────────────────────────────────────┐
│  ✨ Recommended For You                                  │
│                                                         │
│  Because you attended Men on Fire, you may also like:   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Marketplace Fellowship Conference                  │ │
│  │ Jan 22, 2026 • Business Centre                     │ │
│  │ [View Details]                                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Based on your zone (Harare Central):                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Zone Prayer Meeting                                 │ │
│  │ Jan 18, 2026 • Zone Hall                            │ │
│  │ [View Details]                                     │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**React Query:**
```jsx
const { data: recommendations } = useQuery({
  queryKey: ['recommendations', 'events', user?.id],
  queryFn: () => api.get('/recommendations/events').then(r => r.data.data),
  staleTime: 1000 * 60 * 30, // 30 minutes
});
```

### 9.2 Automated Notification Lifecycle

**Notification Types & Triggers:**

| Notification | Trigger | Timing | Channel |
|--------------|---------|--------|---------|
| Registration Confirmation | User registers for event | Immediate | In-app + Email |
| Event Reminder | 24h before event | T-24h | In-app + Push + Email |
| Schedule/Venue Update | Organizer updates event | Immediate | In-app + Email |
| Livestream Start | Event goes live | At start time | In-app + Push |
| Post-Event Thank You | Event ends | T+1h | In-app + Email |
| QR Check-in Success | User scans QR | Immediate | In-app toast |

**UI Components:**

**In-App Notification Bell (Top Nav):**
```
┌─────────────────────┐
│  🔔 Alerts          │
│  ─────────────────  │
│  ● New: Men on Fire │
│    Conference starts│
│    in 24 hours      │
│                      │
│  ● Reminder: Prayer │
│    Meeting tomorrow  │
│                      │
│  [Mark all read]    │
└─────────────────────┘
```

**Notification Dropdown:**
- `notificationsOpen` state in MembersPortal
- `useQuery` for notifications list
- Real-time updates via polling or WebSocket
- Grouped by date: Today, Yesterday, This Week

**Push Notification Integration:**
- Service Worker for web push
- Laravel WebSocket/Pusher for real-time
- Permission request on first visit to Events tab

### 9.3 QR Check-In Logic

**Check-In Scanner (Church Staff):**
- Dedicated page or app: `/checkin`
- Camera access for QR scanning
- Manual entry fallback: registration number input
- Display: Member name, photo, event, status

**Check-In Flow:**
```
1. Staff opens scanner
2. Scans member QR
3. System validates:
   - Registration exists
   - Event is today
   - Not already checked in
4. Success:
   - Green checkmark + beep
   - Logs: member_name, event, timestamp
   - Updates: EventRegistration.attended = true
5. Failure:
   - Red X + error message
   - "Invalid ticket", "Already checked in", "Wrong event"
```

**API Endpoint:**
```
POST /api/events/{id}/checkin
Body: { registration_number: "HIM-2026-001234" }
Response: { success: true, member: {...}, registration: {...} }
```

**Frontend Component:**
```jsx
function CheckInScanner({ eventId }) {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleScan = async (data) => {
    try {
      const res = await api.post(`/events/${eventId}/checkin`, {
        registration_number: data,
      });
      setScanResult(res.data);
      playSuccessSound();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
      playErrorSound();
    }
  };
  
  return (
    <div className="lux-card p-6">
      <QRReader onScan={handleScan} />
      {scanResult && <SuccessModal member={scanResult.member} />}
      {error && <ErrorToast message={error} />}
    </div>
  );
}
```

---

## 10. Component Architecture & File Structure

### 10.1 Directory Structure

```
resources/js/components/
├── MembersPortal.jsx                      # Main portal container (updated)
├── dashboard/
│   ├── EventsTab.jsx                      # Main Events tab (replaced/enhanced)
│   ├── EventCard.jsx                      # Simple event card (existing)
│   ├── SmartEventCard.jsx                 # Enhanced event card (new)
│   ├── StatusBadge.jsx                    # Event status indicator (new)
│   ├── EventCountdown.jsx                 # Countdown timer (new)
│   ├── FeaturedEventBanner.jsx            # Featured hero (new)
│   ├── EventsTimeline.jsx                 # Chronological timeline (new)
│   ├── EventsFilterBar.jsx                # Smart filter bar (new)
│   ├── MyRegisteredEvents.jsx             # Digital wallet section (new)
│   ├── RegistrationTicket.jsx             # Digital ticket with QR (new)
│   ├── RegistrationModal.jsx              # Registration workflow (new)
│   ├── InlineLivePlayer.jsx               # Livestream player (new)
│   ├── CalendarMonth.jsx                  # Monthly calendar view (new)
│   ├── CalendarWeek.jsx                   # Weekly calendar view (new)
│   ├── CalendarAgenda.jsx                 # Agenda view (new)
│   ├── CalendarTimeline.jsx               # Timeline view (new)
│   ├── CalendarViewToggle.jsx             # View switcher (new)
│   ├── AISuggestionsWidget.jsx            # AI recommendations (new)
│   └── sections/
│       ├── EventsHeaderAnalytics.jsx      # Hero + stats (new)
│       └── EventsHeaderStats.jsx          # Stat cards (new)
├── prayer-center/
│   └── PrayerCenter.jsx                   # Existing (reuse PrayerRequestForm)
├── modals/
│   └── EventDetailModal.jsx               # Event detail modal (new)
└── lib/
    └── eventUtils.js                      # Date formatting, grouping (new)
```

### 10.2 Component Tree

```
EventsTab (Enhanced)
├── EventsHeaderAnalytics
│   ├── EventsHeaderStats
│   │   └── StatCard (x4)
│   └── PersonalMetrics
├── EventsFilterBar
│   ├── ScopeFilterGroup
│   ├── DemographicsFilterGroup
│   ├── EventTypeFilterGroup
│   └── CalendarViewToggle
├── FeaturedEventBanner (conditional)
│   ├── EventCountdown
│   ├── EventSocialProof
│   └── ActionButtons
├── EventsTimeline / CalendarView
│   ├── TimelineHeader
│   ├── TimelineList
│   │   └── TimelineGroup
│   │       └── SmartEventCard
│   │           ├── StatusBadge
│   │           └── ActionsBar
│   └── LoadMore
├── MyRegisteredEvents
│   └── RegistrationTicket
│       ├── QRCode
│       └── ActionButtons
├── RegistrationModal (portal)
├── InlineLivePlayer (conditional)
│   └── EngagementTools
├── EventDetailModal (portal)
└── AISuggestionsWidget
```

### 10.3 State Management

**Local State (useState):**
- `activeTab` — current view (list/month/week/agenda/timeline)
- `filters` — filter configuration object
- `selectedEvent` — event for detail modal
- `registrationModal` — registration modal state
- `showLivePlayer` — live player visibility
- `notificationsOpen` — notification dropdown

**Server State (React Query):**
```jsx
const queries = {
  events: useQuery({ queryKey: ['events', filters], ... }),
  featured: useQuery({ queryKey: ['events', 'featured'], ... }),
  myRegistrations: useQuery({ queryKey: ['my-registrations'], ... }),
  recommendations: useQuery({ queryKey: ['recommendations', 'events'], ... }),
  notifications: useQuery({ queryKey: ['notifications'], ... }),
  liveStatus: useQuery({ queryKey: ['events', eventId, 'live'], ... }),
};
```

**URL State (react-router):**
- `?view=month` — calendar view
- `?scope=international` — active scope filter
- `?eventId=123` — deep link to event detail

---

## 11. API Contracts & Data Models

### 11.1 Event Model (Extended)

```php
// app/Models/Event.php
protected $fillable = [
  'title', 'description', 'type', 'starts_at', 'ends_at',
  'venue_name', 'venue_address', 'zone_id',
  'requires_registration', 'requires_payment',
  'registration_fee', 'currency', 'capacity',
  'registration_closes_at', 'status', 'is_public',
  'created_by', 'banner_image',
  'category', 'image',
  'is_featured',           // NEW: featured event flag
  'is_livestream',         // NEW: livestream flag
  'livestream_url',        // NEW: YouTube embed URL
  'host',                  // NEW: event host name
  'theme',                 // NEW: event theme/tagline
  'target_demographics',   // NEW: JSON array of target demographics
  'requires_checkin',      // NEW: QR check-in required
];
```

### 11.2 New API Endpoints

```
GET    /api/events/featured                    # Get featured event
GET    /api/events/stats                       # Get events stats dashboard
GET    /api/events/my-registrations            # Get current user registrations
GET    /api/events/{id}/live-status            # Check if event is live
POST   /api/events/{id}/register               # Register for event (existing)
DELETE /api/events/{id}/register               # Cancel registration (existing)
POST   /api/events/{id}/checkin                # QR check-in
POST   /api/events/{id}/prayer-request         # Submit prayer request
POST   /api/events/{id}/watch-later            # Add to watch later
GET    /api/events/{id}/registrations          # Admin: list registrations
```

### 11.3 Response Formats

**GET /api/events/featured**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Catch The Fire Conference",
    "theme": "Igniting a Generation",
    "description": "...",
    "banner_image": "https://...",
    "hosts": ["Apostle Tavonga Vutabwashe", "Pastor Chipo Vutabwashe"],
    "venue_name": "International Outreach Centre",
    "venue_address": "123 Main St, Harare",
    "starts_at": "2026-01-15T09:00:00Z",
    "ends_at": "2026-01-17T18:00:00Z",
    "registration_count": 2847,
    "is_registered": true,
    "is_full": false,
    "registration_open": true
  }
}
```

**GET /api/events/stats**
```json
{
  "success": true,
  "data": {
    "this_month_count": 12,
    "next_event_in": "3d 14h",
    "total_this_month": 12,
    "livestreams_today": 1,
    "registered_count": 3,
    "attended_count": 8,
    "next_featured_event": {
      "id": 1,
      "title": "Catch The Fire Conference",
      "starts_at": "2026-01-15T09:00:00Z"
    }
  }
}
```

**GET /api/events/my-registrations**
```json
{
  "success": true,
  "data": [
    {
      "id": "HIM-2026-001234",
      "event_id": 1,
      "event_title": "Catch The Fire Conference",
      "starts_at": "2026-01-15T09:00:00Z",
      "venue_name": "IOC Harare",
      "status": "confirmed",
      "attended": false,
      "checked_in_at": null,
      "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=..."
    }
  ]
}
```

---

## 12. State Management & Logic Flows

### 12.1 Event Filtering Logic

```
User Interaction
├── Click filter pill
│   ├── If active → remove from array
│   └── If inactive → add to array
├── Update filters state
└── React Query refetch (queryKey changes)
    └── API call with new params
        └── Update events list
```

### 12.2 Registration Flow

```
User clicks "Register"
├── Open RegistrationModal
├── User selects attendance_type (physical/online)
├── User clicks "Confirm"
├── POST /api/events/{id}/register
│   ├── Success
│   │   ├── Close modal
│   │   ├── Show success toast
│   │   ├── Update local registration status
│   │   └── Refetch events + my-registrations
│   └── Error
│       ├── Show error message
│       └── Keep modal open
```

### 12.3 Live State Transition

```
Polling (30s interval)
├── Fetch /events/{id}/live-status
├── Compare with previous state
├── If transitioning to live
│   ├── Scroll to inline player
│   ├── Show notification "Event is now live!"
│   └── Auto-play if user preference allows
└── If transitioning from live
    ├── Show "Event has ended" message
    └── Offer recording link
```

### 12.4 Check-In Flow

```
Staff scans QR / enters registration number
├── POST /api/events/{id}/checkin
├── API validates
│   ├── Registration exists? → Yes
│   ├── Event is today? → Yes
│   └── Not already checked in? → Yes
├── Success
│   ├── Play success sound
│   ├── Show member details
│   ├── Log check-in
│   └── Update registration.attended = true
└── Failure
    ├── Play error sound
    ├── Show error message
    └── Specific error:
        ├── "Invalid ticket"
        ├── "Already checked in"
        └── "Wrong event"
```

---

## 13. Accessibility, Performance & Responsiveness

### 13.1 Accessibility (WCAG 2.1 AA)

**Semantic HTML:**
- Use `<main>`, `<section>`, `<header>`, `<nav>` landmarks
- Event cards use `<article>` with `aria-label`
- Filter pills use `role="group"` with `aria-label`

**Keyboard Navigation:**
- All interactive elements focusable (`tabIndex` where needed)
- Filter pills: arrow key navigation within group
- Modals: focus trap, Escape to close
- Calendar: arrow keys for date navigation

**Screen Reader Support:**
- `aria-live="polite"` for dynamic content (event count updates, live status)
- `aria-label` on icon-only buttons
- `aria-pressed` on toggle filters
- `aria-describedby` for form inputs

**Color Contrast:**
- All text meets 4.5:1 contrast ratio minimum
- Status badges meet 3:1 for large text
- Focus indicators: `ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#0A192F]`

### 13.2 Performance Optimization

**Code Splitting:**
```jsx
const EventsTab = lazy(() => import('./dashboard/EventsTab'));
const FeaturedEventBanner = lazy(() => import('./dashboard/FeaturedEventBanner'));
const CalendarMonth = lazy(() => import('./dashboard/CalendarMonth'));
```

**Image Optimization:**
- Use `loading="lazy"` on event posters
- Responsive images: `srcset` with multiple sizes
- Blur placeholder: `blur-up` technique for poster images

**Data Caching:**
```jsx
useQuery({
  queryKey: ['events', filters],
  staleTime: 30000,        // 30s
  gcTime: 300000,          // 5min
  refetchOnWindowFocus: true,
  refetchInterval: 60000,  // 1min for live events
});
```

**Virtualization:**
- For long event lists (>50 items), use `react-window` or `react-virtualized`
- Calendar grid: render only visible month cells

### 13.3 Responsive Breakpoints

| Breakpoint | Min Width | Layout Changes |
|------------|-----------|----------------|
| `sm` | 640px | Stats grid: 2 cols, Cards: horizontal layout |
| `md` | 768px | Stats grid: 4 cols, Filter labels visible |
| `lg` | 1024px | Max width: `max-w-7xl`, Full padding |
| `xl` | 1280px | Slightly reduced padding for large screens |

**Mobile-Specific:**
- Event cards: stack vertically (poster on top)
- Filter bar: horizontal scroll with `overflow-x-auto`
- Calendar: compact cells, swipeable months
- Action buttons: full-width on very small screens

---

## 14. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up component directory structure
- [ ] Create base components: `SmartEventCard`, `StatusBadge`, `EventCountdown`
- [ ] Implement `EventsHeaderAnalytics` with stats dashboard
- [ ] Build `EventsFilterBar` with state management
- [ ] Enhance existing `EventsTab` with new layout

### Phase 2: Core Features (Week 3-4)
- [ ] Implement `FeaturedEventBanner` with countdown
- [ ] Build `EventsTimeline` with chronological grouping
- [ ] Create `MyRegisteredEvents` with digital tickets
- [ ] Implement `RegistrationModal` workflow
- [ ] Add QR code generation and display

### Phase 3: Advanced Features (Week 5-6)
- [ ] Build calendar views (Monthly, Weekly, Agenda, Timeline)
- [ ] Implement `InlineLivePlayer` with YouTube embed
- [ ] Add livestream engagement tools
- [ ] Build `CheckInScanner` for church staff

### Phase 4: AI & Notifications (Week 7-8)
- [ ] Extend `PersonalizationEngine` with event recommendations
- [ ] Build `AISuggestionsWidget` UI
- [ ] Implement notification lifecycle (confirmation, reminders, etc.)
- [ ] Add push notification support

### Phase 5: Polish & Launch (Week 9-10)
- [ ] Accessibility audit and fixes
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Load testing with realistic data volumes
- [ ] Documentation and handoff

### Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| `qrcode.react` | QR code generation for tickets | To install |
| `react-youtube` | YouTube embed player | To install |
| `@tanstack/react-query` | Server state management | Existing |
| `axios` | API client | Existing |
| `zod` | Form validation | Existing |
| `react-router-dom` | Deep linking | Existing |

### Backend Work Required

1. **Add new Event fields:** `is_featured`, `is_livestream`, `livestream_url`, `host`, `theme`, `target_demographics`, `requires_checkin`
2. **New endpoints:** `/api/events/featured`, `/api/events/stats`, `/api/events/{id}/live-status`, `/api/events/{id}/checkin`, `/api/events/{id}/prayer-request`, `/api/events/{id}/watch-later`
3. **Extend EventPolicy:** Add `manageRegistrations` ability for pastors
4. **Notification system:** Laravel notifications with mail/push channels
5. **PersonalizationEngine:** Extend `getEventRecommendations()` with new scoring logic
6. **EventSeeder:** Populate sample data for testing

---

## Appendix A: Design Tokens Quick Reference

```css
/* Colors */
--color-bg-primary: #0A192F;
--color-bg-secondary: #112240;
--color-bg-elevated: rgba(255,255,255,0.05);
--color-gold: #dfb15b;
--color-gold-hover: #f59e0b;
--color-sky: #0EA5E9;
--color-emerald: #22c55e;
--color-rose: #ef4444;
--color-violet: #8b5cf6;

/* Typography */
--font-sans: 'Figtree', sans-serif;
--text-hero: 1.25rem/1.5rem font-bold;
--text-card-title: 1.125rem font-bold;
--text-body: 0.875rem;
--text-meta: 0.625rem;

/* Spacing */
--space-card: 1.25rem;
--space-section: 1rem;
--radius-card: 1.25rem;
--radius-button: 0.75rem;
--radius-banner: 1.5rem;
```

## Appendix B: Animation Timing

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-rise: 600ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

*End of Technical Design Specification — Smart Events Module v1.0*

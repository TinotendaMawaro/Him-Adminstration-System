<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventRegistrationResource;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // ─── Public / all-role listing ────────────────────────────────────────────

    /**
     * GET /api/events
     * Published events visible to current user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['zone', 'createdBy'])
            ->published()
            ->orderBy('starts_at');

        if ($request->filled('type')) {
            $types = array_filter(array_map('trim', explode(',', (string) $request->get('type'))));
            if ($types) {
                $query->whereIn('type', $types);
            }
        }

        if ($request->filled('scope') && $request->get('scope') !== 'all') {
            $query->where('scope', $request->get('scope'));
        }

        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        if ($request->boolean('open')) {
            $query->open();
        }

        // Load the current user's registration for each event
        $userId = $request->user()->id;
        $query->with(['registrations' => fn ($q) => $q->where('user_id', $userId)]);

        $events = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => EventResource::collection($events),
            'meta'    => [
                'current_page' => $events->currentPage(),
                'last_page'    => $events->lastPage(),
                'total'        => $events->total(),
            ],
        ]);
    }

    /**
     * GET /api/events/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $event = Event::with(['zone', 'createdBy',
            'registrations' => fn ($q) => $q->where('user_id', $request->user()->id),
        ])->findOrFail($id);

        $this->authorize('view', $event);

        return response()->json(['success' => true, 'data' => new EventResource($event)]);
    }

    // ─── Manage (master / event role) ────────────────────────────────────────

    /**
     * POST /api/events
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Event::class);

        $validated = $request->validate([
            'title'                  => 'required|string|max:255',
            'description'            => 'nullable|string',
            'type'                   => 'required|in:conference,forum,seminar,youth_camp,retreat,special_service,fundraiser,other',
            'starts_at'              => 'required|date|after:now',
            'ends_at'                => 'nullable|date|after:starts_at',
            'venue_name'             => 'nullable|string|max:255',
            'venue_address'          => 'nullable|string',
            'zone_id'                => 'nullable|exists:zones,id',
            'requires_registration'  => 'boolean',
            'requires_payment'       => 'boolean',
            'registration_fee'       => 'required_if:requires_payment,true|numeric|min:0',
            'currency'               => 'string|size:3',
            'capacity'               => 'nullable|integer|min:1',
            'registration_closes_at' => 'nullable|date|before:starts_at',
            'is_public'              => 'boolean',
            'category'               => 'nullable|string|max:100',
            'image'                  => 'nullable|string|max:255',
        ]);

        $event = Event::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status'     => 'draft',
        ]);

        return response()->json(['success' => true, 'data' => new EventResource($event)], 201);
    }

    /**
     * PUT /api/events/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->authorize('update', $event);

        $validated = $request->validate([
            'title'                  => 'sometimes|string|max:255',
            'description'            => 'nullable|string',
            'type'                   => 'sometimes|in:conference,forum,seminar,youth_camp,retreat,special_service,fundraiser,other',
            'starts_at'              => 'sometimes|date',
            'ends_at'                => 'nullable|date|after:starts_at',
            'venue_name'             => 'nullable|string|max:255',
            'venue_address'          => 'nullable|string',
            'zone_id'                => 'nullable|exists:zones,id',
            'requires_registration'  => 'boolean',
            'requires_payment'       => 'boolean',
            'registration_fee'       => 'numeric|min:0',
            'currency'               => 'string|size:3',
            'capacity'               => 'nullable|integer|min:1',
            'registration_closes_at' => 'nullable|date',
            'status'                 => 'in:draft,published,cancelled,completed',
            'is_public'              => 'boolean',
            'category'               => 'nullable|string|max:100',
            'image'                  => 'nullable|string|max:255',
        ]);

        $event->update($validated);

        return response()->json(['success' => true, 'data' => new EventResource($event->fresh(['zone', 'createdBy']))]);
    }

    /**
     * DELETE /api/events/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->authorize('delete', $event);
        $event->delete();

        return response()->json(['success' => true, 'message' => 'Event deleted.']);
    }

    // ─── Registration ─────────────────────────────────────────────────────────

/**
      * POST /api/events/{id}/register
      * Any portal user can register for an open event.
      */
    public function register(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        if (!$event->registration_open) {
            return response()->json(['success' => false, 'message' => 'Registration is not open for this event.'], 422);
        }

        $existing = EventRegistration::where('event_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Already registered.'], 422);
        }

        $registration = EventRegistration::create([
            'event_id'   => $event->id,
            'user_id'    => $request->user()->id,
            'status'     => $event->requires_payment ? 'pending' : 'confirmed',
            'amount_due' => $event->requires_payment ? $event->registration_fee : 0,
        ]);

        // Notify pastors in the event's zone about the registration
        if ($event->zone_id) {
            $pastors = User::where('role', 'pastor')
                ->where('zone_id', $event->zone_id)
                ->get();

            foreach ($pastors as $pastor) {
                $pastor->notifications()->create([
                    'title' => 'New Event Registration',
                    'message' => ($request->user()->name ?? 'A member') . " registered for {$event->title}.",
                    'type' => 'event',
                    'category' => 'event_registration',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new EventRegistrationResource($registration->load('event')),
        ], 201);
    }

    /**
     * DELETE /api/events/{id}/register
     * Cancel registration.
     */
    public function cancelRegistration(Request $request, int $id): JsonResponse
    {
        $registration = EventRegistration::where('event_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $registration->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Registration cancelled.']);
    }

    /**
     * GET /api/events/{id}/registrations
     * Admin / event manager view.
     */
    public function registrations(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->authorize('manageRegistrations', $event);

        $registrations = $event->registrations()
            ->with(['user'])
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => EventRegistrationResource::collection($registrations),
        ]);
    }

    public function featured(): JsonResponse
    {
        $event = Event::where('status', 'published')
            ->where('is_featured', true)
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->first();

        if (!$event) {
            return response()->json(['success' => true, 'data' => null]);
        }

        return response()->json([
            'success' => true,
            'data'    => new EventResource($event->load('zone', 'createdBy')),
        ]);
    }

    public function stats(): JsonResponse
    {
        $user = request()->user();
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $thisMonthCount = Event::where('status', 'published')
            ->where('starts_at', '>=', $startOfMonth)
            ->where('starts_at', '<=', $endOfMonth)
            ->count();

        $nextEvent = Event::where('status', 'published')
            ->where('starts_at', '>', $now)
            ->orderBy('starts_at')
            ->first();

        $nextFeatured = Event::where('status', 'published')
            ->where('is_featured', true)
            ->where('starts_at', '>', $now)
            ->orderBy('starts_at')
            ->first();

        $livestreamsToday = Event::where('status', 'published')
            ->where('is_livestream', true)
            ->whereDate('starts_at', $now->toDateString())
            ->count();

        $registeredCount = 0;
        $attendedCount = 0;
        if ($user) {
            $registeredCount = EventRegistration::where('user_id', $user->id)
                ->where('status', 'confirmed')
                ->count();
            $attendedCount = EventRegistration::where('user_id', $user->id)
                ->where('status', 'attended')
                ->count();
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'this_month_count'    => $thisMonthCount,
                'next_event_in'       => $nextEvent ? $now->diffForHumans($nextEvent->starts_at, true) : null,
                'next_event_starts_at' => $nextEvent ? $nextEvent->starts_at?->toIso8601String() : null,
                'total_this_month'    => $thisMonthCount,
                'livestreams_today'   => $livestreamsToday,
                'registered_count'    => $registeredCount,
                'attended_count'      => $attendedCount,
                'current_month'       => $now->format('F Y'),
                'next_featured_event' => $nextFeatured ? [
                    'id'       => $nextFeatured->id,
                    'title'    => $nextFeatured->title,
                    'starts_at'=> $nextFeatured->starts_at?->toIso8601String(),
                ] : null,
            ],
        ]);
    }

    public function myRegistrations(Request $request): JsonResponse
    {
        $user = $request->user();

        $registrations = EventRegistration::where('user_id', $user->id)
            ->with(['event' => fn ($q) => $q->select('id', 'title', 'starts_at', 'ends_at', 'venue_name', 'status', 'is_livestream', 'livestream_url')])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($registration) {
                $event = $registration->event;
                return [
                    'id'                  => $registration->id,
                    'registration_number' => 'HIM-2026-' . str_pad($registration->id, 6, '0', STR_PAD_LEFT),
                    'event_id'            => $event?->id,
                    'event_title'         => $event?->title,
                    'starts_at'           => $event?->starts_at?->toIso8601String(),
                    'ends_at'             => $event?->ends_at?->toIso8601String(),
                    'venue_name'          => $event?->venue_name,
                    'status'              => $registration->status,
                    'attended'            => $registration->status?->value === 'attended',
                    'checked_in_at'       => $registration->checked_in_at,
                    'qr_code_url'         => $event ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode("/events/{$event->id}/checkin?registration={$registration->id}") : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $registrations,
        ]);
    }
}

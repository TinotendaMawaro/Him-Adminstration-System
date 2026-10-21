<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

/**
 * Optional "email copies of notifications" preference.
 *
 *   API (signed-in portal user): GET/PUT /api/email-preferences
 *   Email links (signed, no sign-in): GET|POST /email/unsubscribe/{user}   and   GET /email/resubscribe/{user}
 *
 * Receipts, security alerts and password resets are never optional, so they are not affected.
 */
class EmailPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['email_notifications' => (bool) $request->user()->email_notifications]]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate(['email_notifications' => ['required', 'boolean']]);

        $request->user()->forceFill(['email_notifications' => $data['email_notifications']])->save();

        return response()->json(['success' => true, 'data' => ['email_notifications' => (bool) $data['email_notifications']]]);
    }

    /** GET from the footer link, or the POST mail clients send for one-click unsubscribe. */
    public function unsubscribe(Request $request, User $user)
    {
        $user->forceFill(['email_notifications' => false])->save();

        if ($request->isMethod('post')) {
            return response('', 200);
        }

        return $this->page($user, false);
    }

    public function resubscribe(Request $request, User $user)
    {
        $user->forceFill(['email_notifications' => true])->save();

        return $this->page($user, true);
    }

    private function page(User $user, bool $subscribed)
    {
        $days = (int) config('mailing.signed_link_days', 30);

        return response()->view('emails.preference', [
            'subscribed' => $subscribed,
            'email'      => $user->email,
            'toggleUrl'  => URL::temporarySignedRoute($subscribed ? 'email.unsubscribe' : 'email.resubscribe', now()->addDays($days), ['user' => $user->id]),
            'portalUrl'  => config('mailing.portal_url') ?: url('/'),
        ])->header('Cache-Control', 'no-store')->header('X-Robots-Tag', 'noindex');
    }
}

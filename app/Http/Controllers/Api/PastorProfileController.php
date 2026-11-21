<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditTrail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

/** A pastor's own profile: everything about them in one place, editable, with the photo coming from the gallery. */
class PastorProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->present($request->user())]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $pastor = $user->pastor()->firstOrFail();

        $v = $request->validate([
            'title'                    => ['nullable', 'string', 'max:40'],
            'first_name'               => ['required', 'string', 'max:80'],
            'surname'                  => ['required', 'string', 'max:80'],
            'email'                    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'                    => ['nullable', 'string', 'max:40'],
            'date_of_birth'            => ['nullable', 'date', 'before:today', 'after:1900-01-01'],
            'address'                  => ['nullable', 'string', 'max:255'],
            'next_of_kin_name'         => ['nullable', 'string', 'max:120'],
            'next_of_kin_phone'        => ['nullable', 'string', 'max:40'],
            'next_of_kin_relationship' => ['nullable', 'string', 'max:60'],
            'qualifications'           => ['nullable', 'string', 'max:3000'],
            'position'                 => ['nullable', 'string', 'max:160'],
        ]);

        $title = trim($v['title'] ?? '') ?: 'Pastor';
        $user->forceFill([
            'name'          => trim("{$title} {$v['first_name']} {$v['surname']}"),
            'email'         => strtolower($v['email']),
            'phone'         => $v['phone'] ?? null,
            'address'       => $v['address'] ?? null,
            'date_of_birth' => $v['date_of_birth'] ?? null,
        ])->save();

        $details = ['title' => $title, 'name' => $v['first_name'], 'surname' => $v['surname']];
        // The extra details need the latest database update (php artisan migrate); until then only the basics are saved.
        if (Schema::hasColumn('pastors', 'next_of_kin_name')) {
            $details += [
                'next_of_kin_name' => $v['next_of_kin_name'] ?? null, 'next_of_kin_phone' => $v['next_of_kin_phone'] ?? null,
                'next_of_kin_relationship' => $v['next_of_kin_relationship'] ?? null,
                'qualifications' => $v['qualifications'] ?? null, 'position' => $v['position'] ?? null,
            ];
        }
        $pastor->update($details);
        AuditTrail::record('pastor.profile_updated', $user, $pastor, [], $user->id);

        return response()->json(['success' => true, 'data' => $this->present($user->fresh())]);
    }

    private function present(User $user): array
    {
        $pastor = $user->pastor()->with(['zone.region.country'])->first();
        abort_unless($pastor, 404, 'Pastor profile not found.');
        $zone = $pastor->zone;

        return [
            'photo'         => $user->profile_photo,
            'code'          => $pastor->code,
            'title'         => $pastor->title, 'first_name' => $pastor->name, 'surname' => $pastor->surname,
            'full_name'     => $user->name,
            'email'         => $user->email, 'phone' => $user->phone, 'address' => $user->address,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'zone'          => $zone?->name, 'zone_code' => $zone?->code,
            'region'        => $zone?->region?->name, 'country' => $zone?->region?->country?->name,
            'next_of_kin_name' => $pastor->next_of_kin_name, 'next_of_kin_phone' => $pastor->next_of_kin_phone,
            'next_of_kin_relationship' => $pastor->next_of_kin_relationship,
            'qualifications' => $pastor->qualifications,
            'position'      => $pastor->position ?: ($pastor->is_zone_pastor ? 'Pastor in Charge' : 'Pastor'),
            'roles'         => array_values(array_filter([
                $pastor->is_zone_pastor ? 'Pastor in Charge' : null,
                !empty($pastor->is_zone_admin) ? 'Zone Administrator' : null,
                $pastor->is_regional_leader ? 'Regional Leader' : null,
                $pastor->is_general_overseer ? 'General Overseer' : null,
            ])),
        ];
    }
}

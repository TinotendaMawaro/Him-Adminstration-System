<?php

namespace App\Services;

use App\Models\User;

class ProfileCompletenessService
{
    protected array $fields = [
        'user.name'             => 5,
        'user.email'            => 5,
        'user.phone'            => 5,
        'user.profile_photo'    => 10,
        'user.address_line_1'   => 5,
        'user.city'             => 5,
        'user.province'         => 5,
        'member.date_of_birth'  => 5,
        'member.gender_id'      => 5,
        'member.demography_id'  => 5,
        'member.home_group_id'  => 10,
        'member.department_id'  => 10,
        'member.zone_id'        => 10,
        'member.is_baptised'    => 5,
        'member.membership_date'=> 5,
    ];

    public function calculate(User $user): array
    {
        $earned = 0;
        $total = array_sum($this->fields);
        $missing = [];

        foreach ($this->fields as $field => $weight) {
            [$relation, $attribute] = explode('.', $field, 2);

            $value = match ($relation) {
                'user'   => data_get($user, $attribute),
                'member' => data_get($user->member, $attribute),
                default  => null,
            };

            if ($value) {
                $earned += $weight;
            } else {
                $missing[] = ['field' => $field, 'weight' => $weight];
            }
        }

        return [
            'score'          => round(($earned / $total) * 100),
            'earned_points'  => $earned,
            'total_points'   => $total,
            'missing_fields' => $missing,
        ];
    }
}

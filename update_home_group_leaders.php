<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Define the home group data from the seeder
$iocHomeGroups = [
    [
        'name' => 'Mabelreign',
        'location' => '26 Cotswold Way, Cotswold Hills Mabelreign',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr & Mrs Chikanya (0775909292, 0773868677)',
    ],
    [
        'name' => 'Ashdown Park',
        'location' => '19 Sandy Lane Ashdown Park, Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Gogo Chindawi (0712623162)',
    ],
    [
        'name' => 'Bloomingdale',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Machine (0779520757)',
    ],
    [
        'name' => 'Spitzkop Rainham',
        'location' => 'Plot Number 11, Spitzkop Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastors Chinoyevedza (0774130042, 0774832829)',
    ],
    [
        'name' => 'Cold Comfort',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastors Mudhefi (0714336002, 0773448707)',
    ],
    [
        'name' => 'Tynwald North',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'No Leader',
    ],
    [
        'name' => 'Sunridge',
        'location' => 'Proposed to combine with Avonlea/Greencroft',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Home Group Leader relocated to DZ – Ext NBS',
    ],
    [
        'name' => 'Marlborough',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Kasokoya (0772372995, 0779124528)',
    ],
    [
        'name' => 'NBS Gillingham',
        'location' => 'New Home Group',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Tafadzwa Mushiwekufa (0776581886)',
    ],
    [
        'name' => 'Westlea, Nkwisi, Lenana, Matidoda',
        'location' => '5349 Nkwisi Gardens Tynwald Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr & Mrs Madamombe (0772298137, 0772471291), Mr & Mrs Zitsenga (0772455944), Ms Nyamatore (0773548513)',
    ],
    [
        'name' => 'Avonlea and Greencroft',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Deacons Masava (0772996067, 0773486413)',
    ],
    [
        'name' => 'Borrowdale',
        'location' => 'Sister Takunda Taderera 0772593558',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Taderera (0772593558)',
    ],
    [
        'name' => 'Southview Park',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastor Makoni (0772850444)',
    ],
    [
        'name' => 'Kambuzuma/Westwood',
        'location' => '9056 section 3, Kambuzuma Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Proposed: Mrs Muchenje, Mr Chirume',
    ],
    [
        'name' => 'Rugare',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Mabasa (0775606593)',
    ],
    [
        'name' => 'Eyecourt',
        'location' => '154 Eyecourt, Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastors Munemo (0772684612)',
    ],
    [
        'name' => 'Warren Park 1&2',
        'location' => '20 8th Close Warren Park harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Nyazamba (0772687091, 0719687091), Mrs Jekecha (0773236566), Mr Dzuda (0772970519/0719970519)',
    ],
    [
        'name' => 'Waterfalls',
        'location' => '712 Reelar Parktown, Waterfalls Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastors Tembo (0773470796, 0775206244)',
    ],
    [
        'name' => 'Mainway Meadows',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Machabe (0717115000, 0774072745), Mrs Mufunga (0773497197), Tanyaradzwa Mufunga (0719497197)',
    ],
    [
        'name' => 'Msasa/Chadcome/Hillside/Braeside',
        'location' => 'Provisional until appointment of the new Leader',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Deacon & Deaconess Masava (0772996067, 0773486413)',
    ],
    [
        'name' => 'Avondale',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Matiringe (0773172339, 0778843257)',
    ],
    [
        'name' => 'Warren Park D',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr Jiri (0771033175)',
    ],
    [
        'name' => 'Belvedere South',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Zizhou (0772466933)',
    ],
    [
        'name' => 'Madokere',
        'location' => '13047 Madokero Tynwald',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Takototsa (0772222530, 0772366530), Mrs Mawarura (0772652408)',
    ],
    [
        'name' => 'Hatfield',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mrs Mapani (0772604238), Mrs L Mugari (0775141046), Mrs H Chaponda (0772222835), Mr & Mrs Matenda (0772974775/0772222444)',
    ],
    [
        'name' => 'Kuwadzana Phase 3',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastor Brian (0783014271)',
    ],
    [
        'name' => 'Dzivarasekwa ext',
        'location' => '308 Nehanda Dzivarasekwa Extension Harare',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Msipa (0775052515, 0773790612), Mrs Matare (0772808251)',
    ],
    [
        'name' => 'Harare City centre',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastor Emma (0772859739)',
    ],
    [
        'name' => 'Domboshawa',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mrs Badza (0772496793), Pastors Masendeke',
    ],
    [
        'name' => 'Fairview',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mrs Makombe (0772742872)',
    ],
    [
        'name' => 'Belvedere North',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr/s Magunje (0772978145, 0783185523)',
    ],
    [
        'name' => 'Mount Pleasant',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mrs Bwerinofa (0772205324)',
    ],
    [
        'name' => 'Whitecliff Granary',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Pfumayaramba (0772445611, 0784456741)',
    ],
    [
        'name' => 'Chisipiti, Mandara, Glen Lorne, Chishawasha',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mr and Mrs Chigiya (0773901018, 0782260888)',
    ],
    [
        'name' => 'Waterfalls Retreat',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Pastors Nyamanhari (0772384466, 0772936014)',
    ],
    [
        'name' => 'Greendale',
        'location' => 'To be assigned',
        'meeting_day' => 'Sunday',
        'meeting_time' => '09:00:00',
        'leader_info' => 'Mrs Musakanda (0772407001)',
    ],
];

// Get IOC zone
$zone = DB::table('zones')->where('code', 'R0101')->first();
if (!$zone) {
    echo "IOC zone (R0101) not found!\n";
    exit(1);
}

echo "Found IOC zone with ID: {$zone->id}\n\n";

$updated = 0;
$notFound = [];

foreach ($iocHomeGroups as $hgData) {
    // Find the home group
    $homeGroup = DB::table('home_groups')
        ->where('zone_id', $zone->id)
        ->where('name', $hgData['name'])
        ->first();

    if (!$homeGroup) {
        echo "Home group '{$hgData['name']}' not found in database\n";
        continue;
    }

    // Skip if no leader info or "No Leader"
    if (empty($hgData['leader_info']) || $hgData['leader_info'] === 'No Leader') {
        echo "No leader specified for '{$hgData['name']}', skipping\n";
        continue;
    }

    // Extract names from leader_info
    // Remove phone numbers and clean up
    $leaderInfo = $hgData['leader_info'];
    // Remove phone numbers in parentheses
    $leaderInfo = preg_replace('/\s*\([^)]*\)/', '', $leaderInfo);
    // Trim
    $leaderInfo = trim($leaderInfo);

    echo "Processing '{$hgData['name']}': Leader info = '{$leaderInfo}'\n";

    // Try to find users matching the names
    $leaderId = null;

    // Handle different formats
    if (strpos($leaderInfo, ' & ') !== false) {
        // Format: "Mr & Mrs Chikanya"
        $names = explode(' & ', $leaderInfo);
        foreach ($names as $name) {
            $name = trim($name);
            // Remove titles like Mr, Mrs, Pastor, etc.
            $cleanName = preg_replace('/^(Mr|Mrs|Ms|Pastor|Deacon|Deaconess|Brother|Sister)\.?\s*/i', '', $name);
            $cleanName = trim($cleanName);
            
            // Try to find user
            $user = DB::table('users')
                ->where('name', 'like', "%{$cleanName}%")
                ->first();
            
            if ($user) {
                $leaderId = $user->id;
                echo "  -> Found user: {$user->name} (ID: {$user->id})\n";
                break;
            }
        }
    } elseif (strpos($leaderInfo, ' and ') !== false) {
        // Format: "Mr and Mrs Machine"
        $names = explode(' and ', $leaderInfo);
        foreach ($names as $name) {
            $name = trim($name);
            // Remove titles like Mr, Mrs, Pastor, etc.
            $cleanName = preg_replace('/^(Mr|Mrs|Ms|Pastor|Deacon|Deaconess|Brother|Sister)\.?\s*/i', '', $name);
            $cleanName = trim($cleanName);
            
            // Try to find user
            $user = DB::table('users')
                ->where('name', 'like', "%{$cleanName}%")
                ->first();
            
            if ($user) {
                $leaderId = $user->id;
                echo "  -> Found user: {$user->name} (ID: {$user->id})\n";
                break;
            }
        }
    } elseif (strpos($leaderInfo, ',') !== false) {
        // Format: "Mr & Mrs Madamombe (0772298137, 0772471291), Mr & Mrs Zitsenga (0772455944), Ms Nyamatore (0773548513)"
        // Extract parts before first comma that has a parenthesis after it
        // Simpler approach: split by ), and take first part
        $parts = preg_split('/\)\s*,\s*/', $leaderInfo);
        $firstPart = trim($parts[0]);
        // Remove trailing (
        $firstPart = rtrim($firstPart, ' (');
        
        // Now process like the " & " case
        if (strpos($firstPart, ' & ') !== false) {
            $names = explode(' & ', $firstPart);
            foreach ($names as $name) {
                $name = trim($name);
                // Remove titles like Mr, Mrs, Pastor, etc.
                $cleanName = preg_replace('/^(Mr|Mrs|Ms|Pastor|Deacon|Deaconess|Brother|Sister)\.?\s*/i', '', $name);
                $cleanName = trim($cleanName);
                
                // Try to find user
                $user = DB::table('users')
                    ->where('name', 'like', "%{$cleanName}%")
                    ->first();
                
                if ($user) {
                    $leaderId = $user->id;
                    echo "  -> Found user: {$user->name} (ID: {$user->id})\n";
                    break;
                }
            }
        }
    } else {
        // Single leader format: "Pastor Makoni" or "Gogo Chindawi"
        $name = trim($leaderInfo);
        // Remove titles like Mr, Mrs, Pastor, etc.
        $cleanName = preg_replace('/^(Mr|Mrs|Ms|Pastor|Deacon|Deaconess|Brother|Sister)\.?\s*/i', '', $name);
        $cleanName = trim($cleanName);
        
        // Try to find user
        $user = DB::table('users')
            ->where('name', 'like', "%{$cleanName}%")
            ->first();
        
        if ($user) {
            $leaderId = $user->id;
            echo "  -> Found user: {$user->name} (ID: {$user->id})\n";
        }
    }

    if ($leaderId) {
        // Update the home group with leader_id
        DB::table('home_groups')
            ->where('id', $homeGroup->id)
            ->update(['leader_id' => $leaderId]);
        
        echo "  -> Updated home group '{$hgData['name']}' with leader ID {$leaderId}\n";
        $updated++;
    } else {
        echo "  -> Could not find matching user for '{$hgData['name']}'\n";
        $notFound[] = $hgData['name'];
    }
    
    echo "\n";
}

echo "Summary:\n";
echo "  - Updated: {$updated} home groups\n";
echo "  - Not found: " . count($notFound) . " home groups\n";

if (!empty($notFound)) {
    echo "  - Not found home groups:\n";
    foreach ($notFound as $name) {
        echo "    * {$name}\n";
    }
}

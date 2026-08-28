<?php

namespace Database\Seeders;

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\MatchBattle;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentRuleset;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TournamentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Rulesets
        $standardRuleset = TournamentRuleset::firstOrCreate(
            ['name' => 'Beyblade X Official 4-Point Rule'],
            [
                'generation' => 'X',
                'points_to_win' => 4,
                'spin_finish_points' => 1,
                'over_finish_points' => 2,
                'burst_finish_points' => 2,
                'xtreme_finish_points' => 3,
                'penalty_points' => 1,
                'is_official' => true,
            ]
        );

        $championshipRuleset = TournamentRuleset::firstOrCreate(
            ['name' => 'Beyblade X Grand Championship 7-Point Rule'],
            [
                'generation' => 'X',
                'points_to_win' => 7,
                'spin_finish_points' => 1,
                'over_finish_points' => 2,
                'burst_finish_points' => 2,
                'xtreme_finish_points' => 3,
                'penalty_points' => 1,
                'is_official' => true,
            ]
        );

        // 2. Active Season
        $season = Season::firstOrCreate(
            ['slug' => 'samarinda-season-2026'],
            [
                'name' => 'Komunitas Beyblade Samarinda — Musim 2026',
                'start_date' => now()->startOfYear(),
                'end_date' => now()->endOfYear(),
                'formula_config' => [
                    'tier_multipliers' => [
                        'major' => 1.5,
                        'regular' => 1.0,
                        'mini' => 0.5,
                    ],
                    'placement_points' => [
                        '1st' => 100,
                        '2nd' => 70,
                        '3rd' => 50,
                        '4th' => 30,
                        'top_8' => 15,
                        'participation' => 5,
                    ],
                ],
                'is_active' => true,
            ]
        );

        // 3. Organizer, Judge, and Bladers
        $organizer = User::firstOrCreate(
            ['email' => 'organizer@beyblade-samarinda.org'],
            [
                'name' => 'Panitia Samarinda',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

        $judge = User::firstOrCreate(
            ['email' => 'judge@beyblade-samarinda.org'],
            [
                'name' => 'Juri Utama (Head Judge)',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
        $judge->assignRole(UserRoleEnum::JUDGE->value);

        // 4. Sample Tournament Event
        $event = Event::firstOrCreate(
            ['slug' => 'samarinda-blader-championship-2026-seri-1'],
            [
                'season_id' => $season->id,
                'organizer_id' => $organizer->id,
                'name' => 'Samarinda Blader Championship 2026 — Seri 1',
                'description' => 'Turnamen resmi pembuka musim 2026 Komunitas Beyblade Samarinda. Terbuka untuk seluruh blader di Kalimantan Timur.',
                'venue_name' => 'Atrium Mall Samarinda Central Plaza (SCP)',
                'venue_address' => 'Jl. Pulau Irian No. 1, Karang Mumus, Kec. Samarinda Kota, Kota Samarinda, Kalimantan Timur 75113',
                'venue_city' => 'Samarinda',
                'venue_maps_url' => 'https://maps.google.com/?q=Samarinda+Central+Plaza',
                'registration_start_at' => now()->subDays(5),
                'registration_end_at' => now()->addDays(5),
                'event_start_at' => now()->addDays(7)->setTime(10, 0),
                'event_end_at' => now()->addDays(7)->setTime(18, 0),
                'status' => EventStatusEnum::REGISTRATION_OPEN,
                'entry_fee' => 25000.00,
                'tier_multiplier' => 1.00,
                'is_ranking_eligible' => true,
                'rules_and_regulations' => "1. Beyblade X original Takara Tomy.\n2. Menggunakan sistem deck 3 Beyblade tanpa part duplikat.\n3. Keputusan juri bersifat mutlak.",
            ]
        );

        // 5. Categories
        $openCategory = TournamentCategory::firstOrCreate(
            ['event_id' => $event->id, 'slug' => 'open-master-division'],
            [
                'ruleset_id' => $standardRuleset->id,
                'name' => 'Open Master Division',
                'max_participants' => 32,
                'format' => EventFormatEnum::SINGLE_ELIMINATION,
                'stage_config' => [
                    'type' => 'single_elimination',
                    'target_points' => 4,
                ],
                'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN,
                'tie_breaker_priority' => [
                    'match_points',
                    'head_to_head',
                    'battle_points_diff',
                    'battle_points_won',
                    'fewest_penalties',
                ],
                'call_timeout_seconds' => 180,
                'target_points' => 4,
            ]
        );

        $juniorCategory = TournamentCategory::firstOrCreate(
            ['event_id' => $event->id, 'slug' => 'junior-blader-division-u12'],
            [
                'ruleset_id' => $standardRuleset->id,
                'name' => 'Junior Blader Division (U-12)',
                'min_age' => 6,
                'max_age' => 12,
                'max_participants' => 16,
                'format' => EventFormatEnum::SINGLE_ELIMINATION,
                'stage_config' => [
                    'type' => 'single_elimination',
                    'target_points' => 4,
                ],
                'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN,
                'call_timeout_seconds' => 180,
                'target_points' => 4,
            ]
        );

        // 6. Stadiums
        $stadiumA = Stadium::firstOrCreate(
            ['event_id' => $event->id, 'name' => 'Stadium Alpha (Extreme Arena 1)'],
            [
                'assigned_judge_id' => $judge->id,
                'model_type' => 'Extreme Stadium BX-07',
                'status' => StadiumStatusEnum::AVAILABLE,
                'notes' => 'Stadium utama area panggung tengah.',
            ]
        );

        $stadiumB = Stadium::firstOrCreate(
            ['event_id' => $event->id, 'name' => 'Stadium Beta (Extreme Arena 2)'],
            [
                'assigned_judge_id' => $judge->id,
                'model_type' => 'Extreme Stadium BX-10',
                'status' => StadiumStatusEnum::AVAILABLE,
                'notes' => 'Stadium pendamping area samping.',
            ]
        );

        // 7. Blader Registrations & Sample Match
        $bladerNames = [
            ['name' => 'Rizky Pratama', 'nickname' => 'KuroX', 'email' => 'blader1@example.com'],
            ['name' => 'Dimas Arya', 'nickname' => 'D-Slash', 'email' => 'blader2@example.com'],
            ['name' => 'Fajar Sidik', 'nickname' => 'PhoenixWing', 'email' => 'blader3@example.com'],
            ['name' => 'Budi Santoso', 'nickname' => 'DriggerZ', 'email' => 'blader4@example.com'],
        ];

        $registeredBladers = [];

        foreach ($bladerNames as $index => $blader) {
            $user = User::firstOrCreate(
                ['email' => $blader['email']],
                [
                    'name' => $blader['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole(UserRoleEnum::BLADER->value);

            $registration = Registration::firstOrCreate(
                ['category_id' => $openCategory->id, 'user_id' => $user->id],
                [
                    'event_id' => $event->id,
                    'display_nickname' => $blader['nickname'],
                    'seed_number' => $index + 1,
                    'status' => RegistrationStatusEnum::CONFIRMED,
                    'deck_data' => [
                        ['blade' => 'Dran Sword', 'ratchet' => '3-60', 'bit' => 'Flat'],
                        ['blade' => 'Hells Scythe', 'ratchet' => '4-60', 'bit' => 'Ball'],
                        ['blade' => 'Wizard Rod', 'ratchet' => '5-70', 'bit' => 'Hexa'],
                    ],
                    'is_deck_locked' => true,
                    'guardian_details' => [
                        'guardian_name' => 'Wali ' . $blader['name'],
                        'guardian_phone' => '0812' . rand(10000000, 99999999),
                        'relationship' => 'Orang Tua',
                    ],
                ]
            );

            $registeredBladers[] = $registration;

            // Seed initial season ranking entry
            SeasonRanking::firstOrCreate(
                ['season_id' => $season->id, 'user_id' => $user->id],
                [
                    'total_points' => 10 * ($index + 1),
                    'rank_position' => $index + 1,
                    'tournaments_played' => 1,
                    'tournaments_won' => $index === 0 ? 1 : 0,
                    'matches_won' => 4 - $index,
                    'matches_lost' => $index,
                ]
            );
        }

        // 8. Sample Scheduled Match & Battles
        if (count($registeredBladers) >= 2) {
            $match = TournamentMatch::firstOrCreate(
                ['category_id' => $openCategory->id, 'round_number' => 1, 'match_order' => 1],
                [
                    'stadium_id' => $stadiumA->id,
                    'judge_id' => $judge->id,
                    'bracket_type' => 'winners',
                    'player1_id' => $registeredBladers[0]->id,
                    'player2_id' => $registeredBladers[1]->id,
                    'player1_score' => 4,
                    'player2_score' => 2,
                    'winner_id' => $registeredBladers[0]->id,
                    'status' => MatchStatusEnum::COMPLETED,
                    'called_at' => now()->subMinutes(20),
                    'started_at' => now()->subMinutes(15),
                    'completed_at' => now()->subMinutes(5),
                    'ruleset_snapshot' => [
                        'points_to_win' => 4,
                        'spin_finish_points' => 1,
                        'over_finish_points' => 2,
                        'burst_finish_points' => 2,
                        'xtreme_finish_points' => 3,
                    ],
                ]
            );

            // Battle 1: P1 wins with Over Finish (2 pts)
            MatchBattle::firstOrCreate(
                ['match_id' => $match->id, 'battle_number' => 1],
                [
                    'winner_id' => $registeredBladers[0]->id,
                    'finish_type' => MatchFinishTypeEnum::OVER_FINISH,
                    'points_awarded' => 2,
                    'player1_points_after' => 2,
                    'player2_points_after' => 0,
                    'is_draw' => false,
                    'client_request_id' => Str::uuid()->toString(),
                ]
            );

            // Battle 2: P2 wins with Burst Finish (2 pts)
            MatchBattle::firstOrCreate(
                ['match_id' => $match->id, 'battle_number' => 2],
                [
                    'winner_id' => $registeredBladers[1]->id,
                    'finish_type' => MatchFinishTypeEnum::BURST_FINISH,
                    'points_awarded' => 2,
                    'player1_points_after' => 2,
                    'player2_points_after' => 2,
                    'is_draw' => false,
                    'client_request_id' => Str::uuid()->toString(),
                ]
            );

            // Battle 3: P1 wins with Over Finish (2 pts) -> Total 4 (Match Won)
            MatchBattle::firstOrCreate(
                ['match_id' => $match->id, 'battle_number' => 3],
                [
                    'winner_id' => $registeredBladers[0]->id,
                    'finish_type' => MatchFinishTypeEnum::OVER_FINISH,
                    'points_awarded' => 2,
                    'player1_points_after' => 4,
                    'player2_points_after' => 2,
                    'is_draw' => false,
                    'client_request_id' => Str::uuid()->toString(),
                ]
            );
        }

        $this->command->info('Tournament seed data (Samarinda Season 2026) populated successfully!');
    }
}

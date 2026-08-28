export interface TournamentRuleset {
    id: string;
    name: string;
    generation: string;
    points_to_win: number;
    spin_finish_points: number;
    over_finish_points: number;
    burst_finish_points: number;
    xtreme_finish_points: number;
    penalty_points: number;
    custom_rules_config?: Record<string, unknown> | null;
    is_official: boolean;
    categories_count?: number;
    created_at: string;
}

export interface Season {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    end_date?: string | null;
    formula_config?: Record<string, unknown> | null;
    is_active: boolean;
    events_count?: number;
    rankings_count?: number;
    created_at: string;
}

export interface TournamentCategory {
    id: string;
    event_id: string;
    ruleset_id: string;
    name: string;
    slug: string;
    min_age?: number | null;
    max_age?: number | null;
    max_participants: number;
    format: string;
    stage_config?: Record<string, unknown> | null;
    deck_lock_policy: string;
    tie_breaker_priority?: string[] | null;
    call_timeout_seconds: number;
    target_points: number;
    ruleset?: TournamentRuleset;
    registrations_count?: number;
    matches_count?: number;
    created_at: string;
}

export interface Stadium {
    id: string;
    event_id: string;
    assigned_judge_id?: string | null;
    name: string;
    model_type: string;
    status: string;
    notes?: string | null;
    assigned_judge?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface Event {
    id: string;
    season_id?: string | null;
    organizer_id: string;
    name: string;
    slug: string;
    description?: string | null;
    venue_name: string;
    venue_address?: string | null;
    venue_city: string;
    venue_maps_url?: string | null;
    banner_path?: string | null;
    banner_url?: string | null;
    registration_start_at: string;
    registration_end_at: string;
    event_start_at: string;
    event_end_at?: string | null;
    status: string;
    entry_fee: string | number;
    tier_multiplier: string | number;
    is_ranking_eligible: boolean;
    rules_and_regulations?: string | null;
    season?: Season | null;
    organizer?: {
        id: string;
        name: string;
        email: string;
    } | null;
    categories?: TournamentCategory[];
    stadiums?: Stadium[];
    categories_count?: number;
    registrations_count?: number;
    stadiums_count?: number;
    created_at: string;
}
